require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/users');
const Module = require('../models/training_modules');
const Log = require('../models/logs');

// Connect to database using DB_URI from .env
async function main() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in environment variables");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Promise.all([await User.deleteMany({}),await Module.deleteMany({}), await Log.deleteMany({})]);

    // create a test example module
    const modules = [new Module({
      moduleID: 'mod0001',
      title: 'Module 1: Data Privacy Overview',
      description: 'Introduction to data privacy concepts, policies, and laws.',
      order: 1,
      tags: ['data privacy', 'GDPR', 'HIPAA', 'PCI-DSS'],
      estTime: 30,
      content: [

        {
          type: 'video',
          title: 'Video 1: Introduction',
          url: '',
          order: 1,
          provider: 'youtube',
          notes: 'Watch Module 1 introduction video.'
        },
        {
          type: 'pdf',
          role: 'syllabus',
          title: 'Module 1 Data Privacy Overview Syllabus',
          url: '/syllabus/ModuleOneSyllabus.pdf',
          order: 2,
          provider: 'Vision Quest',
          notes: 'Read the syllabus before starting the lesson and go over lesson schedule.'
        },

        {
          type: 'video',
          title: 'Data Privacy - Why Is It Important',
          url: 'https://www.youtube.com/watch?v=bmgPd0rIrKw',
          order: 3,
          provider: 'youtube',
          notes: 'Watch video on What is Data Privacy?'
        },
        {
          type: 'video',
          title: 'HIPAA',
          url: 'https://www.youtube.com/watch?v=sNry7tMXlJw',
          order: 4,
          provider: 'youtube',
          notes: 'Watch video on HIPAA'
        },
        {
          type: 'video',
          title: 'GDPR',
          url: 'https://www.youtube.com/watch?v=j6wwBqfSk-o',
          order: 5,
          provider: 'youtube',
          notes: 'Watch video on GDPR'
        },
        {
          type: 'game',
          title: 'Wordle',
          order: 6,
          gameType:'Wordle',
          notes: 'Play Data Privacy Wordle'
        
        },
        {
          type: 'video',
          title: 'PCI-DSS',
          url: 'https://www.youtube.com/watch?v=IAkJRzj6MAQ',
          order: 7,
          provider: 'youtube',
          notes: 'Watch video on PCI-DSS'
        },

        {
          type: 'game',
          title: 'Matching Game: Data Privacy Laws',
          order: 8,
          gameType:'Matching Game',
          notes: 'Play Match to correct policy game'
        }
        

      ],
      
      moduleQuestions: [
        {
          question: 'For HIPAA violations, what is the range of fines?',
          multipleAnswers: [
            '$10,000-$100,000',
            '$75,000-$350,000',
            '$50,000-$250,000',
            '$25,000-$150,000'
          ],
          correctAnswerIndex: 2
        },
        {
          question: 'What is NOT the purpose of GDPR?',
          multipleAnswers: [
            'Says what companies can do with user data.',
            'Prevents data from being collected fully.',
            'Gives users more control how their data is collected and used',
            'Makes companies justify what they do with user data.'
          ],
          correctAnswerIndex: 1
        },

        {
          question: 'What Does HIPAA Protect?',
          multipleAnswers: [
            'Health Records',
            'Phone Numbers',
            'Account Numbers',
            'All of the Above'
          ],
          correctAnswerIndex: 3
        },

        {
          question: 'Violators of HIPAA can get prison time from ___ years depending on how much data was compromised.',
          multipleAnswers: [
            '1-10',
            '5-15',
            '15-25',
            '25-50'
          ],
          correctAnswerIndex: 0
        },
        {
          question: 'What is the reason for PCI DSS?',
          multipleAnswers: [
            'Protect user purchase history.',
            'Protect card data in transactions.',
            'Make users only use credit cards.',
            'None of the above.'
          ],
          correctAnswerIndex: 1
        }
      ]
    }),
    new Module({
      moduleID: 'mod0002',
      title: 'Module 2 - Passwords',
      description: 'You will be learning about passwords. Specifically about password etiquette and the dangers of using weak passwords.',
      order: 2,
      tags: ['Why passwords are important.', 'Password etiquette.', 'Password hacking'],
      estTime: 30,
      content: [

        {
          type: 'video',
          title: 'Video 1: Introduction',
          url: '',
          order: 1,
          provider: 'youtube',
          notes: 'Watch Module 2 introduction video.'
        },
        {
          type: 'pdf',
          role: 'syllabus',
          title: 'Module 2 Passwords Overview Syllabus',
          url: '/syllabus/ModuleTwoSyllabus.pdf',
          order: 2,
          provider: 'Vision Quest',
          notes: 'Read the syllabus before starting the lesson and go over lesson schedule.'
        },

        {
          type: 'video',
          title: 'Why are Strong Passwords Important?',
          url: 'https://www.youtube.com/watch?v=YitHISP0Isk',
          order: 3,
          provider: 'youtube',
          notes: 'Watch video on Why are StrongPasswords Important?'
        },
        {
          type: 'video',
          title: 'Password Ettiquette',
          url: 'https://www.youtube.com/watch?v=CXZKfUIw1fk',
          order: 4,
          provider: 'youtube',
          notes: 'Watch video on Password Etiquette'
        },
        {
          type: 'video',
          title: 'GDPR',
          url: 'https://www.youtube.com/watch?v=j6wwBqfSk-o',
          order: 5,
          provider: 'youtube',
          notes: 'Watch video on GDPR'
        },
        {
          type: 'game',
          title: 'Matching Game: Data Privacy Laws',
          order: 6,
          gameType:'Matching Game',
          notes: 'Play Match Game'
        },
        {
          type: 'video',
          title: 'Hackers',
          url: 'https://www.youtube.com/watch?v=vKPGZHoHX8k&t=41s',
          order: 7,
          provider: 'youtube',
          notes: 'Watch video on how Hackers Steal Passwords'
        }

      ],
      
      moduleQuestions: [
        {
          question: 'What do you not put in a password?',
          multipleAnswers: [
            'Your Name',
            'Your Birthday',
            'Common Words',
            'All of the Above'
          ],
          correctAnswerIndex: 3
        },
        {
          question: 'What would be helpful for security?',
          multipleAnswers: [
            'Creating common passwords.',
            'Not using a password manager.',
            'Two-factor authentication.',
            'Not using a password at all.'
          ],
          correctAnswerIndex: 2
        },

        {
          question: 'What should a password have?',
          multipleAnswers: [
            'Letters',
            'Numbers',
            'Special Characters',
            'All of the Above'
          ],
          correctAnswerIndex: 3
        },

        {
          question: 'One should ___ .',
          multipleAnswers: [
            'Use unsecure passwords.',
            'Never tell others your password.',
            'Use the same passwords across multiple accounts.',
            'Never change passwords.'
          ],
          correctAnswerIndex: 1
        },
        {
          question: 'What methods do hackers use to hack passwords?',
          multipleAnswers: [
            'All of the Above',
            'Guessing',
            'Spraying',
            'Harvesting'
          ],
          correctAnswerIndex: 0
        }
      ]
    }),
    new Module({
      moduleID: 'mod0003',
      title: 'Module 3 - Social Engineering',
      description: 'Introduction to data privacy concepts, policies, and laws.',
      order: 3,
      tags: ['Social Engineering','Phishing'],
      estTime: 30,
      content: [

        {
          type: 'video',
          title: 'Video 1: Introduction',
          url: '',
          order: 1,
          provider: 'youtube',
          notes: 'Watch Module 3 introduction video.'
        },
        {
          type: 'pdf',
          role: 'syllabus',
          title: 'Module 3 Social Engineering Syllabus',
          url: '/syllabus/ModuleThreeSyllabus.pdf',
          order: 2,
          provider: 'Vision Quest',
          notes: 'Read the syllabus before starting the lesson and go over lesson schedule.'
        },

        {
          type: 'video',
          title: 'What is Social Engineering?',
          url: 'https://www.youtube.com/watch?v=PWVN3Rq4gzw',
          order: 3,
          provider: 'youtube',
          notes: 'Watch video on What is Social Engineering?'
        },
        {
          type: 'video',
          title: 'Types of Social Engineering',
          url: 'https://www.youtube.com/watch?v=v7VTJhkJUUY',
          order: 4,
          provider: 'youtube',
          notes: 'Watch video on Types of Social Engineering'
        },

        {
          type: 'game',
          title: 'Wordle',
          order: 5,
          gameType:'Wordle',
          notes: 'Play Social Engineering Wordle'
        
        },
        {
          type: 'video',
          title: 'Phishing',
          url: 'https://www.youtube.com/watch?v=XBkzBrXlle0',
          order: 6,
          provider: 'youtube',
          notes: 'Watch video on Phishing'
        },

        {
          type: 'game',
          title: 'Matching Game: Data Privacy Laws',
          order: 7,
          gameType:'Matching Game',
          notes: 'Play Match to correct policy game'
        },
        {
          type: 'video',
          title: 'Phishing case study',
          url: 'https://www.youtube.com/watch?v=fHhNWAKw0bY',
          order: 8,
          provider: 'youtube',
          notes: 'Watch video on Phishing case study'
        }

      ],
      
      moduleQuestions: [
        {
          question: 'What are things you should not click?',
          multipleAnswers: [
            'Random Websites',
            'Unknown Links',
            'All of the Above',
            'None of the Above'
          ],
          correctAnswerIndex: 2
        },
        {
          question: 'What is not a stage of social engineering?',
          multipleAnswers: [
            'Identify victims and research background.',
            'Engage with target(s) using a fake story.',
            'Executing attack before anything.',
            'Removing traces.'
          ],
          correctAnswerIndex: 2
        },

        {
          question: 'What does phishing use?',
          multipleAnswers: [
            'All of the Above',
            'Pop-Ups',
            'Emails',
            'Text Messages'
          ],
          correctAnswerIndex: 0
        },

        {
          question: 'What is spear phishing?',
          multipleAnswers: [
            'A phishing attack on a specific person.',
            'None of the Above',
            'Phishing attacks for anyone.',
            'A type of malware.'
          ],
          correctAnswerIndex: 0
        },
        {
          question: 'What does scareware do?',
          multipleAnswers: [
            'Tricks users to download malware due to fear.',
            'Protects computers from social engineering.',
            'Deletes random pop-ups.',
            'None of the above.'
          ],
          correctAnswerIndex: 0
        }
      ]
    })
  
  ];
    await Module.insertMany(modules)

    // create a test example user
    const users =[ new User({
      userName: 'sydneyj',
      email: 'sydney@example.com',
      password: 'Test5678!Test', // Will be hashed by pre('save')
      progressTracker: [{ moduleID: 'mod0001', completionStatus:'completed', attempts:1, lastQuizScore:85, lastCompleteDate: new Date()}, {moduleID: 'mod0002', completionStatus:'in_progress', attempts:1, lastQuizScore:50}],
      certificates: [{moduleID: 'mod0001'}],
      quizScores: [{ moduleID: 'mod0001', quizScore: 85, attemptNum:1 }, { moduleID: 'mod0002', quizScore: 50, attemptNum:1 }]
    }),

    new User({
      userName:'clairep',
      email: 'claire@example.com',
      password: 'Test1234!Test',
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
