require("dotenv").config(); //env done
const express = require("express");  //installed
const app = express(); //installed
const path = require("path"); //installed
const cors = require("cors"); //installed
const corsOptions = require("./config/corsOptions"); //Tested
const {logger} = require("./middleware/logEvents"); //Added
const errorHandler = require("./middleware/errorHandler"); //added
const mongoose = require("mongoose"); //installed
const connectDB = require("./config/dbConn"); //written
const PORT = process.env.PORT || 3000; //setup to port 3000

//Connect to mongoDB
connectDB();

//Event Logger and CORS settup
app.use(logger);
app.use(cors(corsOptions));

//Builtin Middleware
app.use(express.urlencoded({extended:false})) //Used to handle urlencoded data
app.use(express.json()); //parses incoming requests with JSON payloads
app.use(express.static(path.join(__dirname, "/public")));

//Routes
app.use("/states", require("./routes/states"));
app.use("/", require("./routes/root"));

//Handle un-defined routes
app.all('/*', (req, res) => {
    console.log("Attempted to access unknown content");
    if(req.accepts('text/html')){
    res.status(404).sendFile(path.join(__dirname,  "views", "404.html"));
    } else if(req.accepts('json')){
    res.status(404).json({error: "404  Not Found"});
    }
});

app.use(errorHandler);

mongoose.connection.once("open", () =>{
    console.log("Connected to mongoDB");
    app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`));
});
