const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    type: { type: String, enum:["video", "pdf", "game"], required: true },
    title: { type: String, required: true },
    url: { type: String, default: ""},
    order: { type: Number, required: true },
    role:{type:String, enum:["syllabus", "lesson"], default:"lesson"},
    provider: { type: String, default: "" },
    gameType: { type: String, default: "" },
    notes: { type: String, default: "" }

},
{_id: false}

);

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    multipleAnswers: { type: [String], required: true },
    correctAnswerIndex: { type: Number, required: true }

},
{_id: false}

);

const modulesSchema = new mongoose.Schema({
    moduleID: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true }, 
    description: { type: String, required: true },
    order: { type: Number, required: true, index:true },
    tags: { type: [String], default: [] },
    estTime: {type: Number, default:null },
    
    content: {type: [contentSchema], default: []},    
    moduleQuestions: {type: [questionSchema], default: []},

},
{ timestamps: true }

);
module.exports=mongoose.model('Modules', modulesSchema);
