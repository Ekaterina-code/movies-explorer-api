const HttpStatus = require('http-status-codes');

const defaultError = 'Ошибка по умолчанию.';

// eslint-disable-next-line no-unused-vars
module.exports.errorHandler = (error, req, res, next) => {
  if (error.message && error.statusCode) {
    res
      .status(error.statusCode)
      .json({ message: error.message });
  } else {
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: defaultError });
  }
};
