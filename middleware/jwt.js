const User = require('../Models/User.js')
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')

const  ComparePassword = async(inputpassword,hashedpassword)=> {
    // console.log('hasdedpassword',hashedpassword)
    return await bcrypt.compare(inputpassword,hashedpassword)
    // console.log('hii',a)
}

const GenerateJWTToken = async(user) =>{
    return  jwt.sign(
        {
            sub:user.id,
            role:user.role
        },
        process.env.JWTSECRET,
        {
            expiresIn: "10m"
        }
    )
    
}

const authenticate = (req,res,next)=>{
    const authHeader = req.headers.authorization;
      if (!authHeader) {
    return res.status(401).json({ message: "No token" });
  }

    const token = authHeader.split(" ")[1];

   
     try{
        const payload =  jwt.verify(token, process.env.JWTSECRET);
        req.user = payload;
        next()
     }catch(err){
        return res.status(401).json({ message: "Invalid or expired token" });
     }
}

module.exports = {
  GenerateJWTToken,
  ComparePassword,
  authenticate
};

