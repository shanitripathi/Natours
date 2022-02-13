const express = require('express');

const morgan = require('morgan');

//MY IMPORTS
const AppError = require('./utils/appError');
const globalErrorController = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const narutoRouter = require('./routes/narutoRoutes');

const app = express();

//MIDDLEWARES
app.use(express.json()); //to access the body of a post request we need to use a middleware

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// serve static files using express.static
app.use(express.static(`${__dirname}/public`));

//ROUTES Mounting
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/naruto', narutoRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });
  // let err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.statusCode = 404;
  // err.status = 'fail';
  let message = `Can't find ${req.originalUrl} on this server!`;
  next(new AppError(message, 404)); //IMPORTANT NOTE - whenever an argument is passed to next express knows there's an error and it skips all the middlewares and goes to the global error middleware
});

// creating a global error handling middleware that will catch all the errors
// when a middleware's function argument has its first argument as err than express knows it's an error handling middleware.
app.use(globalErrorController);

module.exports = app;
