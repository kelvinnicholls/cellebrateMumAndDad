const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const moment = require('moment');

const config = require('../config/config.js');
const utils = require('../utils/utils.js');
//const {Media} = require('../models/media');

const seed = process.env.JWT_SECRET;

const userOutFields = ['email', 'name', 'adminUser', 'emailUpdates', 'relationship', 'dob', 'twitterId', 'facebookId', '_creator', '_creatorRef', '_profileMediaId', 'location', 'isUrl'];
const userInsertFields = ['email', 'password', 'name', 'adminUser', 'emailUpdates', 'relationship', 'dob', 'twitterId', 'facebookId', '_profileMediaId', 'profilePicInfo'];
const userUpdateFields = ['email', 'name', 'adminUser', 'emailUpdates', 'relationship', 'dob', 'twitterId', 'facebookId', '_profileMediaId', 'profilePicInfo'];


let UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: function (v) {
        return validator.isEmail(v);
      },
      message: '{VALUE} is not a valid email!'
    }
  },
  _creatorRef: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 1
  },
  adminUser: {
    required: true,
    type: Boolean
  },
  emailUpdates: {
    required: true,
    type: Boolean
  },
  relationship: {
    type: String,
    required: true,
    minlength: 1
  },
  dob: {
    type: Date
  },
  _profileMediaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  },
  twitterId: {
    type: String
  },
  facebookId: {
    type: String
  },
  _creator: {
    required: true,
    type: mongoose.Schema.Types.ObjectId
  },
  tokens: [{
    access: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    }
  }]
});

// console.log("UserSchema",utils.schemaToObject(Object.keys(UserSchema.paths)));

//  { email: '',
//   password: '',
//   name: '',
//   adminUser: '',
//   relationship: '',
//   dob: '',
//   profilePhotoLocation: '',
//   twitterId: '',
//   facebookId: '',
//   _creator: '',
//   tokens: '',
//   _id: '' }

//override this method
UserSchema.methods.toJSON = function () {
  let user = this;
  let userObject = user.toObject();
  return _.pick(userObject, userOutFields);
};

UserSchema.methods.generateAuthToken = function () {
  let user = this;
  let access = 'auth';
  let token = jwt.sign({
    _id: user._id.toHexString(),
    access
  }, seed).toString();
  user.tokens.push({
    access,
    token
  });
  return user.save().then(() => {
    return token;
  })
};

UserSchema.methods.removeToken = function (token) {
  let user = this;
  return user.update({
    // if token in tokens array matches passed token the element is removed from the array
    $pull: {
      tokens: {
        token: token
      }
    }
  });
};

UserSchema.statics.findByCredentials = function (email, password) {
  let User = this;
  return User.findOne({
    email
  }).populate('_profileMediaId', ['location','isUrl']).then((user) => {
    if (!user) {
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (!err && res) {
          return resolve(user);
        };
        reject();
      });
    });
  });
};


UserSchema.statics.findByToken = function (token) {
  let User = this;
  let decoded;
  try {
    decoded = jwt.verify(token, seed);
  } catch (e) {
    return Promise.reject();

  }
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  }).populate('_profileMediaId', ['location','isUrl'])
};



// UserSchema.statics.setUserIdsToNames = function (ids) {
//   return new Promise((resolve, reject) => {
//     let User = this;
//     let retArray = [];
//     let numIds = ids.length;
//     let idCount = 0;
//     if (numIds > 0) {
//       ids.forEach(function (id) {
//         User.findById(id).then((user) => {
//           if (user) {
//             retArray.push(user.name);
//           };
//           idCount++;
//           if (idCount === numIds) {
//             return resolve(retArray);
//           }
//         }, (e) => {
//           return reject(e);
//         });
//       });
//     } else {
//       return resolve(retArray);
//     };
//   });
// };


// UserSchema.statics.getUserNamesToIdsPromise = function (users, mongoose) {

//   return new Promise((resolve, reject) => {
//     let User = this;
//     let userIds = [];
//     if (users && users.length > 0) {
//       let numUsers = users.length;
//       let userCount = 0;
//       users.forEach(function (name) {
//         User.findOne({
//           name
//         }).then((user) => {
//           if (user) {
//             //userIds.push(mongoose.Types.ObjectId(user._id));
//             userIds.push(user._id);
//           };
//           userCount++;
//           if (userCount === numUsers) {
//             resolve(userIds);
//           };
//         }, (e) => {
//           reject(e);
//         });
//       });

//     } else {
//       resolve(userIds);
//     };
//   });
// };

// UserSchema.statics.setUserNamesToIds = function (obj, next) {

//   let User = this;
//   let users = obj.users;
//   let userIds = [];
//   let numUsers = obj.users.length;
//   let userCount = 0;

//   if (numUsers > 0) {
//     users.forEach(function (name) {
//       User.findOne({
//         name
//       }).then((user) => {
//         if (user) {
//           userIds.push(user._id);
//         };
//         userCount++;
//         if (userCount === numUsers) {
//           obj.users = userIds;
//           return next();
//         }
//       }, (e) => {
//         return
//       });
//     });
//   } else {
//     return next();
//   };
// };

// UserSchema.statics.setObjUserIdsToNames = function (objects, res, ObjectsName) {
//   let User = this;
//   if (objects && objects.length > 0) {
//     let numObj = objects.length;
//     let objCount = 0;
//     objects.forEach(function (obj) {
//       User.setUserIdsToNames(obj.users).then((names) => {
//         obj.users = names;
//         objCount++;
//         if (objCount === numObj) {
//           let obj = {};
//           obj[ObjectsName] = objects;
//           return res.send(obj);
//         };

//       }).catch((e) => {
//         res.status(400).send();
//       });
//     }, (e) => {
//       res.status(400).send();
//     });
//   } else {
//     let obj = {};
//     obj[ObjectsName] = objects;
//     res.send(obj);
//   };

// };



// mongoose middleware fired prior to a save
UserSchema.pre('save', function (next) {
  let user = this;
  if (user.isModified('password')) {
    utils.getEncryptedPassword(this.password, function (err, hash) {
      if (hash) {
        user.password = hash;
      };
      next();
    });
  } else {
    next();
  };
});

var User = mongoose.model('User', UserSchema);

module.exports = {
  User,
  seed,
  userOutFields,
  userInsertFields,
  userUpdateFields
}


