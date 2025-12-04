//log errors on server side and show generic message on webpage

import { NODE_ENV } from '../config/env.js';
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: 'Resource Not Found' });
};

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  const status = err.status || 500;
  const response = {
    message:
      status === 500 ? 'Internal Server Error' : err.message || 'Error Occurred',
  };

  if (NODE_ENV === 'development' && status === 500) {
    response.stack = err.stack;
  }

  res.status(status).json(response);
};
