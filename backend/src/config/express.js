const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const routes = require('../api/routes/v1');
const { logs, maxRequests, frontendUrl } = require('./vars');
const strategies = require('./passport');
const { handler: errorHandler, converter: errorConverter, notFound } = require('../api/middlewares/error');
const { logger } = require('./logger');

const app = express();
app.set('trust proxy', 1);

app.use((req, res, next) => {
  res.on('finish', () => {
    logger.info(`::::: ${req.method} ${req.originalUrl} → ${res.statusCode} :::::`);
  });
  next();
});

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: maxRequests,
  message: { message: 'Too many requests from this IP, please try again after 1 minute' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.user && req.user.id ? `${req.user.id}:${req.ip}` : req.ip),
});
app.use(limiter);

app.use(morgan(logs, { stream: logger.stream }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(compress());
app.use(methodOverride());
app.use(helmet());
app.use(cors({
  origin: frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(passport.initialize());
passport.use('jwt', strategies.jwt);

app.use('/v1', routes);

app.use(errorConverter);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
