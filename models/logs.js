const mongoose = require('mongoose');
const logSchema = new mongoose.Schema({

    userRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userID: { type: String, required: true },
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    details: { type: mongoose.Schema.Types.Mixed },

});
module.exports=mongoose.model('Log', logSchema);