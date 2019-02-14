const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');
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
}, {
  usePushEach: true
});


CommentSchema.methods.toJSON = function () {
  let comment = this;
  return _.pick(comment, commentOutFields);
};



const commentInsertFields = ['comment'];
const commentOutFields = commentInsertFields;
commentOutFields.push('commentDate');
commentOutFields.push('_creator');
commentOutFields.push('user');


var Comment = mongoose.model('Comment', CommentSchema);

module.exports = {
  Comment
};
