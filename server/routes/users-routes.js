const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const express = require('express');
const router = express.Router();
const multer = require('multer');
var path = require('path');

const _ = require('lodash');
const {
  ObjectID
} = require('mongodb');
const {
  authenticate
} = require('../middleware/authenticate');
let config = require('../config/config.js');
const {
  mongoose
} = require('../db/mongoose');
const seed = process.env.JWT_SECRET;

const {
  User
} = require('../models/user');

const {
  Media
} = require('../models/media');

const {
  CONSTS
} = require('../shared/consts');

const utils = require('../utils/utils.js');
const userOutFields = ['email', 'name', 'adminUser', 'emailUpdates', 'relationship', 'dob', 'twitterId', 'facebookId', '_creator', '_creatorRef', '_profileMediaId', 'location', 'isUrl'];
const userInsertFields = ['email', 'password', 'name', 'adminUser', 'emailUpdates', 'relationship', 'dob', 'twitterId', 'facebookId', '_profileMediaId', 'profilePicInfo'];
const userUpdateFields = ['email', 'name', 'adminUser', 'emailUpdates', 'relationship', 'dob', 'twitterId', 'facebookId', '_profileMediaId', 'profilePicInfo'];



let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './server/public/images/');
  },
  filename: function (req, file, cb) {
    if (!file.originalname.match(/\.(png|jpeg|jpg|gif)$/)) {
      var err = new Error();
      err.code = 'filetype';
      return cb(err);
    } else {
      cb(null, 'file_' + Date.now() + '.' + file.originalname.split('.').pop());
    }
  }
});
let multerUpload = multer({
  storage: storage,
  limits: {
    fileSize: 10000000
  }
}).single('file');

// let processFileName = (folder, inFileName) => {
//     console.log("processFileName", folder, inFileName);
//     return new Promise((resolve, reject) => {
//         let fileName = inFileName;
//         let location = path.join(folder, fileName);
//         console.log("Promise", folder, fileName, location);
//         Media.findOne({
//             location
//         }).then((media) => {
//             if (media && media.location === location) {
//                 fileName = 'x' + fileName;
//                 console.log("media && media.location === location", fileName);
//                 processFileName(folder, fileName);
//             } else {
//                 console.log("NOT media && media.location === location", fileName);
//                 return resolve(fileName);
//             };
//         }, (e) => {
//             console.log("reject", e);
//             return reject(e);
//         });
//     });
// };

let upload = (req, res, next) => {
  //console.log('upload',req, res);
  multerUpload(req, res, function (err) {
    //console.log('multerUpload',err);
    req.passedUser = JSON.parse(req.body.user);
    delete req.body.user;
    console.log('req.file', req.file);
    if (err) {
      console.log('user patch err', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        console.log('File size is too large. Max limit is 10MB');
      } else if (err.code === 'filetype') {
        console.log('Filetype is invalid. Must be .png .jpeg or .jpg');
      } else {
        console.log('Unable to upload file');
      }
    } else {
      if (!req.file) {
        console.log('No file was selected');
        next();
      } else {
        console.log('user patch File uploaded!');
        let fileName = req.file.filename;
        console.log("newFileName", fileName);
        let media = new Media();
        let location = path.join(req.file.destination, fileName);
        media.location = location;
        media.originalFileName = req.file.originalname;
        media.mimeType = req.file.mimetype;
        media.isUrl = false;
        media.description = 'Profile picture for ' + req.loggedInUser.name;
        media._creator = req.loggedInUser._creatorRef;
        media.addedDate = new Date();
        media.save().then((media) => {
          req.passedUser._profileMediaId = media._id;
          req.body.location = location;
          next();
        }).catch((e) => {
          console.log("multerUpload media.save e", e);
        });

      }
    };
  });
};

let saveMedia = (body, req, _creatorRef, res, func) => {
  let media = new Media();
  media.location = body.profilePicInfo.location;
  media.isUrl = true;
  media.mimeType = body.profilePicInfo.mimeType;
  media.description = 'Profile picture for ' + req.loggedInUser.name;
  media._creator = req.loggedInUser._creatorRef;
  media.addedDate = new Date();
  console.log("create media for filestack media: ", media);
  media.save().then((media) => {
    body._profileMediaId = media._id;
    req.body.location = media.location;
    console.log("body.profilePicInfo media.save success", media);
    func(body, _creatorRef, res, req);
  }).catch((e) => {
    console.log("body.profilePicInfo media.save e", e);
  });
};

let createUser = (body, _creatorRef, res, req) => {
  var user = new User(body);
  user._creatorRef = new ObjectID();
  user._creator = req.loggedInUser._creatorRef;
  user.save().then((user) => {
    user.location = req.body.location;
    res.send(_.pick(user, userOutFields));
  }).catch((e) => {
    console.log("1 router.post('/' e", e);
    res.status(400).send(CONSTS.AN_ERROR_OCURRED);
  });
};

