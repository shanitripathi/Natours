const mongoose = require('mongoose');

// the first thing we need to do after our mongodb connection is successful is
// create a mongoose schema

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  priceDiscount: Number,
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
  summary: {
    type: String,
    trim: true, //only works for strings -- removes all the whitespaces from a string
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a description'],
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false, //excludes it from the schema
  },
  startDates: [Date],
});

// after creating the schema a model for the schema must be created (NOTE - the variable name must start with a capital letter)

const Tour = mongoose.model('tour', tourSchema);

//documents can be created in 2 ways
// const testTour = new Tour({
//   ///your data here
// });
// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log('there was an error while creating your doc');
//   });

//other way

// Tour.create({}).then.catch

module.exports = Tour;
