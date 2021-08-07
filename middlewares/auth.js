const jwt = require('jsonwebtoken');
const { isProduction } = require('../utils/utils');
const { UnauthorizedError } = require('../utils/Error/UnauthorizedError');
const { ForbiddenError } = require('../utils/Error/ForbiddenError');
const { errorMessages } = require('../utils/errorMessages');

require('dotenv').config();

module.exports = (req, res, next) => {
  const acceptedAuthType = 'Bearer ';
  const { authorization } = req.headers;
  const { JWT_SECRET } = process.env;
  const secret = isProduction() ? JWT_SECRET : 'dev-secret';
  if (!authorization || !authorization.startsWith(acceptedAuthType)) {
    throw new ForbiddenError(errorMessages.authRequired);
  }

  try {
    req.user = jwt.verify(authorization.substring(acceptedAuthType.length), secret);
    return next();
  } catch (err) {
    throw new UnauthorizedError(errorMessages.authRequired);
  }
};
