const mongoose = require('mongoose');
const validator = require('validator');
//const mongooseUniqueValidator = require('mongoose-unique-validator');
const {
  User
} = require('../models/user');
const {
  ObjectID
} = require('mongodb');

const utils = require('../utils/utils');

let MediaSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true
  },
  isProfilePic: {
    required: true,
    type: Boolean
  },
  isUrl: {
    required: true,
    type: Boolean
  },
  originalFileName: {
    type: String,
    trim: true,
    minlength: 1
  },
  mimeType: {
    type: String,
    required: function () {
      return !this.isUrl;
    },
    minlength: 1
  },
  title: {
    type: String,
    required: true,
    minlength: 1
  },
  description: {
    type: String,
    minlength: 1
  },
  _creator: {
    required: true,
    type: mongoose.Schema.Types.ObjectId
  },
  addedDate: {
    type: Date
  },
  mediaDate: {
    type: Date
  },
  tags: [String],
  users: [mongoose.Schema.Types.Mixed]
});

//console.log("MediaSchema",utils.schemaToObject(Object.keys(MediaSchema.paths)));

// MediaSchema { location: '',
//   isUrl: '',
//   mimeType: '',
//   description: '',
//   _creator: '',
//   addedDate: '',
//   mediaDate: '',
//   tags: '',
//   users: '',
//   _id: '' }

//MediaSchema.plugin(mongooseUniqueValidator);


MediaSchema.statics.findByCriteria = function (tags, users, fromDate, toDate) {
  let Media = this;

  let queryObj = utils.genQueryForCriteria(tags, users, fromDate, toDate, "mediaDate");
  return Media.find(queryObj).then((medias) => {
    return medias;
  }).catch((e) => {
    console.log("MediaSchema.statics.findByCriteria  error", e);
    return [];
  });
};

var Media = mongoose.model('Media', MediaSchema);

module.exports = {
  Media
};
