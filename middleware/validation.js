//validates password and email entries 

const Joi = require('joi');

//Register for site
const registerSchema = Joi.object({
  userName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().max(254).required(),
  password: Joi.string().min(12).max(128).required(),
});

//Login to site
//identifier = username or email
const loginSchema = Joi.object({
  identifier: Joi.string().min(2).max(254).required(),
  password: Joi.string().min(12).max(128).required(),
});

const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: 'Invalid Request',
      details: error.details.map((d) => d.message),
    });
  }

  req.body = value;
  next();
};

module.exports = {
  validateBody,
  registerSchema,
  loginSchema,
};
