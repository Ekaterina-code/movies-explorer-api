const Movie = require('../models/movie');
const { BadRequestError } = require('../utils/Error/BadRequestError');
const { NotFoundError } = require('../utils/Error/NotFoundError');
const { asyncHandler, sendSuccess } = require('../utils/utils');
const { errorMessages } = require('../utils/errorMessages');

module.exports.getMovies = asyncHandler((req, res) => Movie.find({ owner: req.user._id })
  .then((cards) => sendSuccess(res, cards)));

module.exports.removeMovie = asyncHandler((req, res) => {
  const { _id } = req.params;

  // findOneAndRemove + "owner: req.user._id" - гарантирует то,
  // что удалится фильм только текущего пользователя
  return Movie.findOneAndRemove({ _id, owner: req.user._id })
    .orFail(() => new NotFoundError(errorMessages.movieNotFound))
    .then(() => sendSuccess(res))
    .catch((error) => {
      if (error.name === 'CastError') throw new BadRequestError(errorMessages.removeMovieBadRequest);
      throw error;
    });
});

module.exports.saveMovies = asyncHandler((req, res) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;

  const owner = req.user._id;
  return Movie
    .create(
      {
        country,
        director,
        duration,
        year,
        description,
        image,
        trailer,
        nameRU,
        nameEN,
        thumbnail,
        movieId,
        owner,
      },
    )
    .then((movie) => sendSuccess(res, movie))
    .catch((error) => {
      if (error.name === 'ValidationError') throw new BadRequestError(errorMessages.createMovieBadRequest);
      throw error;
    });
});
