const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')


const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please add username'],
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    index: true,
  },

  email: {
    type: String,
    required: [true, 'Please provide email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid Email'],
  },

  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 8, 
    select: false, // Do not show password in query results
  },

  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // Only works on CREATE and SAVE!!!
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords do not match!'
    }
  },
  
  profilePicture: {
    type: String,
  },

  bio: {
    type: String,
    maxlength: 150,
    default: 'Hey I am using SoulNet',
  },

  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
  ],
  savePosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
  ],
  isVerified:{
    type:Boolean,
    default: false //default the user is not verified
  },
  otp:{
    type:String,
    default: null,
  },
  otpExpires:{
    type:Date,
    default: null,
  },
  resetPasswordOTP:{ 
    type: String,
    default: null,
  },
  resetPasswordOTPExpires:{
    type: Date,
    default: null,
  },
  // createdAt:{
  //   type: Date,
  //   default: Date.now,  //time at which we created the post
  // },
},
{
  timestamps: true,
}
);


// before data save in our database we encrypt the password
userSchema.pre('save',async function(next){
  if(!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password,12);
  this.passwordConfirm = undefined;
  next(); 
})


//Whenever we run .save() on a user — this pre('save') code always runs.
// But inside that, we use isModified('password') to decide:
// 12 = number of hashing rounds; it makes your password harder to crack without slowing down performance.


// ✅ userSchema.pre('save', async function(next) {
//   This tells Mongoose:
  
//   "Before saving any user, run this function."
//Internally calls:
// const user = new User({...});
// await user.save(); // This is the important part, before password encryption


userSchema.methods.correctPassword = async function (userPassword, databasePassword){
  return await bcrypt.compare(userPassword, databasePassword)
}

const User = mongoose.model("User", userSchema); //This creates a model named "User" based on the userSchema you've defined.
module.exports = User;  //The User model is mapped to the users collection in MongoDB


