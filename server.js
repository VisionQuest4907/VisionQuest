const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require("helmet");
const cors = require("cors");
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const { PORT, MONGO_URI, NODE_ENV } = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
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

//trust proxy for correct secure cookies when using Elastic Beanstalk and Cloudfront
app.set("trust proxy", 1);

//hide express fingerprint
app.disable('x-powered-by');

//Helmet security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "same-site" },
}));

//safer body parsing with request size limited 
app.use(express.json({ limit: '200kb' }));

app.use(cookieParser());
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));

//sanitize mongo style operators from user input
app.use(mongoSanitize());

//prevent HTTP parameter pollution
app.use(hpp());

const allowed = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

//CORS allowlist and credentials
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const isProd = NODE_ENV === "production";
    if (allowed.length === 0){
      if (isProd) return cb(new Error("CORS blocked: No allowed origins configured"));
      return cb(null, true);
    }
      
    return allowed.includes(origin) ? cb(null, true) : cb(new Error("CORS blocked"));
  },
  credentials: true
}));

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
