const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const movies = require('../controllers/movies');
const auth = require('../middlewares/auth');
const { urlValidator } = require('../utils/utils');

router.get('/', auth, movies.getMovies);
router.post(
  '/',
  auth,
  celebrate({
    body: Joi.object().keys({
      country: Joi.string().required(),
      director: Joi.string().required(),
      duration: Joi.number().required(),
      year: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().required().custom(urlValidator),
      trailer: Joi.string().required().custom(urlValidator),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
      thumbnail: Joi.string().required().custom(urlValidator),
      movieId: Joi.string().required().length(24).hex(),
    }),
  }),
  movies.saveMovies,
);
router.delete(
  '/:movieId',
  auth,
  celebrate({
    body: Joi.object().keys({
      movieId: Joi.string().length(24).hex(),
    }),
  }),
  movies.removeMovie,
);
module.exports = router;
