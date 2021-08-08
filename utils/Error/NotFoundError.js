const HttpStatus = require('http-status-codes');

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = HttpStatus.NOT_FOUND;
  }
}
module.exports.NotFoundError = NotFoundError;
