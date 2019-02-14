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
,
addedDate: {
  type: Date
},
}, {
  usePushEach: true
});

const personInsertFields = ['person'];
const personOutFields = ['person', '_id', '_creator'];
const personQueryFields = personOutFields;

var Person = mongoose.model('Person', PersonSchema);

module.exports = {
  Person,
  personInsertFields,
  personOutFields,
  personQueryFields
};