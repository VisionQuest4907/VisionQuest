const express=require('express');
const router=express.Router();
const Module= require('../models/training_modules');
const { requireAuth } = require("../middleware/auth");
const { validateBody, moduleGradeSchema } = require("../middleware/validation");
const Log = require('../models/logs');

//get modules
router.get('/', requireAuth, async(req, res)=> {
    try{
        const modules=await Module.find().select('moduleID title description order tags estTime').sort({order: 1});
        
        res.json({modules});

    } catch(err){
        res.status(500).json({message: 'Error getting modules', error: err.message});
    }
});

//get module with moduleID

router.get('/:moduleID', requireAuth,async(req, res)=>{
    try{
        const module=await Module.findOne({moduleID: req.params.moduleID});
        if(!module) return res.status(404).json({error: 'Module not found'});
        await Log.create({
            userRef: req.user._id,
            userID: req.user.userID,
            action: "module_started",
            moduleID: req.params.moduleID,
            details:{title: module.title}
        });
        res.json({
            moduleID: module.moduleID,
            title: module.title,
            description: module.description,
            order: module.order,
            tags: module.tags,
            estTime: module.estTime,
            content: module.content || [],
            questions: module.moduleQuestions.length
        });
    } catch(err){
        res.status(500).json({message: 'Error getting module', error: err.message});
    }
});
//Get module quiz questions
router.get('/:moduleID/questions', requireAuth, async(req,res)=>{
    try{
        const module=await Module.findOne({moduleID: req.params.moduleID});
        if(!module) return res.status(404).json({error: 'Module not found'});
        const questions = module.moduleQuestions.map((quest, ind)=>({
            questNum: ind+1,
            question: quest.question,
            multipleAnswers: quest.multipleAnswers
        }));
        res.json({questions});

    } catch(err) {
        res.status(500).json({message: 'Error getting module questions', error: err.message});

    }
});

//Receive correct module question answers and quiz grade
router.post('/:moduleID/grade', requireAuth, validateBody(moduleGradeSchema), async(req,res)=>{
    try{
        
        const module=await Module.findOne({moduleID: req.params.moduleID});
        if(!module) return res.status(404).json({error: 'Module not found'});

        const {answers}=req.body;

        //Check if type is array
        if(!Array.isArray(answers)) return res.status(400).json({message: 'Answers must be in an array form'});
        
        //Ensure that all questions are answered
        if(answers.length!==module.moduleQuestions.length) return res.status(400).json({message: `You must provide answers for all ${module.moduleQuestions.length} questions`});
        
        //Ensure that each question has a set of 4 answer choices
        for (const q of module.moduleQuestions) {
            if (q.answerChoices.length !== 4) {
                return res.status(400).json({message: 'Each question must have 4 answer choices'});
            }
        }

        let correct=0;
        const score =[];

        module.moduleQuestions.forEach((quest,ind)=>{
            const correctAnswer = quest.correctAnswerIndex===answers[ind];
            if(correctAnswer) correct++;
            score.push({questNum: ind+1, correct: correctAnswer});
        });
        const quizScore = Math.round(correct/module.moduleQuestions.length*100);
        res.json({quizScore, passed:quizScore>=80, score});

    } catch(err) {
        res.status(500).json({message: 'Error getting module answers', error: err.message});
    }
});

module.exports=router;
