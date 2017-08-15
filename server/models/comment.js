const mongoose = require('mongoose');
const validator = require('validator');
const {
  User
} = require('../models/user');

const {
  ObjectID
} = require('mongodb');

let CommentSchema = new mongoose.Schema({
  commentDate: {
    required: true,
    type: Date
  },
  _creator: {
    required: true,
    type: mongoose.Schema.Types.ObjectId
  },
  comment: {
    required: true,
    type: String
  }
});

var Comment = mongoose.model('Comment', CommentSchema);

module.exports = {
  Comment
};