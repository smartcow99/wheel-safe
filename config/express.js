const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const router = require('../modules');
const morganConfig = require('./morgan');

const app = express();

app.set('trust proxy', true);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.raw());
app.use(express.text());
app.use(cors());

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', morganConfig));
} else {
  app.use(morgan('dev'));
}

app.use(`/${process.env.API_VERSION}/shippers`, router);

module.exports = app;
