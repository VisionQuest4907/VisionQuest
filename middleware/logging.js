const pino = require("pino");
const pinoHttp = require("pino-http");

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.body.password",
      "req.body.token",
    ],
    remove: true,
  },
});

function loggingMiddleware(app) {
  app.use(
    pinoHttp({
      logger,
      customSuccessMessage: function () {
        return "request completed";
      },
    })
  );
}

module.exports = { logger, loggingMiddleware }; 
