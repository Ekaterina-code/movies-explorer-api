const HttpStatus = require('http-status-codes');

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = HttpStatus.FORBIDDEN;
  }
}
module.exports.ForbiddenError = ForbiddenError;
