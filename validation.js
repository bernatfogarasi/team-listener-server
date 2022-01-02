const Joi = require("joi");

const signupValidation = (data) => {
  return Joi.object({
    username: Joi.string().min(4).required(),
    email: Joi.string()
      .min(6)
      .regex(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/)
      .email()
      .required(),
    password: Joi.string().min(10).required(),
  }).validate(data);
};

const signupGoogleValidation = (data) => {
  return Joi.object({
    tokenId: Joi.string().required(),
  }).validate(data);
};

const loginValidation = (data) => {
  return Joi.object({
    email: Joi.string()
      .min(6)
      .regex(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/)
      .email()
      .required(),
    password: Joi.string().min(10).required(),
  }).validate(data);
};

const loginGoogleValidation = (data) => {
  return Joi.object({
    tokenId: Joi.string().required(),
  }).validate(data);
};

const newRoomValidation = (data) => {
  return Joi.object({
    name: Joi.string().min(1).max(30),
  }).validate(data);
};

const requestRoomValidation = (data) => {
  return Joi.object({
    shortId: Joi.string().min(1).max(30),
  }).validate(data);
};

const searchValidation = (data) => {
  return Joi.object({
    text: Joi.string().min(1).required(),
  }).validate(data);
};

// const profilePictureValidation = (data) => {
//   return Joi.object({
//     file: Joi.required(),
//   }).validate(data);
// };

module.exports.signupValidation = signupValidation;
module.exports.signupGoogleValidation = signupGoogleValidation;
module.exports.loginValidation = loginValidation;
module.exports.loginGoogleValidation = loginGoogleValidation;
module.exports.newRoomValidation = newRoomValidation;
module.exports.requestRoomValidation = requestRoomValidation;
module.exports.searchValidation = searchValidation;
// module.exports.profilePictureValidation = profilePictureValidation;
