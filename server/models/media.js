const mongoose = require('mongoose');
const validator = require('validator');
//const mongooseUniqueValidator = require('mongoose-unique-validator');
const {User} = require('../models/user');
const {ObjectID} = require('mongodb');

const utils = require('../utils/utils');

let MediaSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true
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
    description: {
        type: String,
        required: true,
        minlength: 1
    },
    _creator: {
        required: mongoose.Schema.Types.ObjectId,
        type: String
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

    return User.getUserNamesToIdsPromise(users, mongoose).then((userIds) => {
        if (userIds.length === 0 && (users && users.length > 0)) {
            userIds.push(new ObjectID()); // dummy user id so no records are returned
        };
        let queryObj = utils.genQueryForCriteria(tags, userIds, fromDate, toDate, "mediaDate");
        return Media.find(queryObj).then((medias) => {
            return medias;
        }).catch((e) => {
            console.log("MediaSchema.statics.findByCriteria utils.getUserNamesToIdsPromise error", e);
            return [];
        });
    }).catch((e) => {
        console.log("MediaSchema.statics.findByCriteria utils.getUserNamesToIdsPromise error2", e);
        return [];
    });
};

// mongoose middleware fired prior to a save
MediaSchema.pre('save', function (next) {
    User.setUserNamesToIds(this, next);
});

var Media = mongoose.model('Media', MediaSchema);

module.exports = {
    Media
};