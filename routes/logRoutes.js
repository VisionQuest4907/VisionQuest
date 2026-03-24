const express=require('express');
const router=express.Router();
const Log= require('../models/logs');
const { requireAuth, requireRole } = require("../middleware/auth");
function requireSelf(req, res, next) {
    if (!req.user) return res.status(401).json({ message: "Authentication required" });
    if (req.user.userID !== req.params.userID) {
        return res.status(403).json({ message: "Forbidden: You can only access your own profile" });
    }
    next();
}
//get user logs
router.get('/user/:userID', requireAuth, requireSelf,async(req, res)=>{
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
router.get('/', requireAuth, requireRole("admin"), async(req, res)=>{
    try{
        const logs = await Log.find().sort({timestamp:-1}).limit(100);
        await Log.create({
            userRef: req.user._id,
            userID: req.user.userID,
            action: "admin_viewed_logs",
            details:{limit:100, scope:"all"}
        });
        res.json({count:logs.length, logs});
    } catch(err){
        //log error message and status response
        res.status(500).json({message: 'Error getting logs', error: err.message});
    }
});
module.exports=router;
