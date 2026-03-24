const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT || 5000;

const MONGO_URI = process.env.MONGO_URI || process.env.DB_URI;

const JWT_SECRET = process.env.JWT_SECRET;
const NODE_ENV = process.env.NODE_ENV || "development";

if (!MONGO_URI) {
  console.error("MONGO_URI / DB_URI not set in environment");
  process.exit(1);
}

if (!JWT_SECRET) {
  console.error("JWT_SECRET not set in environment");
  process.exit(1);
}

module.exports = { PORT, MONGO_URI, JWT_SECRET, NODE_ENV }; //
