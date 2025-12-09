// scripts/backup_db.js
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const User = require('../models/users');
const Module = require('../models/training_modules');
const Log = require('../models/logs');

const DB_URI = process.env.DB_URI || process.env.MONGO_URI;
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

async function main() {
  try {
    if (!DB_URI) {
      console.error('DB_URI / MONGO_URI not set in .env');
      process.exit(1);
    }

    // Ensure backups folder exists
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.json`);

    console.log('Connecting to database for backup...');
    await mongoose.connect(DB_URI);
    console.log('Connected to MongoDB');

    console.log('Reading collections...');
    const users = await User.find().lean();
    const modules = await Module.find().lean();
    const logs = await Log.find().lean();

    const backupData = {
      timestamp: new Date().toISOString(),
      users,
      modules,
      logs,
    };

    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log('Backup written to', backupFile);

    await mongoose.disconnect();
    console.log('Backup complete.');
    process.exit(0);
  } catch (err) {
    console.error(' Backup failed:', err.message);
    process.exit(1);
  }
}

main();
