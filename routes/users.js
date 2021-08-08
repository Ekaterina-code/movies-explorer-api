const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const users = require('../controllers/users');
const auth = require('../middlewares/auth');

router.patch(
  '/me',
  auth,
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      email: Joi.string().email().required(),
    }),
  }),
  users.editCurrentUser,
);

router.get('/me', auth, users.getCurrentUser);

module.exports = router;
