const mongoose = require('mongoose');
const modulesSchema = new mongoose.Schema({
    title: { type: String, required: true }, 
    description: { type: String, required: true },
    materialURL: { type: String, required: true },
    moduleID: { type: String, required: true, unique: true },
    moduleQuestions: [{question: { type: String, required: true }, multipleAnswers: { type: [String], required: true }, correctAnswerIndex: { type: Number, required: true }}]

});
module.exports=mongoose.model('Modules', modulesSchema);