router.post('/', authenticate, upload, (req, res) => {
  if (req.loggedInUser.adminUser) {
    let body = _.pick(req.passedUser, userInsertFields);
    //body._profileMediaId = req.body._profileMediaId;

    if (body.profilePicInfo && body.profilePicInfo.location && body.profilePicInfo.isUrl) {
      saveMedia(body, req, null, res, createUser);
    } else {
      createUser(body, null, res, req);
    };


  } else {
    res.status(401).send(CONSTS.ONLY_ADMIN_USERS_CAN_CREATE_USERS);
  };
});

router.post('/login', (req, res) => {


  let body = _.pick(req.body, ['email', 'password']);
  console.log("body", body);
  User.findByCredentials(body.email, body.password).then((user) => {
    console.log("user", user);
    user.generateAuthToken().then((token) => {
      console.log("token", token);
      res.header('x-auth', token).send(_.pick(user, userOutFields));
    });
  }).catch((e) => {
    console.log("2 router.post('/login' e", e);
    res.status(400).send(CONSTS.AN_ERROR_OCURRED);
  });
});

router.patch('/change-password', authenticate, (req, res) => {

  let token = req.header('x-auth');
  let {
    oldPassword
  } = req.body;
  let {
    newPassword
  } = req.body;
  let decoded;
  if (oldPassword && newPassword) {
    User.findByToken(token).then((user) => {

      if (!user) {
        return Promise.reject();
      };

      try {
        decoded = jwt.verify(token, seed);
      } catch (e) {
        return Promise.reject();
      };

      return bcrypt.compare(oldPassword, user.password);

    }).then((passwordsMatch) => {

      if (passwordsMatch && req.loggedInUser._id == decoded._id) {

        utils.getEncryptedPassword(newPassword, function (err, hash) {
          if (err) {
            console.log("router.patch('/change-password' e", e);
            res.status(400).send(CONSTS.AN_ERROR_OCURRED);
          } else if (hash) {
            let userObj = {
              '_id': decoded._id,
              'tokens.token': token,
              'tokens.access': 'auth'
            };
            let body = {
              password: hash
            };

            User.findOneAndUpdate(userObj, {
              $set: body
            }, {
              new: true
            }).then((user) => {
              if (user) {
                res.send(_.pick(user, userOutFields));
              } else {
                res.status(404).send(CONSTS.USER_NOT_FOUND_FOR_ID);
              };
            }, () => {
              res.status(401).send(CONSTS.NOT_AUTHORISED);
            });
          };
        });
      } else {
        res.status(401).send(CONSTS.NOT_AUTHORISED);
      };
    }).catch((e) => {
      res.status(401).send(CONSTS.NOT_AUTHORISED);
    });
  } else {
    res.status(404).send(CONSTS.AN_OLD_AND_NEW_PASSWORD_MUST_BE_PASSED);
  };
});

let updateUser = (body, _creatorRef, res, req) => {
  console.log('body', body);
  let userObj = {
    _creatorRef
  };
  User.findOneAndUpdate(userObj, {
    $set: body
  }, {
    new: true
  }).populate('_profileMediaId', ['location', 'isUrl']).then((user) => {
    if (user) {
      res.send(_.pick(user, userOutFields));
    } else {
      res.status(404).send(CONSTS.USER_NOT_FOUND_FOR_EMAIL);
    };
  }, (e) => {
    console.log("3 router.patch('/:_creatorRef' e", e);
    res.status(400).send(CONSTS.AN_ERROR_OCURRED);
  });
};

router.patch('/:_creatorRef', authenticate, upload, (req, res) => {
  let _creatorRef = new ObjectID(req.params._creatorRef);
  let token = req.header('x-auth');
  console.log("_creatorRef", _creatorRef);
  User.findOne({
    _creatorRef
  }).then((user) => {
    console.log("user", user);
    console.log("req.body", req.body);
    if (!user) {
      return Promise.reject();
    };
    let decoded;
    try {
      decoded = jwt.verify(token, seed);
    } catch (e) {
      return Promise.reject();
    };
    console.log("req.passedUser1", req.passedUser);

    if (req.loggedInUser.adminUser || req.loggedInUser._creatorRef.toHexString() === _creatorRef.toHexString()) {
      console.log("req.passedUser2", req.passedUser);
      let body = _.pick(req.passedUser, userUpdateFields);
      //body._profileMediaId = req.body._profileMediaId;
      console.log("body profilePicInfo", body);

      if (body.profilePicInfo && body.profilePicInfo.location && body.profilePicInfo.isUrl) {
        saveMedia(body, req, _creatorRef, res, updateUser);
      } else {
        updateUser(body, _creatorRef, res);
      };

    } else {
      if (!req.loggedInUser.adminUser) {
        return res.status(401).send(CONSTS.ONLY_ADMIN_USERS_CAN_UPDATE_OTHER_USERS);
      }
      if (req.loggedInUser._creatorRef != _creatorRef) {
        return res.status(401).send(CONSTS.NON_ADMIN_USERS_CAN_ONLY_UPDATE_THEIR_USER);
      }
    };
  }).catch((e) => {
    console.log("4 router.patch('/:_creatorRef' e", e);
    res.status(401).send(CONSTS.AN_ERROR_OCURRED);
  });
});

