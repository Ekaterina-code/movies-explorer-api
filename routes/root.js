const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const users = require('../controllers/users');
const auth = require('../middlewares/auth');
const { NotFoundError } = require('../utils/Error/NotFoundError');

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
  () => {
    throw new NotFoundError('Страница не найдена');
  });
module.exports = router;
