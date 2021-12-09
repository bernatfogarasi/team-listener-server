const log = (text, type) => {
  return async (request, response, next) => {
    console.log(`${text} [${type}]`);
    next();
  };
};

module.exports = log;
