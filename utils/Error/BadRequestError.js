const HttpStatus = require('http-status-codes');

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = HttpStatus.BAD_REQUEST;
  }
}
module.exports.BadRequestError = BadRequestError;
