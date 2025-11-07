require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/users');
const Module = require('../models/training_modules');
const Log = require('../models/logs');

// Connect to database using DB_URI from .env
async function main() {
  try {
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
     });
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Module.deleteMany({});
    await Log.deleteMany({});

    // create a test example module
    const modules = [new Module({
      title: 'Cybersecurity Training Lesson 1',
      description: 'Introduction to basic Cybersecurity',
      materialURL: 'https://example.com/cybersecurity101URL',
      moduleID: 'mod0001',
      moduleQuestions: [
        {
          question: 'What is phishing?',
          multipleAnswers: [
            'A virus',
            'A social engineering technique that uses fake emails to get user information',
            'A security strategy',
            'A privacy policy'
          ],
          correctAnswerIndex: 1
        },
        {
          question: 'Which is a weak password?',
          multipleAnswers: [
            '123#MyElemSecret',
            'Pass56W@rd!',
            '123456',
            'Secr3t!S@f3'
          ],
          correctAnswerIndex: 2
        }
      ]
    }),
    new Module({
      title: 'Cybersecurity Training Lesson 2',
      description: ' Cybersecurity Authentication',
      materialURL: 'https://example.com/cybersecurity202URL',
      moduleID: 'mod0002',
      moduleQuestions: [
        {
          question: 'What is multi-factor authentication?',
          multipleAnswers: [
            'Using a password, a security, question, and a login name',
            'Using a username and password',
            'Using a password and a one time code',
            'Using a password, a one-time code, and a retina scan',
          ],
          correctAnswerIndex:3
        }
      ]
    })];
    await Module.insertMany(modules)

    // create a test example user
    const users =[ new User({
      userName: 'sydneyj',
      email: 'sydney@example.com',
      password: 'test1234!', // Will be hashed by pre('save')
      progressTracker: [{ moduleID: 'mod0001', completionStatus:'completed', attempts:1, lastQuizScore:85, lastCompleteDate: new Date()}, {moduleID: 'mod0002', completionStatus:'in_progress', attempts:1, lastQuizScore:50}],
      certificates: [{moduleID: 'mod0001'}],
      quizScores: [{ moduleID: 'mod0001', quizScore: 85, attemptNum:1 }, { moduleID: 'mod0002', quizScore: 50, attemptNum:1 }]
    }),

    new User({
      userName:'clairep',
      email: 'claire@example.com',
      password: 'test5678$',
    })
  ];
    for (const u of users) {
      await u.save();
    }

    // ceate a test log with data
    const log = new Log({
      userRef: users[0]._id,
      userID: users[0].userID,
      action: 'module_completed',
      timestamp: new Date(),
      details: {score: 85}
    });
    await log.save();

    console.log('Test data inserted successfully!');
  } catch (error) {
    console.error(' Error inserting dummy data:', error);
  } finally {
    await mongoose.disconnect();
  }
}


if (require.main === module) main();

module.exports = main;
