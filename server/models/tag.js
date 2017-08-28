const mongoose = require('mongoose');
const validator = require('validator');

const {
  ObjectID
} = require('mongodb');

let TagSchema = new mongoose.Schema({
  _creator: {
    required: true,
    type: mongoose.Schema.Types.ObjectId
  },
  tag: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    minlength: 1,
    unique: true
  },
  addedDate: {
    type: Date
  },
});

const tagInsertFields = ['tag'];
const tagOutFields = ['tag', '_id'];
const tagQueryFields = tagOutFields;



var Tag = mongoose.model('Tag', TagSchema);

module.exports = {
  Tag,
  tagInsertFields,
  tagOutFields,
  tagQueryFields
};
