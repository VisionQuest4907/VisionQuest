const express=require('express');
const router=express.Router();
const Log= require('../models/logs');

//get user logs
router.get('/user/:userID', async(req, res)=>{
    try{
        const logs = await Log.find({ userID: req.params.userID}).sort({timestamp: -1}).limit(100);
        
        if (!logs.length) return res.json({message: 'No logs found for this user', logs:[]});
        res.json({count:logs.length, logs});

    } catch(err){
        //log error message and status response
        res.status(500).json({message: 'Error getting logs', error: err.message});
    }
    
});

//Get all logs
router.get('/', async(req, res)=>{
    try{
        const logs = await Log.find().sort({timestamp:-1}).limit(100);
        res.json({count:logs.length, logs});
    } catch(err){
        //log error message and status response
        res.status(500).json({message: 'Error getting logs', error: err.message});
    }
});
module.exports=router;
