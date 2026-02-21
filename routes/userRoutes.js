const express = require('express');
const router=express.Router();
const User = require('../models/users');
const Log = require('../models/logs');

//Register a new user
router.post('/register', async (req, res) => {
    try {
        const { userName, email, password } = req.body;
        const existingUser = await User.findOne({ email});
        if (existingUser) return res.status(400).json({ message:'User already exists' });
        const user = await User.create({ userName, email, password });
        await Log.create({
            userRef: user._id,
            userID: user.userID,
            action: 'user_registration_successful',
            details: { email: user.email}
        });
        res.status(201).json({ message: 'User registered successfully', userID: user.userID });

    }catch(err){
        res.status(500).json({message: 'Error when trying to register user', error: err.message});
    }
});

//Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email});
        if(!user){ 
            //Log user not found failed login attempt
            await Log.create({
            userRef: null,
            userID: 'unknown',
            action: 'failed_login_attempt',
            details: {email, reason: 'no_user_found'}
            });
            return res.status(401).json({message: "Login credentials are invalid"});
        }

        //Log incorrect password failed login attempt
        const isPasswordValid = await user.comparePassword(password);
        if(!isPasswordValid){
            await Log.create({
                userRef: user._id,
                userID: user.userID,
                action: 'failed_login_attempt',
                details: {email, reason: 'incorrect_password'}
            });

            return res.status(401).json({message:"Login credentials are invalid"});
        }
        
        //log user logging in
        await Log.create({
            userRef: user._id,
            userID: user.userID,
            action: 'login_successful',
            details: {email}
        });
        res.status(200).json({message:"Login successful",userID:user.userID, userName:user.userName});

    } catch(err){
        res.status(500).json({message: 'Error when trying to login user', error: err.message});
    }
});

//Get the user profile with userID
router.get('/:userID', async (req, res) => {
    try{
        const user=await User.findOne({userID: req.params.userID}).select('-password');
        if(!user) return res.status(404).json({message:'User not found'});
        res.json(user);
    }catch(err){
        res.status(500).json({message:'Error getting user', error:err.message})
    }
    
});

//Module quiz submission, user progress tracker update, and issue certifiicate if user passes quiz
router.post('/:userID/quiz', async(req, res)=>{
    try{
        const {userID}=req.params;
        const {moduleID,quizScore}=req.body;
        const user=await User.findOne({userID});
        if(!user) return res.status(404).json({error: 'User not found'});
        const attempts = user.quizScores.filter(attempt=>attempt.moduleID===moduleID).length+1;
        
        user.quizScores.push({moduleID, quizScore, attemptNum:attempts});
        //update progress tracker
        const prog=user.progressTracker.find(progress=>progress.moduleID===moduleID) || {moduleID, completionStatus: 'not_started', attempts:0, lastQuizScore:null, lastCompleteDate:null};
        prog.completionStatus=quizScore>=80 ? 'completed' : 'in_progress';
        prog.attempts=attempts;
        prog.lastQuizScore=quizScore;
        if(quizScore>=80) prog.lastCompleteDate=new Date();
        if(!user.progressTracker.find(progress=>progress.moduleID===moduleID)){
            user.progressTracker.push(prog);
        }
        if(quizScore>=80 && !user.certificates.find(cert=>cert.moduleID===moduleID)){
            user.certificates.push({moduleID});
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
        res.json({message:'Quiz submitted', score: quizScore, passed:quizScore>=80, certificateIssued: quizScore>=80, progress: user.progressTracker, certificates:user.certificates});
    }catch(err){
        res.status(500).json({error:err.message})
    }
});

//Get user certificates
router.get('/:userID/certificates', async(req, res)=>{
    try{
        const user = await User.findOne({userID: req.params.userID});
        if(!user) return res.status(404).json({message: 'user not found'});
        res.json({certificates:user.certificates});
    }catch(err){
        res.status(500).json({error:err.message});
    }
});
module.exports=router;
    
