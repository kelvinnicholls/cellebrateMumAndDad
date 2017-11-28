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
  Person,
  personInsertFields,
  personOutFields,
  personQueryFields
} = require('../models/person');

const config = require('../config/config.js');
const {
  mongoose
} = require('../db/mongoose');

router.post('/', authenticate, (req, res) => {
  let body = _.pick(req.body, personInsertFields);
  //console.log('body', body);
  let person = new Person(body);

  person._creator = req.loggedInUser._creatorRef;
  person.addedDate = new Date().getTime();
  //console.log('person', person);

  person.save().then((person) => {
    //console.log('person2', person);
    res.send(_.pick(person, personOutFields));
  }, (e) => {
    //console.log('person.save() e', e);
    res.status(400).send();
  });
});


router.get('/', authenticate, (req, res) => {
  Person.find({}).then((people) => {
    let obj = {};
    obj['people'] = people;
    res.send(obj);
  }).catch((e) => {
    console.log("peopleApp.get('/people/' error", e);
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
    //console.log("5a router.get('/person/:person' e", e);
    res.status(400).send(CONSTS.AN_ERROR_OCURRED);
  });
});


module.exports = router;
