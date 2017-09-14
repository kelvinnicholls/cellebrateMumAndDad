const express = require('express');
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
      };
      next();
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
}

router.post('/', authenticate, upload, (req, res) => {
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
  console.log('media', media);

  media.save().then((media) => {
    console.log('media2', media);
    res.send(_.pick(media, mediaOutFields));
  }, (e) => {
    console.log('media.save() e', e);
    res.status(400).send();
  });
});


router.get('/', authenticate, (req, res) => {

  let mediasObj = {
    'isProfilePic': false
  };
  if (!req.loggedInUser.adminUser) {
    mediasObj._creator = req.loggedInUser._creatorRef;
  };

  Media.find(mediasObj).populate('comments tags people').then((medias) => {
    transformCreatorToUser(medias).then((medias) => {
      let obj = {};
      obj['medias'] = medias;
      res.send(obj);
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
    obj['medias'] = medias;
    res.send(obj);
  }, (e) => {
    console.log("mediasApp.get('/medias/byCriteria' error", e);
  });

});

router.get('/title/:title', authenticate, (req, res) => {
  let title = req.params.title;
  let mediaObj = {
    title
  };
  User.findOne(mediaObj).populate('comments tags people').then((media) => {
    if (media) {
      res.send({
        'titleFound': true,
        '_creatorRef': media._id
      });
    } else {
      res.send({
        'titleFound': false
      });
    }

  }, (e) => {
    console.log("media router.get('/media/:name' e", e);
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
      res.send({
        media
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
});


router.delete('/', authenticate, (req, res) => {

  let medias = {};
  if (!req.loggedInUser.adminUser) {
    medias = {
      '_creator': req.loggedInUser._creatorRef
    };
  }

  Media.remove(medias).then((medias) => {
    if (medias) {
      if (medias.result.n === 0) {
        res.status(404).send({
          error: "No media deleted"
        });
      } else {
        let obj = {};
        obj['medias'] = medias;
        res.send(obj);
      }

    } else {
      res.status(400).send({
        error: "No media deleted"
      });
    }
  }, (e) => {
    res.status(400).send();
  });
});


let updateMedias = (res, body, medias, commentId) => {

  console.log("updateMedias", body, medias, commentId);

  let updateObj = {
    $set: body
  };

  if (commentId) {
    updateObj['$push'] = {
      "comments": commentId
    };
  };

  Media.findOneAndUpdate(medias, updateObj, {
    new: true
  }).populate('comments tags people').then((media) => {

    if (media) {
      res.send({
        media
      });
    } else {
      res.status(404).send({
        error: "media not found for id"
      });
    }

  }, (e) => {
    res.status(400).send();
  });
};


router.patch('/:id', authenticate, upload, (req, res) => {
  console.log("router.patch1", req.passedMedia);
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

  if (!req.loggedInUser.adminUser) {
    medias._creator = req.loggedInUser._creatorRef;
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
    updateMedias(res, body, medias, null);
  };
});


module.exports = router;
