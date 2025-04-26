const DataUriParser = require('datauri/parser');


const path = require('path')

const getDataUri = (file)=>{
    const parser = new DataUriParser();

    const extName = path.extname(file.originalname).toString();

    return parser.format(extName,file.buffer).content;  //it returns an objectr and we are taking content part from the object
}

module.exports = getDataUri



