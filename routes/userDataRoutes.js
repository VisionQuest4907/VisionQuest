const express = require('express');
const router=express.Router();
const User = require('../models/users');
const Log = require('../models/logs');
const Module = require('../models/training_modules');
const { requireAuth } = require('../middleware/auth');
const { validateBody, userQuizSubmitSchema } = require("../middleware/validation");



// Helper function to make user only user is able to access their data
function requireSelf(req, res, next) {
    if (!req.user) return res.status(401).json({ message: "Authentication required" });
    if (req.user.userID !== req.params.userID) {
        return res.status(403).json({ message: "Forbidden: You can only access your own profile" });
    }
    next();
}


//Get the user profile with userID
router.get('/:userID', requireAuth, requireSelf, async (req, res) => {
    try{
        const user=await User.findOne({userID: req.params.userID}).select('-password');
        if(!user) return res.status(404).json({message:'User not found'});
        res.json(user);
    }catch(err){
        res.status(500).json({message:'Error getting user', error:err.message})
    }
    
});

//Module quiz submission, user progress tracker update, and issue certifiicate if user passes quiz
router.post('/:userID/quiz', requireAuth, requireSelf,validateBody(userQuizSubmitSchema), async(req, res)=>{
    try{
        const {userID}=req.params;
        const moduleID = String(req.body.moduleID).trim(); //ensure moduleID is a string
        //Check module exists
        const moduleExists = await Module.exists({moduleID});
        if(!moduleExists) return res.status(404).json({message: 'Module not found'});
        const quizScore=req.body.quizScore;
       
        const user=await User.findOne({userID});
        
        if(!user) return res.status(404).json({error: 'User not found'});
        
        //attempt counter
        const attempts = user.quizScores.filter((attempt)=>attempt.moduleID===moduleID).length+1;
        
        user.quizScores.push({moduleID, quizScore, attemptNum:attempts});
        
        //create or update progress tracker
        let prog=user.progressTracker.find(progress=>progress.moduleID===moduleID);
        if(!prog){
            prog = {moduleID, completionStatus: 'not_started', attempts:0, lastQuizScore:null, lastCompleteDate:null};
            user.progressTracker.push(prog);
        }
        
        prog.completionStatus= quizScore>=80 ? 'completed' : 'in_progress';
        prog.attempts=attempts;
        prog.lastQuizScore=quizScore;
        if(quizScore>=80) prog.lastCompleteDate=new Date();
        
        let issuedNow=false;
        if(quizScore>=80 && !user.certificates.find((cert)=>cert.moduleID===moduleID)){
            user.certificates.push({moduleID});
            issuedNow=true;
            //Log user recieving certificate
            await Log.create({
                userRef: user._id,
                userID: user.userID,
                action: 'certificate_issued',
                moduleID,
                details: {quizScore, moduleID, dateEarned: new Date()}
            });

        }
        await user.save();
        //Log quiz being submitted
        await Log.create({
            userRef:user._id,
            userID:user.userID,
            action:'quiz_submitted',
            moduleID,
            details:{quizScore, attempts, passed:quizScore>=80}
        });
        res.json({message:'Quiz submitted', score: quizScore, passed:quizScore>=80, certificateIssued: issuedNow, progress: user.progressTracker, certificates:user.certificates});
    }catch(err){
        res.status(500).json({error:err.message})
    }
});

//Get user certificates
router.get('/:userID/certificates', requireAuth, requireSelf,async(req, res)=>{
    try{
        const user = await User.findOne({userID: req.params.userID});
        if(!user) return res.status(404).json({message: 'user not found'});
        res.json({certificates:user.certificates});
    }catch(err){
        res.status(500).json({error:err.message});
    }
});
module.exports=router;
    
