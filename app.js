const express = require('express');
const User = require('./Models/User.js')
const jwt = require('./middleware/jwt.js')
const userRoutes = require('./Routes/UserRoutes.js')

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs : 1000 * 60,
    max : 5,
    message:'Too many requests. Please try again after some time'
})

require("dotenv").config(); // 👈 MUST be first

const app = express();
app.use(express.json());
app.use(limiter)
// console.log(User.email," ",User.passwordHash)
app.use('/',userRoutes)


app.listen(process.env.PORT,() => {
    console.log(`Server started on port ${process.env.PORT}`)
});
