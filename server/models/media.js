const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');
//const mongooseUniqueValidator = require('mongoose-unique-validator');

const {
  ObjectID
} = require('mongodb');

const utils = require('../utils/utils');

const {
  Tag
} = require('../models/tag');

const {
  Person
} = require('../models/person');

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
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  people: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
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


const mediaInsertFields = ['title', '_creator', 'location', 'isUrl', 'mimeType', 'isProfilePic', 'description', 'mediaDate', 'addedDate', 'tags', 'people', 'originalFileName', 'photoInfo'];
const mediaOutFields = mediaInsertFields;
mediaOutFields.push('comments');
mediaOutFields.push('_id');

const mediaQueryFields = ['comments', 'title', '_creator', 'location', 'isUrl', 'mimeType', 'isProfilePic', 'description', 'mediaDate', 'addedDate', 'tags', 'people', '_id'];
const mediaUpdateFields = ['title', 'description', 'tags', 'people', 'comment', 'mediaDate'];


MediaSchema.statics.findByCriteria = function (tags, people, fromDate, toDate) {
  let Media = this;

  let queryObj = utils.genQueryForCriteria(tags, people, fromDate, toDate, "mediaDate");
  return Media.find(queryObj).populate('comments tags people').then((medias) => {
    return medias;
  }).catch((e) => {
    console.log("MediaSchema.statics.findByCriteria  error", e);
    return [];
  });
};

var Media = mongoose.model('Media', MediaSchema);

module.exports = {
  Media,
  mediaInsertFields,
  mediaOutFields,
  mediaQueryFields,
  mediaUpdateFields
};
