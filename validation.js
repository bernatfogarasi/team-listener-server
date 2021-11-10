const Joi = require("joi");

const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(6).required(),
    email: Joi.string()
      .min(6)
      .regex(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/)
      .email()
      .required(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .min(6)
      .regex(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/)
      .email()
      .required(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
