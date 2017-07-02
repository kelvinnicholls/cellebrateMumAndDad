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
const userOutFields = ['email', 'name', 'adminUser', 'relationship', 'dob', 'twitterId', 'facebookId', '_creator', '_creatorRef', '_profileMediaId', 'location'];
const userInsertFields = ['email', 'password', 'name', 'adminUser', 'relationship', 'dob', 'twitterId', 'facebookId', '_profileMediaId'];
const userUpdateFields = ['email', 'name', 'adminUser', 'relationship', 'dob', 'twitterId', 'facebookId', '_profileMediaId'];



let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/');
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
    multerUpload(req, res, function (err) {
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
                media.description = 'Profile picture for ' + req.user.name;
                media._creator = req.user._creatorRef;
                media.addedDate = new Date();
                media.save().then((media) => {
                    req.body._profileMediaId = media._id;
                    req.body.location = location;
                    next();
                }).catch((e) => {
                    console.log("multerUpload media.save e", e);
                });

            }
        };
    });
};


router.post('/', authenticate, upload, (req, res) => {
    if (req.user.adminUser) {
        let body = _.pick(JSON.parse(req.body.user), userInsertFields);
        body._profileMediaId = req.body._profileMediaId;
        var user = new User(body);
        user._creatorRef = new ObjectID();
        user._creator = user._creatorRef;
        user.save().then((user) => {
            user.location = req.body.location;
            res.send(_.pick(user, userOutFields));
        }).catch((e) => {
            console.log("1 router.post('/' e", e);
            res.status(400).send(CONSTS.AN_ERROR_OCURRED);
        });
    } else {
        res.status(401).send(CONSTS.ONLY_ADMIN_USERS_CAN_CREATE_USERS);
    };
});

router.post('/login', (req, res) => {

    let body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        user.generateAuthToken().then((token) => {
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

            if (passwordsMatch && req.user._id == decoded._id) {

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



router.patch('/:_creatorRef', authenticate, upload, (req, res) => {
    let _creatorRef = new ObjectID(req.params._creatorRef);
    let token = req.header('x-auth');
    User.findOne({
        _creatorRef
    }).then((user) => {
        if (!user) {
            return Promise.reject();
        };
        let decoded;
        try {
            decoded = jwt.verify(token, seed);
        } catch (e) {
            return Promise.reject();
        };

        if (req.user.adminUser || req.user._creatorRef.toHexString() === _creatorRef.toHexString()) {
            let body = _.pick(JSON.parse(req.body.user), userUpdateFields);
            body._profileMediaId = req.body._profileMediaId;

            console.log('body', body);
            let userObj = {
                _creatorRef
            };
            User.findOneAndUpdate(userObj, {
                $set: body
            }, {
                new: true
            }).populate('_profileMediaId', ['location']).then((user) => {
                if (user) {
                    res.send(_.pick(user, userOutFields));
                } else {
                    res.status(404).send(CONSTS.USER_NOT_FOUND_FOR_EMAIL);
                };
            }, (e) => {
                console.log("3 router.patch('/:_creatorRef' e", e);
                res.status(400).send(CONSTS.AN_ERROR_OCURRED);
            });

        } else {
            if (!req.user.adminUser) {
                return res.status(401).send(CONSTS.ONLY_ADMIN_USERS_CAN_UPDATE_OTHER_USERS);
            }
            if (req.user._creatorRef != _creatorRef) {
                return res.status(401).send(CONSTS.NON_ADMIN_USERS_CAN_ONLY_UPDATE_THEIR_USER);
            }
        };
    }).catch((e) => {
        console.log("4 router.patch('/:_creatorRef' e", e);
        res.status(401).send(CONSTS.AN_ERROR_OCURRED);
    });
});

router.get('/me', authenticate, (req, res) => {
    res.send(req.user);
});

router.get('/getEncryptedPassword', authenticate, (req, res) => {
    if (req.user.adminUser) {
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


router.get('/', authenticate, (req, res) => {

    let userObj = {};

    if (!req.user.adminUser) {
        userObj._id = req.user._id;
    };

    User.find(userObj).populate('_profileMediaId', ['location']).then((users) => {
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

    req.user.removeToken(req.token).then(() => {
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

        if (req.user.adminUser && req.user._creatorRef.toHexString() !== _creatorRef.toHexString() && !user.adminUser) {
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
            if (!req.user.adminUser) {
                res.status(401).send(CONSTS.ONLY_ADMIN_USERS_CAN_DELETE_USERS);
            } else
            if (req.user._creatorRef.toHexString() === _creatorRef.toHexString()) {
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