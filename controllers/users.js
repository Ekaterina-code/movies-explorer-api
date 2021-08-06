const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

require('dotenv').config();

const {
  asyncHandler,
  sendSuccess,
  throwBadRequestError,
  throwNotFoundError,
  throwInternalServerError,
} = require('../utils/utils');

const errorMessages = {
  incorrectPassword: 'Неправильные почта или пароль',
  createUserBadRequest: 'Переданы некорректные данные при создании пользователя.',
  updateProfileBadRequest: 'Переданы некорректные данные при обновлении профиля.',
  getProfileBadRequest: 'Переданы некорректные данные при получаении профиля.',
  userNotFound: 'Пользователь по указанному не найден.',
};

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
        if (error.name === 'ValidationError') throwBadRequestError(errorMessages.createUserBadRequest);
        if (error.name === 'MongoError' && error.code === 11000) {
          const err = new Error('Пользователь уже существует');
          err.statusCode = 409;
          throw err;
        }
        throwInternalServerError();
      }));
});

module.exports.getCurrentUser = asyncHandler((req, res) => User
  .findOne({ _id: req.user._id })
  .orFail(() => throwNotFoundError(res, errorMessages.userNotFound))
  .then((user) => sendSuccess(res, user))
  .catch((error) => {
    if (error.name === 'CastError') throwBadRequestError(errorMessages.getProfileBadRequest);
    if (error.statusCode === 404) throwNotFoundError(error);
    throwInternalServerError();
  }));

module.exports.editCurrentUser = asyncHandler((req, res) => {
  const { name, email } = req.body;
  return User
    .findByIdAndUpdate({ _id: req.user._id }, { name, email }, { runValidators: true, new: true })
    .orFail(() => throwNotFoundError(res, errorMessages.userNotFound))
    .then((user) => sendSuccess(res, user))
    .catch((error) => {
      if (error.name === 'CastError' || error.name === 'ValidationError') throwBadRequestError(res, errorMessages.updateProfileBadRequest);
      if (error.statusCode === 404) throwNotFoundError(error);
      throwInternalServerError(res);
    });
});

module.exports.login = asyncHandler((req, res) => {
  const incorrectPasswordErrorName = 'IncorrectPassword';
  const { NODE_ENV, JWT_SECRET } = process.env;
  const secret = NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret';
  return User
    .findOne({ email: req.body.email }).select('+password')
    .orFail(() => throwNotFoundError(errorMessages.userNotFound))
    .then((user) => bcrypt
      .compare(req.body.password, user.password)
      .then((matched) => {
        if (!matched) {
          const error = new Error(errorMessages.incorrectPassword);
          error.name = incorrectPasswordErrorName;
          error.code = 401;
          Promise.reject(error);
        }
        const token = jwt.sign({ _id: user._id }, secret, { expiresIn: '7d' });
        return sendSuccess(res, { _id: user._id, token });
      }))
    .catch((error) => {
      if (error.name === 'CastError') throwBadRequestError(errorMessages.userNotFound);
      if (error.name === incorrectPasswordErrorName) res.status(error.code).send(error.message);
      if (error.statusCode === 404) throwNotFoundError(error.message);
      throwInternalServerError();
    });
});
