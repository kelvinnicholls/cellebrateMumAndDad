const express = require('express');
const googleCloudApi = require('../shared/google-cloud-api');
const fs = require('fs');
const router = express.Router();
const _ = require('lodash');
var path = require('path');
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
  //console.log('upload',req, res);
  multerUploadSingleFile(req, res, function (err) {
    console.log('media-routes multerUploadSingleFile', err);
    console.log('req.body.media', req.body.media);
    req.passedMedia = JSON.parse(req.body.media);
    delete req.body.media;
    console.log('req.file', req.file);
    if (err) {
      processErr(err);
    } else {
      if (!req.file) {
        console.log('No file was selected');
      } else {
        console.log('media patch File uploaded!');
        let fileName = req.file.filename;
        console.log("newFileName", fileName);
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

    console.log('addUserToComments', 'numComments', numComments);
    for (let comment of retMedia.comments) {
      console.log('addUserToComments', 'comment', comment);
      let userObj = {
        '_creatorRef': comment._creator
      };
      User.findOne(userObj).populate('_profileMediaId', ['location']).then((user) => {
        console.log('addUserToComments', 'user', user);
        console.log('addUserToComments', 'typeof user', typeof user);
        console.log('addUserToComments', 'typeof comment', typeof comment);
        if (user) {
          delete user._id;
          let newComment = JSON.parse(JSON.stringify(comment));
          console.log('addUserToComments', 'user.name', user.name);
          console.log('addUserToComments', 'user._profileMediaId', user._profileMediaId);
          newComment.user = {};
          console.log('addUserToComments', 'newComment.user', newComment.user);
          newComment.user.name = user.name;
          newComment.user._profileMediaId = user._profileMediaId;
          console.log('addUserToComments', 'newComment.user2', newComment.user);

          commentsArr.push(newComment);
          console.log('addUserToComments', 'newComment', newComment);
        };

        processedComments++;
        if (numComments === processedComments) {
          retMedia.comments = commentsArr;
          console.log('addUserToComments', 'resolve', retMedia);
          return resolve(retMedia);
        };
      }, (e) => {
        reject(e);
      });
    };
  });
};



let transformCreatorToUser = (medias) => {
  return new Promise((resolve, reject) => {
    let numMedias = medias ? medias.length : 0;
    let processedMedias = 0;
    let transformedMedias = [];
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
  });
};

let downloadFiles = (medias) => {
  return new Promise((resolve, reject) => {
    let numMedias = medias ? medias.length : 0;
    let processedMedias = 0;
    for (let media of medias) {
      downloadFile(media);
      processedMedias++;
      if (numMedias === processedMedias) {
        return resolve();
      };
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
    console.log('body', body);
    let media = new Media(body);
    console.log('body.photoInfo', body.photoInfo);
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
    console.log('media', media);

    media.save().then((newMedia) => {
      console.log('media2', newMedia);
      res.send(_.pick(newMedia, mediaOutFields));
    }, (e) => {
      console.log('media.save() e', e);
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
    transformCreatorToUser(medias).then((medias) => {
      let obj = {};
      obj['medias'] = medias;
      downloadFiles(medias).then(() => {
        res.send(obj);
      }, (e) => {
        console.log("downloadFiles error", e);
      });
    }, (e) => {
      console.log("transformCreatorToUser error", e);
    });

  }).catch((e) => {
    console.log("mediasApp.get('/medias/' error", e);
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
    downloadFiles(medias).then(() => {
      res.send(obj);
    }, (e) => {
      console.log("downloadFiles error", e);
    });
  }, (e) => {
    console.log("mediasApp.get('/medias/byCriteria' error", e);
  });

});

router.get('/title/:title', authenticate, (req, res) => {
  let title = req.params.title;
  let mediaObj = {
    title
  };
  console.log("mediaObj", mediaObj);
  Media.findOne(mediaObj).populate('comments tags people').then((media) => {
    console.log("media", media);
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
    console.log("media router.get('/title/:title' e", e);
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
        console.log("downloadFile error", e);
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

  console.log("updateMedias", body, medias, commentId);

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
  console.log("updateObj", updateObj);
  console.log("medias", medias);

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
          console.log(e);
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
    console.log(e);
  });
};


router.patch('/:id', authenticate, upload, (req, res) => {
  console.log("router.patch1", req.passedMedia);
  if (!req.loggedInUser.guestUser) {
    let {
      id
    } = req.params;

    let body = _.pick(req.passedMedia, mediaUpdateFields);

    console.log("router.patch2", body);

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
      console.log('comment', comment);

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
