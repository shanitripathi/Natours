const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

// the first thing we need to do after our mongodb connection is successful is
// create a mongoose schema

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      maxLength: [40, 'A tour must have less than 40 characters'],
      minLength: [10, 'A tour must have more than 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
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
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'RatingsAverage must be more than 1'],
      max: [5, 'RatingsAverage must be less than 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          return value < this.price;
        },
        message: 'Discount Price ({VALUE}) must be less than regular price', //use capital VALUE to access the current value in message string.
      },
    },
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtuals are defined on the schema but are not a part of the database
tourSchema.virtual('durationInWeeks').get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE - pre runs before save and create only

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// QUERY MIDDLEWARE - runs before find method

tourSchema.pre(/^find/, function (next) {
  // do something
  next();
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
