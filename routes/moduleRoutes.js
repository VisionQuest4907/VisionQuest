const express=require('express');
const router=express.Router();
const Module= require('../models/training_modules');

//get modules
router.get('/', async(req, res)=> {
    try{
        const modules=await Module.find().select('moduleID title description materialURL');
        res.json({modules});

    } catch(err){
        res.status(500).json({message: 'Error getting modules', error: err.message});
    }
});

//get module with moduleID

router.get('/:moduleID', async(req, res)=>{
    try{
        const module=await Module.findOne({moduleID: req.params.moduleID});
        if(!module) return res.status(404).json({error: 'Module not found'});
        res.json({
            moduleID: module.moduleID,
            title: module.title,
            description: module.description,
            materialURL: module.materialURL,
            questions: module.moduleQuestions.length
        });
    } catch(err){
        res.status(500).json({message: 'Error getting module', error: err.message});
    }
});
//Get module quiz questions
router.get('/:moduleID/questions', async(req,res)=>{
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
router.post('/:moduleID/grade', async(req,res)=>{
    try{
        
        const module=await Module.findOne({moduleID: req.params.moduleID});
        if(!module) return res.status(404).json({error: 'Module not found'});

        const {answers}=req.body;

        if(!Array.isArray(answers)) return res.status(400).json({message: 'Answers must be in an array form'});

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
