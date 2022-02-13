const mongoose = require('mongoose');

// first thing is to create a schema for your database collection

const narutoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'a shinobi should have a name'],
    unique: true,
  },
  age: Number,
  village: String,
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false, //excludes it from the schema
  },
  team: Number,
});

// create a model also called a collection

module.exports = mongoose.model('Naruto', narutoSchema);
