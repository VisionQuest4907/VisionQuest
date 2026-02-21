const { NODE_ENV } = require('../config/env');

const notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
};

const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || err.status || 500;
  let message = err.message || "Error";

  //invalid json body
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    status = 400;
    message = "Invalid json payload";
  }

  //DB invalid object id 
  if (err.name === "CastError") {
    status = 400;
    message = "Invalid identifier format";
  }

  //DB schema validation
  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation failed";
  }

  //DB duplicate key error
  if (err.code === 11000) {
    status = 409;
    const fields = Object.keys(err.keyValue || {});
    message = fields.length
      ? `Duplicate value for: ${fields.join(', ')}`
      : 'Duplicate key error';
  }

  //jwt errors
  if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid token";
  }
  if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token expired";
  }
  
  console.error('[ERROR]', {
    status,
    name: err.name,
    message: err.message,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    stack: NODE_ENV === "development" ? err.stack : undefined,
  });

  const isProd = NODE_ENV === "production";
  const response = {
    message: status === 500 && isProd ? "Internal Server Error" : message,
  };
  if (!isProd && status === 500) {
    response.stack = err.stack;
  };

  res.status(status).json(response);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
