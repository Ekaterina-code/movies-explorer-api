const HttpStatus = require('http-status-codes');
const validator = require('validator');

const { NODE_ENV, JWT_SECRET } = process.env;

const isProduction = () => NODE_ENV === 'production';

module.exports.asyncHandler = (fn) => (req, res, next) => Promise
  .resolve(fn(req, res, next))
  .catch((error) => {
    next(error);
  });

module.exports.sendSuccess = (res, data) => res
  .status(HttpStatus.OK)
  .send(data || { message: 'success' });

module.exports.urlValidator = (value, helpers) => (validator.isURL(value)
  ? value
  : helpers.message('URL validation error'));

module.exports.isProduction = () => isProduction();
module.exports.getJwtSecret = () => (isProduction() ? JWT_SECRET : 'dev-secret');
