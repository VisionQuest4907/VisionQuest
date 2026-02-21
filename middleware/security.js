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

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : false,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    })
  );
  //prevent Mongo operator injection
  app.use(mongoSanitize());

  //prevent HTTP parameter pollution
  app.use(hpp());

  //body limits
  app.use(require("express").json({ limit: "200kb" })); 
}

module.exports = { securityMiddleware }; 
  
  
  
