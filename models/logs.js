const mongoose = require('mongoose');
const logSchema = new mongoose.Schema({

    userRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userID: { type: String, required: true },
    action: { type: String, required: true },
    moduleID: { type: String },
    timestamp: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 90 },
    details: { type: mongoose.Schema.Types.Mixed },

});
module.exports=mongoose.model('Log', logSchema);
