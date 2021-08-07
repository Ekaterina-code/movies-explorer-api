const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const users = require('../controllers/users');
const { throwNotFoundError } = require('../utils/utils');
const auth = require('../middlewares/auth');

router.post('/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email(),
      password: Joi.string(),
    }),
  }),
  users.login);

router.post('/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      email: Joi.string().email().required(),
      password: Joi.string().required().min(2).max(30),
    }),
  }),
  users.createUser);

router.all('*',
  auth,
  () => throwNotFoundError('Страница не найдена'));
module.exports = router;
