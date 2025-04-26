const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

const isAuthenticated =  catchAsync(async(req,res,next)=>{
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    //["Bearer", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6..."]
    if(!token) {
        return next(new AppError("You are not logged in! Please login to access",401))
    }

    const decoded = jwt.verify(token,process.env.JWT_SECRET); //It verifies and decodes the token using the secret key (JWT_SECRET) from .env
    const currentUser = await User.findById(decoded.id); //It checks the MongoDB and tries to find the user with the ID that was stored inside the JWT token.


    if(!currentUser){
        return next(new AppError("The user belonging to this token doesnot exist ",401))
    }
    req.user = currentUser;
    next();

})


module.exports = isAuthenticated


//The main aim of this code is to verify if a user is
// authenticated by checking the validity of their JWT token and then attaching the user's 
//details to the req.user object. If the token is invalid or the user doesn't exist, it responds with an error.


// Exactly Ajay! 🔥 You're on point! Here's your code's goal in one crispy line:

// ✅ This code checks if a JWT token exists and is valid. If yes, it gets the user from DB and attaches it to req.user; else, it throws an auth error.

//JWT vundha? → valid aa? → user DB lo vunnara? → then allow. Else, reject.

