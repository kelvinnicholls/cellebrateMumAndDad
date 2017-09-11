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
  Tag,
  tagInsertFields,
  tagOutFields,
  tagQueryFields
} = require('../models/tag');

const config = require('../config/config.js');
const {
  mongoose
} = require('../db/mongoose');

router.post('/', authenticate, (req, res) => {
  let body = _.pick(req.body, tagInsertFields);
  console.log('body', body);
  let tag = new Tag(body);

  tag._creator = req.loggedInUser._creatorRef;
  tag.addedDate = new Date().getTime();
  console.log('tag', tag);

  tag.save().then((tag) => {
    console.log('tag2', tag);
    res.send(_.pick(tag, tagOutFields));
  }, (e) => {
    console.log('tag.save() e', e);
    res.status(400).send();
  });
});


router.get('/', authenticate, (req, res) => {
  Tag.find({}).then((tags) => {
    let obj = {};
    obj['tags'] = tags;
    res.send(obj);
  }).catch((e) => {
    console.log("tagsApp.get('/tags/' error", e);
  });
});

module.exports = router;
