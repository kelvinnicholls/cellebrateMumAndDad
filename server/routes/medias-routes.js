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

const mediaInsertFields = ['location', 'isUrl', 'name', 'mediaType', 'mediaSubtype', 'description', 'mediaDate', 'tags', 'users'];

router.get('/', authenticate, (req, res) => {

    let mediasObj = {};
    if (!req.loggedInUser.adminUser) {
        mediasObj._creator = req.loggedInUser._creatorRef;
    };

    Media.find(mediasObj).then((medias) => {
        User.setObjUserIdsToNames(medias, res, "medias");
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
        User.setObjUserIdsToNames(medias, res, "medias");
    }, (e) => {
        console.log("mediasApp.get('/medias/byCriteria' error", e);
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
            User.setUserIdsToNames(media.users).then((names) => {
                media.users = names;
                res.send({
                    media
                });
            }).catch((e) => {
                res.status(400).send();
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
                res.send({
                    medias
                });
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


    let body = _.pick(req.body, ['location', 'isUrl', 'mimeType', 'description', 'mediaDate', 'tags', 'users']);

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