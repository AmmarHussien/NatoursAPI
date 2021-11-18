const path = require('path');

const express = require('express');

const morgan = require('morgan');

const rateLimit = require('express-rate-limit');

const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const xss = require('xss-clean');

const hpp = require('hpp');

const cookieParser = require('cookie-parser');

const app = express();

const AppError = require('./utils/appError');

const globalErrorHandler = require('./controllers/errorController');

const tourRoute = require('./routes/tourRoutes');

const userRoute = require('./routes/userRoutes');

const reviewRoute = require('./routes/reviewRoutes');

const viewRoute = require('./routes/viewRoutes');

const bookingRoute = require('./routes/bookingRoutes');

app.set('view engine', 'pug');

app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
//// 1) middleware
//set security http headers
app.use(helmet());

// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// limit requests from same api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an Hour',
});

app.use('/api', limiter);

//body parser
app.use(express.json());

//data sanitization against noSQL query injection

app.use(mongoSanitize());

//data sanitization against XSS

app.use(xss());

// prevent parameter pollution

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//serving static files

//test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.headers);
  next();
});

//3) route
app.use('/', viewRoute);
app.use('/api/v74/tours', tourRoute);
app.use('/api/v74/users', userRoute);
app.use('/api/v74/reviews', reviewRoute);
app.use('/api/v74/booking', bookingRoute);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `can not find ${req.originalUrl} on this server`,
  // });

  // const err = new Error(`can not find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`can not find ${req.originalUrl} on this server`));
});

app.use(globalErrorHandler);
module.exports = app;
