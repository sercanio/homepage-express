'use strict';
const express = require('express');
const httpErrors = require('http-errors');
const path = require('path');
const helmet = require("helmet");
const pug = require('pug');
const pino = require('pino');
const pinoHttp = require('pino-http');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

module.exports = async function main(options, cb) {
  // Set default options
  const ready = cb || function () { };
  const opts = Object.assign(
    {
      // Default options
      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
      awsSecretKey: process.env.AWS_SECRET_KEY,
      awsRegion: process.env.AWS_REGION
    },
    options
  );

  const logger = pino();

  // Server state
  let server;
  let serverStarted = false;
  let serverClosing = false;

  // mongoose configuration
  mongoose.set('strictQuery', false);
  const mongoDB =
    process.env.NODE_ENV === 'production'
      ? process.env.MONGODB_CONNECTION_STRING
      : process.env.MONGODB_CONNECTION_STRING_LOCAL;

  // const mongoDB = 'mongodb://127.0.0.1:27017/blogDB';
  await mongoose.connect(mongoDB);
  logger.info('Connected to the DB');

  // Setup error handling
  function unhandledError(err) {
    // Log the errors
    logger.error(err);

    // Only clean up once
    if (serverClosing) {
      return;
    }
    serverClosing = true;

    // If server has started, close it down
    if (serverStarted) {
      server.close(function () {
        process.exit(1);
      });
    }
  }
  process.on('uncaughtException', unhandledError);
  process.on('unhandledRejection', unhandledError);

  // Create the express app
  const app = express();

  // app.use(helmet())
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "default-src": ["'self'"],
          "img-src": ["'self'", "s3.eu-central-1.amazonaws.com/sercan.io/"],
          "script-src": ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "cdn.tiny.cloud", "cdnjs.cloudflare.com", "googletagmanager.com", "localhost"],
          "script-src-attr": ["'unsafe-inline'", "'self'"],
          "style-src": ["'unsafe-inline'", "'self'", "cdn.jsdelivr.net", "fonts.googleapis.com", "gstatic.com"],
        },
      },
    }),
  );
  app.use(express.urlencoded({ extended: true }));

  // parse json response
  app.use(express.json());

  // Static files
  app.use(express.static(path.join(__dirname, 'public')));

  // Template engine
  app.engine('pug', pug.renderFile);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');

  // Session middleware
  app.set('trust proxy', true)
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      store: MongoStore.create({ mongoUrl: mongoDB }),
      cookie: {
        maxAge: +process.env.SESSION_COOKIE_MAXAGE,
        secure: process.env.NODE_ENV === 'production', // Set to true if your app is served over HTTPS
        httpOnly: true,
        sameSite: 'strict',
      },
    }),
  );
  // Common middleware
  // app.use(/* ... */)
  app.use(pinoHttp({ logger }));

  // Register routes
  // @NOTE: require here because this ensures that even syntax errors
  // or other startup related errors are caught logged and debuggable.
  // Alternativly, you could setup external log handling for startup
  // errors and handle them outside the node process.  I find this is
  // better because it works out of the box even in local development.
  require('./routes')(app, opts);

  // TinyMCE integration
  app.use(
    '/tinymce',
    express.static(path.join(__dirname, 'node_modules', 'tinymce'))
  );

  // Common error handlers
  app.use(function fourOhFourHandler(req, res, next) {
    next(httpErrors(404, `Page not found`));
  });
  app.use(function fiveHundredHandler(err, req, res, next) {
    if (err.status >= 500) {
      logger.error(err);
    }
    res.locals.name = err.status;
    res.locals.error = err;
    res.status(err.status || 500).render('error', { message: err.message });
  });

  // Start server
  server = app.listen(opts.port, opts.host, function (err) {
    if (err) {
      return ready(err, app, server);
    }

    // If some other error means we should close
    if (serverClosing) {
      return ready(new Error('Server was closed before it could start'));
    }

    serverStarted = true;
    const addr = server.address();
    logger.info(
      `Started at ${opts.host || addr.host || 'localhost'}:${addr.port}`
    );
    ready(err, app, server);
  });
};
