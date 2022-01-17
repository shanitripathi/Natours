const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose //returns a promise
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false, //// these are for deprecation warnnings
  })
  .then(() => {
    console.log('DB connections successful');
  });

//START SERVER
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`listening on port ${port}!`);
});
