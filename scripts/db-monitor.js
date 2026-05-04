// scripts/db-monitor.js
// PRSJ8 - Simple database monitoring script

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const logger = require("../logger");

async function main() {
  const mongoURI = process.env.MONGO_URI || process.env.DB_URI;

  if (!mongoURI) {
    throw new Error("MONGO_URI is not set");
  }

  const start = Date.now();

  await mongoose.connect(mongoURI);

  const db = mongoose.connection.db;

  //ping database to check connectivity before getting stats
  await db.admin().ping();

  // database stats
  const dbStats = await db.command({ dbStats: 1 });
  // counts of users, modules, logs collections
  const [userCount, moduleCount, logCount] = await Promise.all([
    db.collection("users").countDocuments({}),
    db.collection("modules").countDocuments({}),
    db.collection("logs").countDocuments({}),
  ]);
  //amount of time for monitoring to run
  const durationMs = Date.now() - start;

  //log results
  const payload = {
    event: "db_monitor",
    status: "up",
    dbName: db.databaseName,
    userCount,
    moduleCount,
    logCount,
    collections: dbStats.collections,
    dataSizeMB: Math.round((dbStats.dataSize || 0) / 1024 / 1024),
    storageSizeMB: Math.round((dbStats.storageSize || 0) / 1024 / 1024),
    durationMs,
    timestamp: new Date().toISOString(),
  };
  
  //log to logger and console
  logger.info(payload);
  console.log(JSON.stringify(payload, null, 2));

  //if monitoring takes longer than 2 seconds log a warning
  if (durationMs > 2000) {
    logger.warn({
      event: "db_monitor_warning",
      message: "Database monitoring run was slower than expected",
      durationMs,
      timestamp: new Date().toISOString(),
    });
  }

  //disconnect after monitoring
  await mongoose.disconnect();
}

//run main catch any errors
main().catch(async (err) => {
  const payload = {
    event: "db_monitor",
    status: "down",
    error: err.message,
    timestamp: new Date().toISOString(),
  };

  //log error to logger and console
  logger.error(payload);
  console.error(JSON.stringify(payload, null, 2));

  //disconnect if error occurs
  try {
    await mongoose.disconnect();
  } catch (_) {}

  process.exit(1);
});