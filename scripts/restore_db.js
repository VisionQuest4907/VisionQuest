// scripts/restore_db.js
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

    if (!fs.existsSync(BACKUP_DIR)) {
      console.error('No backups folder found. Run npm run backup first.');
      process.exit(1);
    }

    // find latest backup-*.json file
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
      .sort()
      .reverse();

    if (files.length === 0) {
      console.error('No backup files found in backups/.');
      process.exit(1);
    }

    const latestFile = files[0];
    const backupPath = path.join(BACKUP_DIR, latestFile);
    console.log('Using backup file:', latestFile);

    const raw = fs.readFileSync(backupPath, 'utf8');
    const data = JSON.parse(raw);

    console.log('Connecting to database for restore...');
    await mongoose.connect(DB_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Module.deleteMany({});
    await Log.deleteMany({});

    console.log('Restoring from backup...');
    if (data.users?.length) await User.insertMany(data.users);
    if (data.modules?.length) await Module.insertMany(data.modules);
    if (data.logs?.length) await Log.insertMany(data.logs);

    console.log('Restore complete from', latestFile);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Restore failed:', err.message);
    process.exit(1);
  }
}

main();
