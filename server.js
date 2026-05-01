const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const { PORT, MONGO_URI, NODE_ENV } = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { securityMiddleware } = require("./middleware/security");

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const moduleRoutes = require("./routes/moduleRoutes");
const logRoutes = require("./routes/logRoutes");
const userDataRoutes = require("./routes/userDataRoutes");

const app = express();

//refuse startup if critical secret missing
if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET');
  process.exit(1);
}

//security middleware: helmet, CORS, mongoSanitize, hpp, body limit, trust proxy
securityMiddleware(app);

app.use(cookieParser());
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));

app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use("/api/user-data", userDataRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/logs", logRoutes);

//route to root
app.get('/', (req, res) => {
  res.json({ message: 'VisionQuest API is running' });
});

//add health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/ready", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "up" : "down";
  if (dbStatus === "down") {
    return res.status(503).json({ status: "not ready", db: dbStatus });
  }
  res.json({ status: "ready", db: dbStatus });
});
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/ready", (req, res) => {
  const state = mongoose.connection.readyState;
  const isReady = state === 1;

  res.status(isReady ? 200 : 503).json({
    status: isReady ? "ready" : "not_ready",
    dbConnected: isReady,
    dbState: state,
    timestamp: new Date().toISOString(),
  });
});
app.use(notFoundHandler);
app.use(errorHandler);

const port = PORT || process.env.PORT || 5000;

mongoose.connect(MONGO_URI).then(() => {
  console.log("Connected to MongoDB");
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server Running on Port ${port}`);
  });
}).catch((err) => {
  console.error("MongoDB Connection Error:", err);
  process.exit(1);
});
  

