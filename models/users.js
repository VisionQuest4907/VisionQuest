const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true},
    password: { type: String, required: true },
    
    //progress tracking array
    progressTracker: [{moduleID: { type: String, required: true },completionStatus: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },attempts: { type: Number, default: 0 },lastQuizScore: { type: Number, default: null },lastCompleteDate: { type: Date }}],
    //certificates array for user
    certificates: [{certID: { type: String, default: () => new mongoose.Types.ObjectId().toString() }, moduleID: { type: String, required: true },dateEarned: { type: Date, default: Date.now }}],

    //quiz score array for user
    quizScores: [{moduleID: { type: String, required: true },quizScore: { type: Number, required: true },attemptNum: { type: Number, default: 1 },timestamp: { type: Date, default: Date.now }}]
}, { timestamps: true });

userSchema.pre('save', function (next) {
    if (this.isModified('password')) {
        try {
            this.password = bcrypt.hashSync(this.password, 10);
        } catch (err) {
            return next(err);
        }
    }
    next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compareSync(candidatePassword, this.password);
};
module.exports = mongoose.model('User', userSchema);
