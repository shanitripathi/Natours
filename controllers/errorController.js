const AppError = require('../utils/appError');

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
    console.error('Error!', err.message);
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
    let error = { ...err };

    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.code === 11000) error = handleDuplicateKeyDB(error);
    sendProdError(error, res);
  }
};
