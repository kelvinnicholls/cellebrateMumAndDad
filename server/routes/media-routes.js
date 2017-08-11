const express = require('express');
const router = express.Router();
const _ = require('lodash');
const {
    authenticate
} = require('../middleware/authenticate');

const {
    Media
} = require('../models/media');

const config = require('../config/config.js');
const {
    mongoose
} = require('../db/mongoose');

const mediaInsertFields = ['title', '_creator', 'location', 'isUrl', 'mimeType', 'description', 'mediaDate', 'addedDate', 'tags', 'users'];

router.post('/', authenticate, (req, res) => {
    let body = _.pick(req.body, mediaInsertFields);
    let media = new Media(body);
    media._creator = req.loggedInUser._creatorRef;
    media.addedDate = new Date().getTime();
    media.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send();
    });
});


module.exports = router;