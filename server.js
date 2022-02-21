const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log('UNHANDLED EXCEPTION');
  console.log('shutting down....');
  server.close(() => {
    process.exit(1); //1 for error 0 for success
  });
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<DATABASE_PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose //returns a promise
  .connect(DB)
  .then(() => {
    console.log('DB connections successful');
  });

//START SERVER
const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`listening on port ${port}!`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('shutting down....');
  server.close(() => {
    process.exit(1); //1 for error 0 for success
  });
});
