const Movie = require('../models/movie');
const {
  asyncHandler,
  sendSuccess,
  throwBadRequestError,
  throwNotFoundError,
  throwInternalServerError,
} = require('../utils/utils');

const errorMessages = {
  movieNotFound: 'Фильм с указанным _id не найдена.',
  createMovieBadRequest: 'Переданы некорректные данные при сохранении фильма.',
  removeMovieBadRequest: 'Переданы некорректные данные при удалении фильма.',
};

module.exports.getMovies = asyncHandler((_, res) => Movie.find({})
  .then((cards) => sendSuccess(res, cards)));

module.exports.removeMovie = asyncHandler((req, res) => {
  const { movieId } = req.params;
  return Movie.findOneAndRemove({ _id: movieId, owner: req.user._id })
    .orFail(() => throwNotFoundError(errorMessages.movieNotFound))
    .then(() => sendSuccess(res))
    .catch((error) => {
      if (error.name === 'CastError') throwBadRequestError(errorMessages.removeMovieBadRequest);
      if (error.statusCode === 404) throwNotFoundError(error);
      throwInternalServerError();
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
      if (error.name === 'ValidationError') throwBadRequestError(errorMessages.createMovieBadRequest);
      throwInternalServerError();
    });
});
