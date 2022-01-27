const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<DATABASE_PASSWORD>',
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

const data = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

const importData = async () => {
  try {
    const tours = await Tour.create(data);
    console.log('data successfully imported');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async (data) => {
  try {
    const data = await Tour.deleteMany();
    console.log('data successfully deleted');
    process.exit(); //exit the process
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
