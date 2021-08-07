const HttpStatus = require('http-status-codes');
const { errorMessages } = require('../errorMessages');

class UserConflictError extends Error {
  constructor() {
    super(errorMessages.userConflict);
    this.statusCode = HttpStatus.CONFLICT;
  }
}
module.exports.UserConflictError = UserConflictError;
