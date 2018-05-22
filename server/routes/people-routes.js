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
  Person,
  personInsertFields,
  personOutFields,
  personQueryFields
} = require('../models/person');

const config = require('../config/config.js');
const {
  mongoose
} = require('../db/mongoose');

const {
  CONSTS
} = require('../shared/consts');

router.post('/', authenticate, (req, res) => {
  let body = _.pick(req.body, personInsertFields);
  utils.log(utils.LoglevelEnum.Info,'body', body);
  let person = new Person(body);

  person._creator = req.loggedInUser._creatorRef;
  person.addedDate = new Date().getTime();
  utils.log(utils.LoglevelEnum.Info,'person', person);

  person.save().then((person) => {
    utils.log(utils.LoglevelEnum.Info,'person2', person);
    res.send(_.pick(person, personOutFields));
  }, (e) => {
    utils.log(utils.LoglevelEnum.Info,'person.save() e', e);
    res.status(400).send();
  });
});


router.get('/', authenticate, (req, res) => {
  Person.find({}).then((people) => {
    let obj = {};
    obj['people'] = people;
    res.send(obj);
  }).catch((e) => {
    utils.log(utils.LoglevelEnum.Info,"peopleApp.get('/people/' error", e);
  });
});

router.get('/person/:person', authenticate, (req, res) => {
  let person = req.params.person;
  let personObj = {
    person
  };
  Person.findOne(personObj).then((person) => {
    if (person) {
      res.send({
        'personFound': true
      });
    } else {
      res.send({
        'personFound': false
      });
    };
  }, (e) => {
    utils.log(utils.LoglevelEnum.Info,"5a router.get('/person/:person' e", e);
    res.status(400).send(CONSTS.AN_ERROR_OCURRED);
  });
});


module.exports = router;
