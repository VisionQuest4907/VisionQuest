require('dotenv').config();
const mongoose=require('mongoose');
async function connectiontoDB(){
    try{
        await mongoose.connect(process.env.DB_URI,{
            dbName:process.env.DB_NAME
        });
        console.log("Connected to Database");

    } catch (err){
        console.error("Connection failed",err);
    }
}
connectiontoDB();
module.exports=connectiontoDB;
