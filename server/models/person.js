const mongoose = require('mongoose');
const validator = require('validator');

const {
  ObjectID
} = require('mongodb');

let PersonSchema = new mongoose.Schema({
  _creator: {
    required: true,
    type: mongoose.Schema.Types.ObjectId
  },
  person: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    minlength: 1,
    unique: true
  }
});


var Person = mongoose.model('Person', PersonSchema);

module.exports = {
  Person
};