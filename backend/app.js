//here we are going to configure our app related configuration

const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors= require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const AppError = require("./utils/appError");
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const postRouter = require("./routes/postRoutes")
const mongoSanitize = require('express-mongo-sanitize');


const app = express();

app.use("/",express.static("uploads")); 
//this gives permission to the browser to directly access upload folder files 

app.use(cookieParser());

app.use(helmet());

app.use(cors({
    origin: 'http://localhost:3000',  // Frontend address
    credentials: true,
 }));
 


app.use(express.static(path.join(__dirname,"public")))

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));  //it orints the result after signin 
}

app.use(express.json({limit: "10kb"}))
//when we get request from the frontend we need to use this exress.json() and we are setting the limit for the request to 10kb

// app.use('/api/v1/users/verify', (req, res) => {
//     res.send("Verify route works!");
// });



// app.use(mongoSanitize());




app.get("/test", (req, res) => {
    res.send("Test route working fine!");
});

// router.post('/verify', (req, res) => {
//     res.send("Verify route hit!");
//   });

//Routes  for users 

app.use('/api/v1/users', userRouter); 
// app.use((err, req, res, next) => {
//     // Log the full error for debugging purposes
//     console.error('Error:', err);

//     // Check if it's an Axios error and log its response
//     if (err.isAxiosError) {
//         console.error('Axios error response:', err.response);
//         console.error('Axios error message:', err.message);
//     }

//     // Log the stack trace for more details
//     console.error('Stack trace:', err.stack);

//     // Send the error response back to the client
//     res.status(err.statusCode || 500).json({
//         status: 'error',
//         message: err.message || 'Internal Server Error',
//         error: err
//     });
// });
app.use('/api/v1/posts',postRouter); 




// if you are going to /signup this url /api/v1/users will get added
// /api/v1/users/signup
//localhost:8000/api/v1/users/signup

//Routes for posts

//if any of the path we define in the request is not exist in our users route or posts route defined in this api in that case


app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
  

app.use(globalErrorHandler);


module.exports = app;