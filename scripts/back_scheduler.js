const cron = require('node-cron');
const { exec } = require('child_process');

console.log('Backup scheduler started. Will run backup every Sunday at 3am.');

// Every Sunday at 3:00 AM server time
cron.schedule('0 3 * * 0', () => {
  console.log('Running scheduled backup:', new Date().toISOString());
  exec('npm run backup', (error, stdout, stderr) => {
    if (error) {
      console.error('Scheduled backup failed:', error.message);
      return;
    }
    console.log('Scheduled backup output:', stdout);
  });
});
