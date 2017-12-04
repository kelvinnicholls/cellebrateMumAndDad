const express = require('express');
const googleCloudApi = require('../shared/google-cloud-api');
const fs = require('fs');
const router = express.Router();
const _ = require('lodash');
var path = require('path');
const utils = require('../utils/utils.js');
const {
  authenticate
} = require('../middleware/authenticate');

const {
  ObjectID
} = require('mongodb');

const {
  Media,
  mediaInsertFields,
  mediaOutFields,
  mediaQueryFields,
  mediaUpdateFields
} = require('../models/media');

const {
  User
} = require('../models/user');


const {
  Comment
} = require('../models/comment');

const config = require('../config/config.js');
const {
  mongoose
} = require('../db/mongoose');

const {
  multerUploadSingleFile,
  processErr
} = require('../shared/file-upload');


let upload = (req, res, next) => {
  utils.log(utils.LoglevelEnum.Info, 'upload', req, res);
  multerUploadSingleFile(req, res, function (err) {
    utils.log(utils.LoglevelEnum.Info, 'media-routes multerUploadSingleFile', err);
    utils.log(utils.LoglevelEnum.Info, 'req.body.media', req.body.media);
    req.passedMedia = JSON.parse(req.body.media);
    delete req.body.media;
    utils.log(utils.LoglevelEnum.Info, 'req.file', req.file);
    if (err) {
      processErr(err);
    } else {
      if (!req.file) {
        utils.log(utils.LoglevelEnum.Info, 'No file was selected');
      } else {
        utils.log(utils.LoglevelEnum.Info, 'media patch File uploaded!');
        let fileName = req.file.filename;
        utils.log(utils.LoglevelEnum.Info, "newFileName", fileName);
        let location = path.join(req.file.destination, fileName);
        req.passedMedia.location = location;
        req.passedMedia.originalFileName = req.file.originalname;
        req.passedMedia.mimeType = req.file.mimetype;
        req.passedMedia.isProfilePic = false;
        req.passedMedia.isUrl = false;
        googleCloudApi.uploadFile(location);
      };
      next();
    };
  });
};


let addUserToComments = (media) => {
  return new Promise((resolve, reject) => {
    let retMedia = JSON.parse(JSON.stringify(media));
    let numComments = retMedia.comments.length;
    let processedComments = 0;
    let commentsArr = [];

    utils.log(utils.LoglevelEnum.Info, 'addUserToComments', 'numComments', numComments);
    if (retMedia.comments && retMedia.comments.length > 0) {
      for (let comment of retMedia.comments) {
        utils.log(utils.LoglevelEnum.Info, 'addUserToComments', 'comment', comment);
        let userObj = {
          '_creatorRef': comment._creator
        };
        User.findOne(userObj).populate('_profileMediaId', ['location']).then((user) => {
          utils.log(utils.LoglevelEnum.Info, 'addUserToComments', 'user', user);
          utils.log(utils.LoglevelEnum.Info, 'addUserToComments', 'typeof user', typeof user);
          utils.log(utils.LoglevelEnum.Info, 'addUserToComments', 'typeof comment', typeof comment);
          if (user) {
            delete user._id;
            let newComment = JSON.parse(JSON.stringify(comment));
            utils.log(utils.LoglevelEnum.Info, 'addUserToComments', 'user.name', user.name);
            utils.log(utils.LoglevelEnum.Info, 'addUserToComments', 'user._profileMediaId', user._profileMediaId);
            newComment.user = {};
            utils.log(utils.LoglevelEnum.Info, 'addUserToComments', 'newComment.user', newComment.user);
            newComment.user.name = user.name;
            newComment.user._profileMediaId = user._profileMediaId;
            utils.log(utils.LoglevelEnum.Info, 'addUserToComments', 'newComment.user2', newComment.user);

            commentsArr.push(newComment);
            utils.log(utils.LoglevelEnum.Info, 'addUserToComments', 'newComment', newComment);
          };

          processedComments++;
          if (numComments === processedComments) {
            retMedia.comments = commentsArr;
            utils.log(utils.LoglevelEnum.Info, 'addUserToComments', 'resolve', retMedia);
            return resolve(retMedia);
          };
        }, (e) => {
          reject(e);
        });
      };
    } else {
      return resolve(retMedia);
    };
  });
};



