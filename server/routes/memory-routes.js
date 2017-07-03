const express = require('express');
const router = express.Router();
const _ = require('lodash');
const {
    authenticate
} = require('../middleware/authenticate');

const config = require('../config/config.js');
const {
    mongoose
} = require('../db/mongoose');


const {
    Memory
} = require('../models/memory');

const memoryInsertFields = ['title', 'description', 'memoryDate', 'tags', 'users', 'medias'];


router.post('/', authenticate, (req, res) => {
    let body = _.pick(req.body, memoryInsertFields);
    let memory = new Memory(body);
    memory._creator = req.loggedInUser._creatorRef;
    memory.addedDate = new Date().getTime();
    memory.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send();
    });
});


module.exports = router;