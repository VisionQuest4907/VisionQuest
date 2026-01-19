require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectToDB = require("./connection");

//require API routes
const userRoutes = require("./routes/userRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const logRoutes = require("./routes/logRoutes");

const app = express();

const allowed = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowed.length === 0) return cb(null, true);
    return allowed.includes(origin) ? cb(null, true) : cb(new Error("CORS blocked"));
  },
  credentials: true
}));

app.use(express.json());

connectToDB();

// useAPI routes
app.use("/api/users", userRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/logs", logRoutes);

//health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;
//run server
app.listen(PORT, () => console.log("Server running on", PORT));