let transformCreatorToUser = (medias) => {
  return new Promise((resolve, reject) => {
    let numMedias = medias ? medias.length : 0;
    utils.log(utils.LoglevelEnum.Info,"medias.transformCreatorToUser numMedias",numMedias);
    let processedMedias = 0;
    let transformedMedias = [];
    if (numMedias > 0) {
      for (let media of medias) {
        if (media.comments && media.comments.length > 0) {
          let numComments = media.comments.length;
          let processedComments = 0;
          for (let comment of media.comments) {
            let userObj = {
              '_creatorRef': comment._creator
            };
            User.findOne(userObj).populate('_profileMediaId', ['location']).then((user) => {
              if (user) {
                delete user._id;
                comment.user = user;
              };
              processedComments++;
              if (numComments === processedComments) {
                transformedMedias.push(media);
                processedMedias++;
                if (numMedias === processedMedias) {
                  return resolve(transformedMedias);
                };
              };
            }, (e) => {
              reject(e);
            });
          };
        } else {
          transformedMedias.push(media);
          processedMedias++;
          if (numMedias === processedMedias) {
            return resolve(transformedMedias);
          };
        };
      };
    } else {
      return resolve(transformedMedias);
    };
  });
};

let downloadFiles = (medias) => {
  return new Promise((resolve, reject) => {
    let numMedias = medias ? medias.length : 0;
    let processedMedias = 0;
    if (numMedias > 0) {
      for (let media of medias) {
        downloadFile(media);
        processedMedias++;
        if (numMedias === processedMedias) {
          return resolve();
        };
      }
    } else {
      return resolve();
    };
  });
};



let downloadFile = (media) => {
  return new Promise((resolve, reject) => {
    if (media.location && media.location.length > 0) {
      if (!fs.existsSync(media.location)) {
        googleCloudApi.downloadFile(media.location);
      };
      return resolve();
    };
  });
};


router.post('/', authenticate, upload, (req, res) => {
  if (!req.loggedInUser.guestUser) {
    let body = _.pick(req.passedMedia, mediaInsertFields);
    utils.log(utils.LoglevelEnum.Info, 'body', body);
    let media = new Media(body);
    utils.log(utils.LoglevelEnum.Info, 'body.photoInfo', body.photoInfo);
    if (body.photoInfo && body.photoInfo.location && body.photoInfo.isUrl) {
      media.location = body.photoInfo.location;
      media.isUrl = true;
      media.mimeType = body.photoInfo.mimeType;
    };

    media._creator = req.loggedInUser._creatorRef;
    media.isProfilePic = false;
    media.addedDate = new Date().getTime();
    media.comments = [];
    media._id = new ObjectID();
    utils.log(utils.LoglevelEnum.Info, 'media', media);

    media.save().then((newMedia) => {
      utils.log(utils.LoglevelEnum.Info, 'media2', newMedia);
      res.send(_.pick(newMedia, mediaOutFields));
    }, (e) => {
      utils.log(utils.LoglevelEnum.Info, 'media.save() e', e);
      res.status(400).send();
    });
  };
});


router.get('/', authenticate, (req, res) => {

  let mediasObj = {
    'isProfilePic': false
  };
  // if (!req.loggedInUser.adminUser) {
  //   mediasObj._creator = req.loggedInUser._creatorRef;
  // };

  Media.find(mediasObj).populate('comments tags people').then((medias) => {
    utils.log(utils.LoglevelEnum.Info, "GET medias.length", medias.length);
    transformCreatorToUser(medias).then((medias) => {
      utils.log(utils.LoglevelEnum.Info, "after transformCreatorToUser medias.length", medias.length);
      let obj = {};
      obj['medias'] = medias;
      downloadFiles(medias).then(() => {
        res.send(obj);
      }, (e) => {
        utils.log(utils.LoglevelEnum.Info, "downloadFiles error", e);
      });
    }, (e) => {
      utils.log(utils.LoglevelEnum.Info, "transformCreatorToUser error", e);
    });

  }).catch((e) => {
    utils.log(utils.LoglevelEnum.Info, "mediasApp.get('/medias/' error", e);
  });
});

router.get('/byCriteria', authenticate, (req, res) => {
  let {
    tags,
    people,
    fromDate,
    toDate
  } = req.body;

  Media.findByCriteria(tags, people, fromDate, toDate).then((medias) => {
    let obj = {};
    obj['medias'] = medias;
    downloadFiles(medias).then(() => {
      res.send(obj);
    }, (e) => {
      utils.log(utils.LoglevelEnum.Info, "downloadFiles error", e);
    });
  }, (e) => {
    utils.log(utils.LoglevelEnum.Info, "mediasApp.get('/medias/byCriteria' error", e);
  });

});

router.get('/title/:title', authenticate, (req, res) => {
  let title = req.params.title;
  let mediaObj = {
    title
  };
  utils.log(utils.LoglevelEnum.Info, "mediaObj", mediaObj);
  Media.findOne(mediaObj).then((media) => {
    utils.log(utils.LoglevelEnum.Info, "media", media);
    if (media) {
      res.send({
        'titleFound': true,
        '_id': media._id
      });
    } else {
      res.send({
        'titleFound': false
      });
    }

  }, (e) => {
    utils.log(utils.LoglevelEnum.Info, "media router.get('/title/:title' e", e);
    res.status(400).send(CONSTS.AN_ERROR_OCURRED);
  });
});

