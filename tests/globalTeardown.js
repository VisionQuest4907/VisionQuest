/** Runs once after all test files; helps Jest exit when DB connections stay open. */
module.exports = async () => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  } catch {
    // mongoose may not be loaded if only unit tests ran
  }
};