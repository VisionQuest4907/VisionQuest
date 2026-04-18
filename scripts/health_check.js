require('dotenv').config();
const mongoose = require('mongoose');

async function checkHealth() {
  console.log("Running health check...");

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connection OK");
  } catch (err) {
    console.error(" Database connection FAILED:", err.message);
    process.exit(1);
  }

  console.log("Server environment OK");
  process.exit(0);
}

checkHealth();