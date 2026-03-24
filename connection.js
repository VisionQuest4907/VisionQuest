const mongoose = require("mongoose");
const {MONGO_URI} = require("./config/env");
async function connectiontoDB(){
    try{
        await mongoose.connect(MONGO_URI);
        console.log("Connected to Database");

    } catch (err){
        console.error("Connection failed",err.message);
        process.exit(1);
    }
}

module.exports=connectiontoDB;
