const express = require('express');
const router = express.Router();
const _ = require('lodash');
const {
  authenticate
} = require('../middleware/authenticate');

const {
  ObjectID
} = require('mongodb');

const {
  Media
} = require('../models/media');

const {
  User
} = require('../models/user');

const config = require('../config/config.js');
const {
  mongoose
} = require('../db/mongoose');


const mediaInsertFields = ['title', '_creator', 'location', 'isUrl', 'mimeType', 'description', 'mediaDate', 'addedDate', 'tags', 'users'];
const mediaQueryFields = ['title', '_creator', 'location', 'isUrl', 'mimeType', 'description', 'mediaDate', 'addedDate', 'tags', 'users', '_id'];
const mediaUpdateFields = ['description', 'tags', 'users'];

router.get('/', authenticate, (req, res) => {

  let mediasObj = {};
  if (!req.loggedInUser.adminUser) {
    mediasObj._creator = req.loggedInUser._creatorRef;
  };

  Media.find(mediasObj).then((medias) => {
    let obj = {};
    obj['medias'] = medias;
    res.send(obj);

  }).catch((e) => {
    console.log("mediasApp.get('/medias/' error", e);
  });
});

router.get('/byCriteria', authenticate, (req, res) => {
  let {
    tags,
    users,
    fromDate,
    toDate
  } = req.body;

  Media.findByCriteria(tags, users, fromDate, toDate).then((medias) => {
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
  User.findOne(mediaObj).then((media) => {
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
  }).then((media) => {
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


router.patch('/:id', authenticate, (req, res) => {
  let {
    id
  } = req.params;


  let body = _.pick(req.body, mediaUpdateFields);

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

  Media.findOneAndUpdate(medias, {
    $set: body
  }, {
    new: true
  }).then((media) => {

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


module.exports = router;
