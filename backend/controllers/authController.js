const User = require("../models/userModel");
const AppError = require('../utils/appError');
const generateOtp = require("../utils/generateOtp");
const catchAsync = require("../utils/catchAsync");
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require("path");
const hbs = require('hbs');
const sendEmail = require("../utils/email");


// templeteName = like 'otpTemplate.hbs'

// replacements = { username: "Ajay", otp: "123456" }

const loadTemplete = (templeteName, replacements)=>{  
    const templetePath = path.join(__dirname,"../emailTemplete",templeteName);   //backend/emailTemplete/otpTemplate.hbs
    const source = fs.readFileSync(templetePath,'utf-8');  //you're telling the program to interpret the file contents as UTF-8 encoded text.
    const templete = hbs.compile(source);
    return templete(replacements);
}


//Token creation
const signToken = (id) =>{ //users id is sent and stored in the jwt token 
    return jwt.sign({id},process.env.JWT_SECRET,{   //creates a JWT token with a secret key mentioned in .env file
        expiresIn:"1d",
    });
}
// console.log('JWT_COOKIE_EXPIRES_IN:', process.env.JWT_COOKIE_EXPIRES_IN);
// console.log('Converted to Number:', (process.env.JWT_COOKIE_EXPIRES_IN));


// // const expiresIn =const expiresIn = new Date(Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000);

// console.log('Calculated expiration date:', expiresIn);

