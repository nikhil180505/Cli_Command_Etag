const express = require('express');
const User = require('./Models/User.js')
const jwt = require("jsonwebtoken");

// const jwt1 = require('./middleware/jwt.js')
const userRoutes = require('./Routes/UserRoutes.js')
const cookieParser =  require("cookie-parser");
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs : 1000 * 60,
    max : 5,
    message:'Too many requests. Please try again after some time'
})

require("dotenv").config(); // 👈 MUST be first

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(limiter)
// console.log(User.email," ",User.passwordHash)
app.use('/',userRoutes)

app.post("/refresh", (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.REFRESH_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);

        const { userId, role } = decoded;
        // console.log(userId," udhgiu  ",role)
    const newAccessToken = jwt.sign(
      { id: userId,
        role:role
       },
      process.env.JWTSECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  });
});



app.listen(process.env.PORT,() => {
    console.log(`Server started on port ${process.env.PORT}`)
});
