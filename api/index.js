const express =require('express');
const mongoose=require('mongoose');
const dotenv=require('dotenv');
const jwt=require('jsonwebtoken');
const cors=require('cors');
const User=require('./models/User');
const MONGO_URL='mongodb+srv://chatapp:dpJbj0tFUrqVcQU6@cluster0.ttefoc8.mongodb.net/?retryWrites=true&w=majority';

dotenv.config();

const connect=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("connect to database");
    }catch(err){
        console.log("error occurr because of .env file "+err);
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

const jwtSecret=process.env.JWT_SECRET;

const app=express();
app.use(express.json());

app.use(cors({
    credentials:true,
    origin:process.env.CLIENT_URL,
}))

app.get('/test', (req,res)=>{
    res.json('test ok');
});
console.log("Hello ji I am a Index.js file in api folder");



app.post('/register',async (req,res)=>{
    console.log("I am inside register");
    const {username,password}=req.body;
     try{
         const createdUser = await User.create({username,password});
         jwt.sign({userId:createdUser._id},jwtSecret,{},(err,token)=>{
            if(err) throw err;
            res.cookie('token',token).status(201).json({
                _id:createdUser._id,
            });
         });

         console.log("User Created");
     }catch(err){
        if(err) throw err;
        res.status(500).json('ok');
    }

})


app.listen(4040);