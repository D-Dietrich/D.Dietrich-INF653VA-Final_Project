//Npm modules
const {format} = require("date-fns");
const {v4: uuid} = require("uuid");

//Core modules
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");


const logEvents = async (message, logName) =>{
    const dataTime = `${format(new Date(), "yyyy MM dd\tHH:mm:ss")}`;
    const logItem = `${dataTime} \t ${uuid()} \t ${message} \n`;
    //console.log(logItem);


try{
    if (!fs.existsSync(path.join(__dirname,"..", "logs"))){
        await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
    }

    await fsPromises.appendFile(path.join(__dirname, "..", "logs", logName),
    logItem
    );
} catch (error) {
    console.log(error);
}
};

const logger = (req, res, next) =>{
    logEvents(`${req.method}\t ${req.headers.origin} \t ${req.url}`, 
    "reqLog.txt"
    );
    //console.log(`${req.method}\t ${req.path}`);
    next();

};

module.exports ={logger, logEvents};