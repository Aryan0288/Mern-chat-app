const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcryptjs');
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

// create profile 
app.get('/profile', (req, res) => {
    console.log("I am in profile...post");
    const { token } = req.cookies;
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if (err) throw err;
        res.json(userData);
    });
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const foundUser = await User.findOne({ $or: [{ username }, { email: username }] });
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


app.listen(4040);