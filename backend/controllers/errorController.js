module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        // Only include stack trace in development mode for security reasons
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};


//next is needed in error middleware’s parameters to let Express treat it as an error handler, even if we don’t use it

//(req, res, next)	✅ Normal middleware
//(err, req, res, next)	✅ Error-handling middleware

// ✅ Normal Middleware:
// app.use((req, res, next) => {
//   console.log("Request came");
//   next(); // go to next
// });

// ✅ Error Handler:

// app.use((err, req, res, next) => {
//   console.error("Caught an error:", err.message);
//   res.status(500).send("Something broke!");
// });