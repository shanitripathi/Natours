const AppError = require('../utils/appError');

const handleJWTError = (err) => {
  return new AppError('Invalid token! Please log in again', 401);
};
const handleTokenExpired = (err) => {
  return new AppError('Your token has expired! Please log in again', 401);
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  // const message = `Invalid ${err.path}: ${err.value}`;

  const errMessages = Object.values(err.errors).map((obj) => {
    return obj.message;
  });
  const message = errMessages.join('. ');
  return new AppError(message, 400);
};

const handleDuplicateKeyDB = (err) => {
  const message = `Duplicate field value ${err.keyValue.name}. Please use another value!`;
  return new AppError(message, 400);
};

const sendDevError = (err, res) => {
  console.log(err, 'this is the error form dev');
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// if error is related to business logic like wrong route, incorrect data from client then its called operational error
// if error is related to programming logic then we use a generic response for that error

const sendProdError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('Error!', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; //if no status code is found than use 500 as default.
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendDevError(err, res);
  } else {
    let error = Object.assign(err);
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.code === 11000) error = handleDuplicateKeyDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (err.name === 'TokenExpiredError') error = handleTokenExpired(error);
    sendProdError(error, res);
  }
};
