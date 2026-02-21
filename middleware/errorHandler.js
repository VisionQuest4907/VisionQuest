const { NODE_ENV } = require('../config/env');

const notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
};

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  const status = err.status || 500;
  const response = {
    message:
      status === 500 ? 'Internal Server Error' : err.message || 'Error',
  };

  if (NODE_ENV === 'development' && status === 500) {
    response.stack = err.stack;
  }

  res.status(status).json(response);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
