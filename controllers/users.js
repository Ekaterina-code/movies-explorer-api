const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { BadRequestError } = require('../utils/Error/BadRequestError');
const { NotFoundError } = require('../utils/Error/NotFoundError');
const { UserConflictError } = require('../utils/Error/UserConflictError');
const { UnauthorizedError } = require('../utils/Error/UnauthorizedError');
const { asyncHandler, sendSuccess, getJwtSecret } = require('../utils/utils');
const { errorMessages } = require('../utils/errorMessages');

require('dotenv').config();

module.exports.createUser = asyncHandler((req, res) => {
  const {
    name, email, password,
  } = req.body;
  return bcrypt.hash(password, 10)
    .then((passwordHash) => User
      .create({
        name,
        email,
        password: passwordHash,
      })
      .then((user) => {
        sendSuccess(res, {
          name: user.name,
          email: user.email,
        });
      })
      .catch((error) => {
        if (error.name === 'ValidationError') throw new BadRequestError(errorMessages.createUserBadRequest);
        if (error.name === 'MongoError' && error.code === 11000) throw new UserConflictError();
        throw error;
      }));
});

module.exports.getCurrentUser = asyncHandler((req, res) => User
  .findOne({ _id: req.user._id })
  .orFail(() => new NotFoundError(errorMessages.userNotFound))
  .then((user) => sendSuccess(res, user))
  .catch((error) => {
    if (error.name === 'CastError') throw new BadRequestError(errorMessages.getProfileBadRequest);
    throw error;
  }));

module.exports.editCurrentUser = asyncHandler((req, res) => {
  const { name, email } = req.body;
  return User
    .findByIdAndUpdate({ _id: req.user._id }, { name, email }, { runValidators: true, new: true })
    .orFail(() => new NotFoundError(res, errorMessages.userNotFound))
    .then((user) => sendSuccess(res, user))
    .catch((error) => {
      if (error.name === 'CastError' || error.name === 'ValidationError') throw new BadRequestError(res, errorMessages.updateProfileBadRequest);
      if (error.name === 'MongoError' && error.code === 11000) throw new UserConflictError();
      throw error;
    });
});

module.exports.login = asyncHandler((req, res) => {
  const secret = getJwtSecret();
  if (!req.body.email || !req.body.password) throw new UnauthorizedError();
  return User
    .findOne({ email: req.body.email }).select('+password')
    .orFail(() => new NotFoundError(errorMessages.userNotFound))
    .then((user) => bcrypt
      .compare(req.body.password, user.password)
      .then((matched) => {
        if (!matched) throw new UnauthorizedError();
        const token = jwt.sign({ _id: user._id }, secret, { expiresIn: '7d' });
        return sendSuccess(res, { _id: user._id, token });
      }))
    .catch((error) => {
      if (error.name === 'CastError') throw new BadRequestError(errorMessages.userNotFound);
      throw error;
    });
});
