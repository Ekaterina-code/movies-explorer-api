const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('./middlewares/errorHandler');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { isProduction } = require('./utils/utils');

const config = `${__dirname}/.env`;
require('dotenv').config({ path: config });

const { PORT = 3001, ALLOWED_CORS = 'http://localhost:3000', DB_CONN } = process.env;
const allowedCors = ALLOWED_CORS.split(';').map((origin) => origin.trim());

function setCorsHeaders(req, res, origin) {
  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';
  const requestHeaders = req.headers['access-control-request-headers'];
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
  res.header('Access-Control-Allow-Headers', requestHeaders);
}

mongoose
  .connect(isProduction() ? DB_CONN : 'mongodb://localhost:27017/moviesdb', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .catch((err) => console.log(err));

const app = express();
app.use(requestLogger);
app.use((req, res, next) => {
  const { origin } = req.headers;
  if (allowedCors.includes(origin)) {
    setCorsHeaders(req, res, origin);
    if (req.method === 'OPTIONS') {
      return res.status(200).send();
    }
  }
  return next();
});
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/users', require('./routes/users'));
app.use('/movies', require('./routes/movies'));
app.use('/', require('./routes/root'));

app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

const server = app.listen(PORT, (error) => {
  if (error) {
    console.log(`Error: ${error}`);
    return;
  }
  console.log(`Server listening on port ${server.address().port}`);
});
