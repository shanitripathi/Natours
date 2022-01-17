const mongoose = require('mongoose');

// the first thing we need to do after our mongodb connection is successful is
// create a mongoose schema

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
});

// after creating the schema a model for the schema must be created (NOTE - the variable name must start with a capital letter)

const Tour = mongoose.model('tour', tourSchema);

module.exports = Tour;
