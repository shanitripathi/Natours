const express = require('express');

const morgan = require('morgan');

//MY IMPORTS
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

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

app.use('/', (req, res) => {
  res.send('doesnt exist');
});

module.exports = app;
