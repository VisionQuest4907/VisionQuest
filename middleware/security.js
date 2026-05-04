const helmet = require("helmet");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize"); 
const hpp = require("hpp");

function securityMiddleware(app) {
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy: false, //turn on later after you know your script/style sources
      crossOriginResourcePolicy: { policy: "same-site" },
    })
  );

  //body limits
  app.use(require("express").json({ limit: "200kb" }));
  //prevent Mongo operator injection
  app.use(mongoSanitize());

  //prevent HTTP parameter pollution
  app.use(hpp());

  const allowed = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        const isProd = process.env.NODE_ENV === "production";
        if (allowed.length === 0){
          if (isProd) return cb(new Error("CORS blocked: No allowed origins configured"));
        return cb(null, true);
        }
        return allowed.includes(origin) ? cb(null, true) : cb(new Error("CORS blocked"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    })
  ); 
}

module.exports = { securityMiddleware }; 
  
  
  
