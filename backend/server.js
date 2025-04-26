//here we are going to configure server related stuff like data base connection
const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on("uncaughtException",(err)=>{
    console.log("UNCAUGHT EXCEPTION Shutting down");
    console.log(err.name, err.message);
    process.exit(1);
    //uncaughtException — an error that slips through your code ❌
} )


dotenv.config({path: "./config.env"});
const app = require('./app');


// require('events').EventEmitter.defaultMaxListeners = 20;


// mongoose.connect(process.env.DB,()=>{
//     console.log(`Connected to database ${process.env.DB_USERNAME} 💀💀💀`);
// }) //we a re not using this because its is older version and in the new version of mongoose we cant use callback function 
mongoose.connect(process.env.DB).then(()=>{
    console.log(`Connected to database ${process.env.DB_USERNAME} 💀💀💀`)
}).catch((err)=>{
    console.log(`The error is : ${err}`);
})



// process is a global object in Node.js.
// You don’t need to import it — it’s always available.

const port = process.env.PORT || 3000;  //if it doesnt work/not available we are using 5000 port
// console.log(process.env.PORT);
// console.log(process.env.NODE_ENV);



const server = app.listen(port,()=>{
    console.log(`App running on port ${port}`);
});


process.on('unhandledRejection',(err)=>{   //DB or error failure
    console.log("UNHANDLED REJECTION!!! Shutting down ");
    console.log(err.name, err.message);
    server.close(()=>{
        process.exit(1);
    })

})