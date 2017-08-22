const mongoose = require('mongoose');
const validator = require('validator');

const {
  ObjectID
} = require('mongodb');

const utils = require('../utils/utils.js');


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
  tags: [String],
  users: [{
    type: mongoose.Schema.Types.ObjectId
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

// console.log("MemorySchema",utils.schemaToObject(Object.keys(MemorySchema.paths)));

// MemorySchema { title: '',
//   description: '',
//   addedDate: '',
//   memoryDate: '',
//   _creator: '',
//   tags: '',
//   users: '',
//   medias: '',
//   _id: '' }

MemorySchema.statics.findByCriteria = function (tags, users, fromDate, toDate) {
  let Memory = this;

  let queryObj = utils.genQueryForCriteria(tags, users, fromDate, toDate, "memoryDate");
  return Memory.find(queryObj).populate('comments').then((memories) => {
    return memories;
  }).catch((e) => {
    console.log("MemorySchema.statics.findByCriteria error", e);
    return [];
  });

};


var Memory = mongoose.model('Memory', MemorySchema);

module.exports = {
  Memory
};
