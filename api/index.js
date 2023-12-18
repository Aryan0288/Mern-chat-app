const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const ws = require('ws');

const Message = require('./models/Message');
const User = require('./models/User');
const MONGO_URL = 'mongodb+srv://chatapp:dpJbj0tFUrqVcQU6@cluster0.ttefoc8.mongodb.net/?retryWrites=true&w=majority';



dotenv.config();

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("connect to database");
    } catch (err) {
        console.log("error occurr because of .env file " + err);
    }
}
connect();



// const connectToDataBase = async()=>{

//     try{
//         await mongoose.connect(MONGO_URL);
//         console.log("I am connected to database");
//     }catch(err){
//         console.log("error occur: "+err)
//     }
// }

// connectToDataBase(MONGO_URL);

const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);


const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
}))

app.get('/test', (req, res) => {
    res.json('test ok');
});
console.log("Hello ji I am a Index.js file in api folder");

async function getUserDataFromRequest(req) {
    return new Promise((resolve, reject) => {
        const token = req.cookies?.token;
        if (token) {
            jwt.verify(token, jwtSecret, {}, (err, userData) => {
                if (err) throw err;
                resolve(userData);
            });
        }
        else {
            reject('no token');
        }
    })
}

app.get('/messages/:userId', async (req, res) => {
    const {userId}=req.params;
    const userData= await getUserDataFromRequest(req);
    const ourUserId=userData.userId;

    const messages=await Message.find({
        sender:{$in:[userId,ourUserId]},
        recipient:{$in:[userId,ourUserId]},
    }).sort({createdAt:-1})

    res.json(messages);
})

// create profile 
app.get('/profile', (req, res) => {
    const token = req.cookies?.token;
    if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
            if (err) throw err;
            res.json(userData);
        });
    }else{
        res.status(401).json('no token');
    }
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // const foundUser = await User.findOne({ $or: [{ username }, { email: username }] });
        let foundUser;
        // Check if the entered username is an email address
        if (username.includes('@')) {
            foundUser = await User.findOne({ email: username });
        } else {
            foundUser = await User.findOne({ username });
        }

        if (foundUser) {
            const passOk = bcrypt.compareSync(password, foundUser.password);
            if (passOk) {
                jwt.sign({ userId: foundUser._id, username, email: foundUser.email }, jwtSecret, {}, (err, token) => {
                    res.cookie('token', token, { sameSite: 'none', secure: true }).json({
                        id: foundUser._id,
                        username,
                        email: foundUser.email,
                    });
                })
                // console.log("the username is "+foundUser.username);
            } else {
                res.status(401).json({ message: 'Invalid password' });
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

app.post('/register', async (req, res) => {
    console.log("I am inside register");
    const { username, password, email } = req.body;
    try {
        // Check if the email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // Email already registered
            return res.status(400).json({ message: 'Email already registered' });
        }

        const hashPassword = bcrypt.hashSync(password, bcryptSalt);
        const createdUser = await User.create({
            username: username,
            password: hashPassword,
            email: email,
        });
        jwt.sign({ userId: createdUser._id }, jwtSecret, {}, (err, token) => {
            if (err) {
                throw err;
            }
            res.cookie('token', token, { sameSite: 'none', secure: true }).status(201).json({
                _id: createdUser._id,
                email,
            });
        });

        console.log("User Created");

    } catch (err) {
        if (err) throw err;
        res.status(500).json('ok');
    }

})


const server = app.listen(4040);

const wss = new ws.WebSocketServer({ server });
wss.on('connection', async (connection, req) => {

    // read username and id from the cookie for this connection
    const cookies = req.headers.cookie;
    if (cookies) {
        const tokenCookieString = cookies.split(';').find(str => str.startsWith('token='));
        if (tokenCookieString) {
            const token = tokenCookieString.split('=')[1];
            if (token) {
                jwt.verify(token, jwtSecret, {}, async (err, UserData) => {
                    if (err) throw err;

                    const { userId, username } = UserData;

                    try {
                        const user = await User.findById(userId);
                        if (user) {
                            connection.userId = userId;
                            connection.username = user.username; // Use the actual username from the database
                            // console.log("The username is " + user.username);
                        }
                    } catch (error) {
                        console.error(error);
                    }

                    // connection.userId=userId;
                    // connection.username=username;
                    // console.log("the username is "+username);
                })
            }
        }
    }


    connection.on('message', async (message) => {
        const messageData = JSON.parse(message.toString());

        const { recipient, text } = messageData;
        if (recipient && text) {
            const MessageDoc = await Message.create({
                sender: connection.userId,
                recipient,
                text,
            });

            [...wss.clients]
                .filter(c => c.userId === recipient)
                .forEach(c => c.send(JSON.stringify({
                    text,
                    sender: connection.userId,
                    recipient,
                    _id: MessageDoc._id,
                })));
        }
    });


    // notify everyone about online people (when someone connects)
    [...wss.clients].forEach(client => {
        client.send(JSON.stringify({
            online: [...wss.clients].map(c => ({ userId: c.userId, username: c.username })),
        }))
    })

});
