const middleware = (validate) => (request, response, next) => {
  const { error } = validate(request.body);
  if (error)
    return response.status(400).send({
      message: "not valid",
      error,
    });
  next();
};

const Joi = require("joi");

const validate = Object.entries({
  signup: {
    username: Joi.string().min(1).required(),
    email: Joi.string()
      .min(6)
      .regex(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/)
      .email()
      .required(),
    password: Joi.string().min(10).required(),
  },
  login: {
    email: Joi.string()
      .min(6)
      .regex(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/)
      .email()
      .required(),
    password: Joi.string().min(10).required(),
  },
  authGoogle: {
    tokenId: Joi.string().required(),
  },
  authSpotify: {
    code: Joi.string().required(),
  },
  newRoom: {
    name: Joi.string().min(1).max(30),
  },
  requestRoom: {
    shortId: Joi.string().min(1).max(30),
  },
  search: {
    text: Joi.string().min(1).required(),
  },
}).reduce(
  (previous, [name, object]) => ({
    ...previous,
    [name]: middleware((data) => Joi.object(object).validate(data)),
  }),
  {}
);

module.exports = validate;
