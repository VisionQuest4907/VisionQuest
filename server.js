const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require("helmet");
const cors = require("cors");

const { PORT, MONGO_URI, NODE_ENV } = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const moduleRoutes = require("./routes/moduleRoutes");
const logRoutes = require("./routes/logRoutes");
const userDataRoutes = require("./routes/userDataRoutes");

const app = express();

//trust proxy for correct secure cookies when using Elastic Beanstalk and Cloudfront
app.set("trust proxy", 1);

//Helmet security headers
app.use(helmet());

app.use(express.json());
app.use(cookieParser());
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));

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

//add health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(notFoundHandler);
app.use(errorHandler);

mongoose.connect(MONGO_URI).then(() => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
  });
}).catch((err) => {
  console.error("MongoDB Connection Error:", err);
  process.exit(1);
});
  
