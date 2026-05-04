const express = require('express');
const router=express.Router();
const User = require('../models/users');
const Log = require('../models/logs');
const Module = require('../models/training_modules');
const { requireAuth } = require('../middleware/auth');
const { validateBody, userQuizSubmitSchema, updateProfileSchema } = require("../middleware/validation");



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
        await Log.create({
            userRef: user._id,
            userID: user.userID,
            action: 'profile_viewed',
            details: { accessedAt: new Date() }
        });
        res.json(user);
    }catch(err){
        res.status(500).json({message:'Error getting user', error:err.message})
    }
    
});

//Update user profile
router.put('/:userID', requireAuth, requireSelf, validateBody(updateProfileSchema), async(req, res)=>{
    try{
        const {userID}=req.params;
        const {userName, firstName, lastName, phoneNumber,email, password}=req.body;
        const user=await User.findOne({userID});
        if(!user) return res.status(404).json({message:'User not found'});
        const changes=[];
        if(userName!==undefined && userName.trim()!==user.userName){
            user.userName=userName.trim();
            changes.push('userName');
        }
        if(firstName!==undefined){
            user.firstName=firstName.trim();
            changes.push('firstName');
        }
        if(lastName!==undefined){
            user.lastName=lastName.trim();
            changes.push('lastName');
        }
        if(phoneNumber!==undefined){
            user.phoneNumber=phoneNumber.trim();
            changes.push('phoneNumber');
        }
        if(email!==undefined && email.toLowerCase().trim()!==user.email){
            const emailExists = await User.findOne({email: email.toLowerCase().trim()});
            if(emailExists && emailExists.userID !== user.userID) return res.status(400).json({message:'Email already in use'});
            user.email=email.toLowerCase().trim();
            changes.push('email');
        }
        if(password!==undefined){
            if(password.length<12) return res.status(400).json({message:'Password must be at least 12 characters'});
            user.password=password;
            changes.push('password');
        }
        if(changes.length===0) return res.status(400).json({message:'No changes detected'});
        await user.save();
        
        if(changes.includes('password')) {
            await Log.create({
                userRef: user._id,
                userID: user.userID,
                action: "password_changed",
                details: {dateChanged: new Date()}
            });
        }


        const notPasswordChange=changes.filter(f=> f !== 'password');
        if(notPasswordChange.length >0){
            await Log.create({
                userRef:user._id,
                userID: user.userID,
                action: 'profile_edited',
                details:{fieldsChanged: notPasswordChange}
            });
        }

        res.json({message:'Profile updated', fieldsChanged: changes});
    }catch(err){
        res.status(500).json({message:'Error updating profile', error:err.message});
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
            user.progressTracker.push({
                moduleID, 
                completionStatus: "not_started",
                attempts: 0,
                lastQuizScore: null,
                lastCompleteDate: null

            });

            prog = user.progressTracker[user.progressTracker.length-1];
        }
        
        prog.completionStatus= quizScore>=80 ? 'completed' : 'in_progress';
        prog.attempts=attempts;
        prog.lastQuizScore=quizScore;
        prog.lastCompleteDate=quizScore>=80 ? new Date() : null;
        
        let issuedNow=false;
        if(quizScore>=80 && !user.certificates.find((cert)=>cert.moduleID===moduleID)){
            user.certificates.push({moduleID, userID:user.userID});
            issuedNow=true;
            //Log user recieving certificate
            await Log.create({
                userRef: user._id,
                userID: user.userID,
                action: 'certificate_issued',
                moduleID,
                details: {quizScore, dateEarned: new Date()}
            });
            
        }

        if(quizScore>=80){
            await Log.create({
                userRef: user._id,
                userID:user.userID,
                action:'module_completed',
                moduleID,
                details:{quizScore, attempts}


            });
        }

        

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
        if(lastActive) {
            lastActive.setHours(0, 0, 0, 0);
        }
        let daysBetween=null;
        if (lastActive){
            daysBetween = Math.round((today - lastActive) / (1000 * 60 * 60 * 24));
        }
        if (daysBetween!==null && daysBetween < 0) {
            daysBetween = 0;
        }
        if(daysBetween === null || daysBetween > 1){
            user.currentStreak = 1;
        } else if(daysBetween === 1){
            user.currentStreak += 1;
        } else if(daysBetween === 0){
            //Already counted the streak for today
        }

        if(user.currentStreak > user.longestStreak){
            user.longestStreak = user.currentStreak;
        }
        user.lastActiveDate = today;



        await user.save();
        //Log quiz being submitted
        await Log.create({
            userRef:user._id,
            userID:user.userID,
            action:'quiz_submitted',
            moduleID,
            details:{quizScore, attempts, passed:quizScore>=80}
        });
        res.json({message:'Quiz submitted', score: quizScore, passed:quizScore>=80, certificateIssued: issuedNow, progress: user.progressTracker, certificates:user.certificates, currentStreak:user.currentStreak, longestStreak: user.longestStreak, lastActiveDate: user.lastActiveDate});
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

router.get('/:userID/certificates/:moduleID', requireAuth, requireSelf, async(req,res)=>{
    try{
        const {userID, moduleID}=req.params;
        const user = await User.findOne({userID}).select('certificates userID');
        if(!user) return res.status(404).json({message: 'User not found'});
        const haveCert = (user.certificates || []).some(cert => cert.moduleID === moduleID);
        if(!haveCert) return res.status(403).json({message: 'Certificate not earned for this module'});
        await Log.create({
            userRef: user._id,
            userID: user.userID,
            action: 'certificate_viewed',
            moduleID,
            details: {dateAccessed: new Date()}
        });
        return res.json({moduleID, earned:true});

    } catch(err){
        res.status(500).json({message: 'Error checking for certificate', error:err.message});
    }
});

module.exports=router;
    
