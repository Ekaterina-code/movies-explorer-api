const HttpStatus = require('http-status-codes');
const { errorMessages } = require('../errorMessages');

class UnauthorizedError extends Error {
  constructor(message) {
    super(message || errorMessages.incorrectPassword);
    this.statusCode = HttpStatus.UNAUTHORIZED;
  }
}
module.exports.UnauthorizedError = UnauthorizedError;
