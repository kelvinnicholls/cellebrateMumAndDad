const mongoose = require('mongoose');
const validator = require('validator');

const {
  ObjectID
} = require('mongodb');

const utils = require('../utils/utils.js');

const {
  Tag
} = require('../models/tag');

const {
  Person
} = require('../models/person');

let MemorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 1,
    unique: true
  },
  description: {
    type: String,
    required: true,
    minlength: 1
  },
  addedDate: {
    type: Date
  },
  memoryDate: {
    type: Date
  },
  _creator: {
    required: true,
    type: mongoose.Schema.Types.ObjectId
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  people: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person'
  }],
  medias: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
});


const memoryInsertFields = ['title', '_creator', 'description', 'memoryDate', 'addedDate', 'tags', 'people','medias'];
const memoryOutFields = memoryInsertFields;
memoryOutFields.push('comments');
memoryOutFields.push('_id');

const memoryQueryFields = ['comments', 'title', '_creator', 'description', 'memoryDate', 'addedDate', 'tags', 'people', '_id'];
const memoryUpdateFields = ['title', 'description', 'tags', 'people', 'comment', 'memoryDate','medias'];


// console.log("MemorySchema",utils.schemaToObject(Object.keys(MemorySchema.paths)));

// MemorySchema { title: '',
//   description: '',
//   addedDate: '',
//   memoryDate: '',
//   _creator: '',
//   tags: '',
//   users: '',
//   memorys: '',
//   _id: '' }

MemorySchema.statics.findByCriteria = function (tags, users, fromDate, toDate) {
  let Memory = this;

  let queryObj = utils.genQueryForCriteria(tags, users, fromDate, toDate, "memoryDate");
  return Memory.find(queryObj).populate('comments tags people').then((memories) => {
    return memories;
  }).catch((e) => {
    console.log("MemorySchema.statics.findByCriteria error", e);
    return [];
  });

};


var Memory = mongoose.model('Memory', MemorySchema);

module.exports = {
  Memory,
  memoryInsertFields,
  memoryOutFields,
  memoryQueryFields,
  memoryUpdateFields
};
