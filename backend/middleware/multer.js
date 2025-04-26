const multer = require('multer');

const storage = multer.memoryStorage();


const upload = multer({storage});  //creating an upload middleware to take image input


module.exports = upload;