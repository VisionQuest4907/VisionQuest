const Module = require('module');

const originalLoad = Module._load;

Module._load = function patchedLoad(request, parent, isMain) {
  if (request === 'express-mongo-sanitize') {
    return function mongoSanitizeMock() {
      return function noopSanitize(_req, _res, next) {
        next();
      };
    };
  }
  return originalLoad.apply(this, arguments);
};