const express = require('express');
const User = require('./Models/User.js')
const jwt = require('./jwt.js')
require("dotenv").config(); // 👈 MUST be first

const app = express();
app.use(express.json());
// console.log(User.email," ",User.passwordHash)
app.post('/login',async (req,res)=>{
const { email, password } = req.body;
 if(!email || !password) return res.status(401).json({ message: 'Email and password both are required'});
if(email != User.email) return res.status(401).json({ message: "Invalid credentials" });
// console.log(email," ",password)
const valid = await jwt.ComparePassword(password,User.passwordHash);
if(valid) return res.status(401).json({ message:  'Invalid password'});

const token = jwt.GenerateJWTToken(User)
res.status(200).json(token);
})

app.get('/user',jwt.authenticate,(req,res)=>{
    res.status(201).json(User.email)
})
app.listen(process.env.PORT,() => {
    console.log(`Server started on port ${process.env.PORT}`)
});
