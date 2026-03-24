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

//Quiz submission schema. Prevent invalid quiz input
const userQuizSubmitSchema = Joi.object({
    //Require moduleID and quiz score to submit
    moduleID: Joi.string().min(1).required(),
    quizScore: Joi.number().min(0).max(100).required()
});

//module Grading Schema
const moduleGradeSchema = Joi.object({
  //Answers must be an array of 4 integers
    answers: Joi.array().items(Joi.number().integer().min(0).max(3)).min(1).required()
});

//update user profile
const updateProfileSchema = Joi.object({
  userName: Joi.string().min(2).max(50).trim().optional(),
  firstName: Joi.string().max(50).trim().allow("").optional(),
  lastName: Joi.string().max(50).trim().allow("").optional(),
  phoneNumber: Joi.string().max(20).trim().allow("").optional(),
  email: Joi.string().email().max(254).trim().optional(),
  password: Joi.string().min(12).max(128).optional(),

  //reject if all fields are empty
}).min(1);

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
  userQuizSubmitSchema,
  moduleGradeSchema,
  updateProfileSchema
};