const createSendToken = (user,statusCode,res,message)=>{
    const token  = signToken(user._id)
    const cookieOptions = {
        expiresIn: new Date(Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax",
    };
    res.cookie("token",token , cookieOptions),
    user.password = undefined;
    user.otp = undefined;
    res.status(statusCode).json({
        status: "success",
        message,
        token,
        data:{
            user,
        },
    })
}


exports.signup = catchAsync(async(req,res,next)=>{
    const { email, password, passwordConfirm, username } = req.body;
    const existingUser = await User.findOne({email});

    if(existingUser){
        return next(new AppError("Email already registerd",400))
    }
    //if the above condition didnt execute it will run 
    const otp = generateOtp(); 
    const otpExpires = Date.now() + 24*60*60*1000;  //24 hours , otp will be expires after 24 hours
    const newUser = await User.create({   //creates a new user and saves it immediately in the database
        username,
        email,
        password,
        passwordConfirm,
        otp,
        otpExpires,
    });
    
    // res.status(200).json({
    //     status: "success",
    //     data:{
    //         user:newUser,
    //     }
    // })

    const htmlTemplate = loadTemplete('otpTemplete.hbs',{
        title: "Otp Verification",
        username: newUser.username,
        otp,
        message: "Your one-time password (OTP) for account verification is : "
    });
    try{
        await sendEmail({
            email: newUser.email,
            subject: "OTP for email Verification",
            html: htmlTemplate,
        }) 
        createSendToken(newUser,200,res,"Registration Successful. Check your email for otp verification")
    }catch(error){
        console.error("Email sending failed:", error); // Log the error
        await User.findByIdAndDelete(newUser.id);
        return next(new AppError("There is an error creating the account. Please try again later!", 500))
    }

})


exports.verifyAccount = catchAsync(async(req,res,next)=>{
    const {otp} = req.body;  
    if(!otp){
        return next(new AppError("Otp is required for verification ", 400));
    }

    const user = req.user;    //req.user is fetched using that JWT from cookie (from isAuthenticated middleware)
    if(user.otp !=otp){
        return next(new AppError("Invalid OTP",400));
    }

    if(Date.now() > user.otpExpires){
        return next(new AppError("Otp has expired. Please request a new Otp",400))
    }


    user.isVerified = true;
    // user.otp = undefined 
    // user.otpExpires = undefined;


    await user.save({validateBeforeSave: false});


    createSendToken(user ,200 , res,"Email has been verified" )
})


exports.resendOtp = catchAsync(async(req,res,next)=>{
    const {email} = req.user;
    if(!email){
        return next(new AppError("Email is required ", 400));
    }
    const user = await User.findOne({email}); 

    if(!user){
        return next(new AppError("User not found", 404));
    }

    if(user.isVerified){
        return next(new AppError("This Account Already verified",400));
    }

    const otp = generateOtp();
    const otpExpires = Date.now() + 24*60*60*1000;

    user.otp = otp;
    user.otpExpires = otpExpires;

    await user.save({validateBeforeSave: false})

    //By default, when you do user.save(), Mongoose checks all validation rules you wrote in the schema.
    //But in some situations, like OTP updates, you only want to change a few things — 
    // and you don’t want Mongoose to scream about the other stuff 😤

    const htmlTemplate = loadTemplete('otpTemplete.hbs',{
        title: "Otp Verification",
        username: user.username,
        otp,
        message: "Your one-time password (OTP) for account verification is : "
    });

    try{
        await sendEmail({
            email: user.email,
            subject: "Resend OTP for email Verification",
            html: htmlTemplate,
        })

        res.status(200).json({
            status: "Success",
            message: "A New Otp is Send to Your Email"
        });
    }
    catch(error){
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save({validateBeforeSave: false});
        return next(new AppError("There is an error sending email. Try again later!",500))
    }

})


exports.login = catchAsync(async(req,res,next)=>{
    const {email,password} = req.body;
    if(!email || !password){
        return next(new AppError("Please Provide email and password",400));
    }

    const user = await User.findOne({email}).select('+password'); 
    //The +password tells Mongoose: "Hey, include the password field even though it's set to select: false in the schema."

    //here we cant directly compare the password , cause password which we are storing is encrypted
    if(!user ||  !(await user.correctPassword(password,user.password))){
        return next(new AppError("Incorrect Email or Password", 401));
    }

    createSendToken(user, 200 , res, "Login Successful");

})


exports.logout = catchAsync(async(req,res,next)=>{
    res.cookie("token","loggedout",{
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly:true,
        secure: process.env.NODE_ENV === "production",
    })
    res.status(200).json({
        status: "success",
        message: "Logged out Successfully."
    })
})

exports.forgetPassword = catchAsync(async(req,res,next)=>{
    const {email} = req.body;
    const user = await User.findOne({email});

    if(!user){
        return next(new AppError("No User Found",404));
    }

    const otp = generateOtp();
    const resetExpires = Date.now() + 5 * 60 * 1000;  // after 5 minutes otp will expire

    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = resetExpires;

    await user.save({validateBeforeSave: false});

    const htmlTemplate = loadTemplete("otpTemplete.hbs",{
        title: "Reset Password OTP",
        username: user.username,
        otp,
        message: "Your Password Reset OTP is ",
    });


    try{
        await sendEmail({
            email: user.email,
            subject: "Password Reset Otp (valid for 5-minutes)",
            html: htmlTemplate,
        })
        res.status(200).json({
            status: "success",
            message: "Password Reset OTP into your email"
        });
    }
    catch(error){
        console.log(error)
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpires = undefined;
        await user.save({validateBeforeSave: false});
        return next(new AppError("There was an error sending the email. Try again later!", 500))
    }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    const { email, otp, password, passwordConfirm } = req.body;

    // Check if passwords match
    if (password !== passwordConfirm) {
        return next(new AppError("Password and Confirm Password do not match", 400));
    }

    const user = await User.findOne({
        email,
        resetPasswordOTP: otp,
        resetPasswordOTPExpires: { $gt: Date.now() },
    });

    if (!user) {
        return next(new AppError("Invalid OTP or OTP has expired", 400));
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;

    await user.save();

    createSendToken(user, 200, res, "Password Reset Successfully");
});



exports.changePassword = catchAsync(async(req, res, next) => {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;
    const { email } = req.user;

    // Fetch user from database
    const user = await User.findOne({ email }).select("+password");

    // If user not found, return an error
    if (!user) {
        return next(new AppError("User not Found", 404));
    }

    // Check if current password is correct
    if (!(await user.correctPassword(currentPassword, user.password))) {
        return next(new AppError("Incorrect Current Password", 400));  // Incorrect current password
    }

    // Check if new password and confirm password match
    if (newPassword !== newPasswordConfirm) {
        return next(new AppError("New Password and Confirm Password are not the same", 400));
    }

    // Change the password
    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;

    // Save the user after changing password
    await user.save();

    // Send success response with token
    createSendToken(user, 200, res, "Password Changed Successfully");
});
