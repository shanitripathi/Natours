module.exports = (err, req, res, next) => {
  console.log(err);
  err.statusCode = err.statusCode || 500; //if no status code is found than use 500 as default.
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