router.get('/me', authenticate, (req, res) => {
  res.send(req.loggedInUser);
});

router.get('/getEncryptedPassword', authenticate, (req, res) => {
  if (req.loggedInUser.adminUser) {
    let password = req.header('password');
    utils.getEncryptedPassword(password, function (err, hash) {
      if (!hash) {
        res.status(404).send(CONSTS.INCORRECT_USERNAME_OR_PASSWORD_ENTERED);
      };
      res.send({
        hash
      });
    });
  } else {
    res.status(401).send(CONSTS.ONLY_ADMIN_USERS_CAN_USE_THIS_FUNCTION);
  }
});

router.get('/email/:email', authenticate, (req, res) => {
  let email = req.params.email;
  let userObj = {
    email
  };
  User.findOne(userObj).then((user) => {
    if (user) {
      res.send({
        'emailFound': true,
        '_creatorRef': user._creatorRef
      });
    } else {
      res.send({
        'emailFound': false
      });
    }

  }, (e) => {
    console.log("5a router.get('/   /:email' e", e);
    res.status(400).send(CONSTS.AN_ERROR_OCURRED);
  });
});

router.get('/name/:name', authenticate, (req, res) => {
  let name = req.params.name;
  let userObj = {
    name
  };
  User.findOne(userObj).then((user) => {
    if (user) {
      res.send({
        'nameFound': true,
        '_creatorRef': user._creatorRef
      });
    } else {
      res.send({
        'nameFound': false
      });
    }

  }, (e) => {
    console.log("5a router.get('/name/:name' e", e);
    res.status(400).send(CONSTS.AN_ERROR_OCURRED);
  });
});

router.get('/', authenticate, (req, res) => {

  let userObj = {};

  if (!req.loggedInUser.adminUser) {
    userObj._id = req.loggedInUser._id;
  };

  User.find(userObj).populate('_profileMediaId', ['location', 'isUrl']).then((users) => {
    if (users) {
      users.forEach((user) => {
        users.user = _.pick(user, userOutFields);
      });
      res.send(users);
    } else {
      res.status(404).send(CONSTS.NO_USERS_FOUND);
    }

  }, (e) => {
    console.log("5 router.get('/' e", e);
    res.status(400).send(CONSTS.AN_ERROR_OCURRED);
  });
});

router.delete('/me/token', authenticate, (req, res) => {

  req.loggedInUser.removeToken(req.token).then(() => {
    res.status(200).send(CONSTS.USER_SUCCESSFULLY_LOGGED_OUT);
  }, (e) => {
    console.log("6 router.delete('/me/token' e", e);
    res.status(400).send(CONSTS.AN_ERROR_OCURRED);
  });

});

router.delete('/:_creatorRef', authenticate, (req, res) => {
  let _creatorRef = new ObjectID(req.params._creatorRef);
  let token = req.header('x-auth');
  User.findOne({
    _creatorRef
  }).then((user) => {
    if (!user) {
      return Promise.reject("User not found");
    };
    let decoded;
    try {
      decoded = jwt.verify(token, seed);
    } catch (e) {
      return Promise.reject(e);
    };

    if (req.loggedInUser.adminUser && req.loggedInUser._creatorRef.toHexString() !== _creatorRef.toHexString() && !user.adminUser) {
      let userObj = {
        _creatorRef,
        adminUser: false
      };

      User.findOneAndRemove(userObj).then((user) => {
        if (user) {
          res.send(_.pick(user, userOutFields));
        } else {
          res.status(404).send(CONSTS.USER_NOT_FOUND_FOR_EMAIL);
        };
      }, (e) => {
        console.log("7 router.delete('/:_creatorRef' e", e);
        res.status(400).send(CONSTS.AN_ERROR_OCURRED);
      });

    } else {
      if (!req.loggedInUser.adminUser) {
        res.status(401).send(CONSTS.ONLY_ADMIN_USERS_CAN_DELETE_USERS);
      } else
      if (req.loggedInUser._creatorRef.toHexString() === _creatorRef.toHexString()) {
        res.status(401).send(CONSTS.CANNOT_DELETE_LOGGED_IN_USER);
      } else
      if (user.adminUser) {
        res.status(401).send(CONSTS.CANNOT_DELETE_ADMIN_USER);
      }
    };
  }).catch((e) => {
    console.log("8 router.delete('/:_creatorRef' e", e);
    res.status(401).send(CONSTS.AN_ERROR_OCURRED);
  });
});

module.exports = router;
