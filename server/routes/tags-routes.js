const express = require('express');
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
  Tag,
  tagInsertFields,
  tagOutFields,
  tagQueryFields
} = require('../models/tag');

const config = require('../config/config.js');
const {
  mongoose
} = require('../db/mongoose');

const {
  CONSTS
} = require('../shared/consts');

router.post('/', authenticate, (req, res) => {
  let body = _.pick(req.body, tagInsertFields);
  utils.log(utils.LoglevelEnum.Info,'body', body);
  let tag = new Tag(body);

  tag._creator = req.loggedInUser._creatorRef;
  tag.addedDate = new Date().getTime();
  utils.log(utils.LoglevelEnum.Info,'tag', tag);

  tag.save().then((tag) => {
    utils.log(utils.LoglevelEnum.Info,'tag2', tag);
    res.send(_.pick(tag, tagOutFields));
  }, (e) => {
    utils.log(utils.LoglevelEnum.Info,'tag.save() e', e);
    res.status(400).send();
  });
});


router.get('/', authenticate, (req, res) => {
  Tag.find({}).then((tags) => {
    let obj = {};
    obj['tags'] = tags;
    res.send(obj);
  }).catch((e) => {
    utils.log(utils.LoglevelEnum.Info,"tagsApp.get('/tags/' error", e);
  });
});


router.get('/tag/:tag', authenticate, (req, res) => {
  let tag = req.params.tag;
  let tagObj = {
    tag
  };
  Tag.findOne(tagObj).then((tag) => {
    if (tag) {
      res.send({
        'tagFound': true
      });
    } else {
      res.send({
        'tagFound': false
      });
    };
  }, (e) => {
    utils.log(utils.LoglevelEnum.Info,"5a router.get('/tag/:tag' e", e);
    res.status(400).send(CONSTS.AN_ERROR_OCURRED);
  });
});

module.exports = router;
