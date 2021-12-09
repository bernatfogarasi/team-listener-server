const Joi = require("joi");

const registerValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(4).required(),
    email: Joi.string()
      .min(6)
      .regex(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/)
      .email()
      .required(),
    password: Joi.string().min(10).required(),
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
    password: Joi.string().min(10).required(),
  });
  return schema.validate(data);
};

const newRoomValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(30),
  });
  return schema.validate(data);
};

const searchValidation = (data) => {
  const schema = Joi.object({
    text: Joi.string().min(1).required(),
  });
  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.newRoomValidation = newRoomValidation;
module.exports.searchValidation = searchValidation;
