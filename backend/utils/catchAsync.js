module.exports = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};


//when we write a controller function , controller function is an async await function

//next() will contain the error only when .catch(next) is triggered by a rejected async function. 💥