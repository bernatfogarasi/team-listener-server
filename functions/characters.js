const crypto = require("crypto");

const encode = (
  number,
  characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
) => {
  const base = characters.length;
  var remainder;
  var result = [];
  while (number !== 0) {
    remainder = number % base;
    result.push(characters[remainder]);
    number = (number - remainder) / base;
  }
  return result.reverse().join("");
};

const random = (
  length,
  characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
) => {
  const result = [];
  const charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result.push(characters[Math.floor(Math.random() * charactersLength)]);
  }
  return result.join("");
};

const getEmailConfirmationToken = () => crypto.randomBytes(64).toString("hex");

module.exports = { encode, random, getEmailConfirmationToken };
