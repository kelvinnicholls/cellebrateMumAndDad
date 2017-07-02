const mongoose = require('mongoose');
const validator = require('validator');
const {User} = require('../models/user');
const {ObjectID} = require('mongodb');

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
    users: [mongoose.Schema.Types.Mixed],
    medias: [{type : mongoose.Schema.Types.ObjectId, ref : 'Media' }]
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
    
    return User.getUserNamesToIdsPromise(users, mongoose).then((userIds) => {
        if (userIds.length === 0 && (users && users.length > 0)) {
            userIds.push(new ObjectID()); // dummy user id so no records are returned
        };
        let queryObj = utils.genQueryForCriteria(tags, userIds, fromDate, toDate, "memoryDate");
        return Memory.find(queryObj).then((memories) => {
            return memories;
        }).catch((e) => {
            console.log("MemorySchema.statics.findByCriteria utils.getUserNamesToIdsPromise error1", e);
            return [];
        });
    }).catch((e) => {
        console.log("MemorySchema.statics.findByCriteria utils.getUserNamesToIdsPromise error1 error2", e);
        return [];
    });
};

// mongoose middleware fired prior to a save
MemorySchema.pre('save', function (next) {
    User.setUserNamesToIds(this,next);
});

var Memory = mongoose.model('Memory', MemorySchema);

module.exports = {
    Memory
};