router.get('/:id', authenticate, (req, res) => {
  let {
    id
  } = req.params;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send({
      error: "Media ID is invalid"
    });
  };


  Media.findOne({
    '_id': id
  }).populate('comments tags people').then((media) => {
    if (media) {
      downloadFile(media).then(() => {
        res.send({
          media
        });
      }, (e) => {
        utils.log(utils.LoglevelEnum.Info, "downloadFile error", e);
      });
    } else {
      res.status(404).send({
        error: "media not found for id"
      });
    }

  }, (e) => {
    res.status(400).send();
  });
});

router.delete('/:id', authenticate, (req, res) => {
  if (!req.loggedInUser.guestUser) {
    let {
      id
    } = req.params;


    if (!ObjectID.isValid(id)) {
      return res.status(404).send({
        error: "Media ID is invalid"
      });
    };

    let medias = {
      '_id': id
    };
    if (!req.loggedInUser.adminUser) {
      medias._creator = req.loggedInUser._creatorRef;
    }

    Media.findOneAndRemove(medias).then((media) => {

      if (media) {
        googleCloudApi.deleteFile(media.location);
        if (fs.existsSync(media.location)) {
          fs.unlinkSync(media.location);
        };

        res.send({
          media
        });
      } else {
        res.status(404).send({
          error: "media not found for id"
        });
      }

    }, (e) => {
      res.status(400).send(e);
    });
  };
});


// router.delete('/', authenticate, (req, res) => {

//   let medias = {};
//   if (!req.loggedInUser.adminUser) {
//     medias = {
//       '_creator': req.loggedInUser._creatorRef
//     };
//   }

//   Media.remove(medias).then((medias) => {
//     if (medias) {
//       if (medias.result.n === 0) {
//         res.status(404).send({
//           error: "No media deleted"
//         });
//       } else {
//         let obj = {};
//         obj['medias'] = medias;
//         res.send(obj);
//       }

//     } else {
//       res.status(400).send({
//         error: "No media deleted"
//       });
//     }
//   }, (e) => {
//     res.status(400).send();
//   });
// });


let updateMedias = (res, body, medias, commentId) => {

  utils.log(utils.LoglevelEnum.Info, "updateMedias", body, medias, commentId);

  // let mediasObj = {
  //   _id : medias._id
  // };

  let updateObj = {
    $set: body
  };

  if (commentId) {
    updateObj['$push'] = {
      "comments": commentId
    };
  };
  utils.log(utils.LoglevelEnum.Info, "updateObj", updateObj);
  utils.log(utils.LoglevelEnum.Info, "medias", medias);

  Media.findOneAndUpdate(medias, updateObj, {
    new: true
  }).populate('comments tags people').then((media) => {
    if (media) {
      if (media.comments) {
        addUserToComments(media).then((media) => {
          res.send({
            media
          });
        }, (e) => {
          res.status(400).send();
          utils.log(utils.LoglevelEnum.Info, e);
        });
      } else {
        res.send({
          media
        });
      };
    } else {
      res.status(404).send({
        error: "media not found for id"
      });
    }

  }, (e) => {
    res.status(400).send();
    utils.log(utils.LoglevelEnum.Info, e);
  });
};


router.patch('/:id', authenticate, upload, (req, res) => {
  utils.log(utils.LoglevelEnum.Info, "router.patch1", req.passedMedia);
  if (!req.loggedInUser.guestUser) {
    let {
      id
    } = req.params;

    let body = _.pick(req.passedMedia, mediaUpdateFields);

    utils.log(utils.LoglevelEnum.Info, "router.patch2", body);

    if (!ObjectID.isValid(id)) {
      return res.status(404).send({
        error: "Media ID is invalid"
      });
    };

    let medias = {
      '_id': id
    };


    if (body.comment) {

      let mediaCommentObj = {
        'comment': body.comment
      };
      let comment = new Comment(mediaCommentObj);

      comment._creator = req.loggedInUser._creatorRef;
      comment.commentDate = new Date().getTime();
      utils.log(utils.LoglevelEnum.Info, 'comment', comment);

      comment.save().then((comment) => {
        updateMedias(res, body, medias, comment._id);
      });
    } else {

      if (!req.loggedInUser.adminUser) {
        medias._creator = req.loggedInUser._creatorRef;
      };

      updateMedias(res, body, medias, null);
    };
  };
});


module.exports = router;
