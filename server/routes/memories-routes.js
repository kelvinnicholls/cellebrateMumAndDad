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

const {
    User
} = require('../models/user');

const {
    ObjectID
} = require('mongodb');



const memoryInsertFields = ['title', 'description', 'memoryDate', 'tags', 'users', 'medias'];

router.get('/', authenticate, (req, res) => {

    let memoriesObj = {};
    if (!req.loggedInUser.adminUser) {
        memoriesObj._creator = req.loggedInUser._creatorRef;
    };

    Memory.find(memoriesObj).then((memories) => {
        User.setObjUserIdsToNames(memories, res, "memories");
    }).catch((e) => {
        console.log("app.get('/memories/' error", e);
    });

});

router.get('/byCriteria/', authenticate, (req, res) => {
    let {
        tags,
        users,
        fromDate,
        toDate
    } = req.body;

    Memory.findByCriteria(tags, users, fromDate, toDate).then((memories) => {
        User.setObjUserIdsToNames(memories, res, "memories");
    });

});


router.get('/:id', authenticate, (req, res) => {
    let {
        id
    } = req.params;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send({
            error: "Memory ID is invalid"
        });
    };


    Memory.findOne({
        '_id': id
    }).then((memory) => {
        if (memory) {
            User.setUserIdsToNames(memory.users).then((names) => {
                memory.users = names;
                res.send({
                    memory
                });
            }).catch((e) => {
                res.status(400).send();
            });

        } else {
            res.status(404).send({
                error: "memory not found for id"
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
            error: "Memory ID is invalid"
        });
    };

    let memories = {
        '_id': id
    };
    if (!req.loggedInUser.adminUser) {
        memories._creator = req.loggedInUser._creatorRef;
    }

    Memory.findOneAndRemove(memories).then((memory) => {

        if (memory) {
            res.send({
                memory
            });
        } else {
            res.status(404).send({
                error: "memory not found for id"
            });
        }

    }, (e) => {
        res.status(400).send(e);
    });
});


router.delete('/', authenticate, (req, res) => {

    let memories = {};
    if (!req.loggedInUser.adminUser) {
        memories = {
            '_creator': req.loggedInUser._creatorRef
        };
    }

    Memory.remove(memories).then((memories) => {
        if (memories) {
            if (memories.result.n === 0) {
                res.status(404).send({
                    error: "No memory deleted"
                });
            } else {
                res.send({
                    memories
                });
            }

        } else {
            res.status(400).send({
                error: "No memory deleted"
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


    let body = _.pick(req.body, ['title', 'description', 'memoryDate', 'tags', 'users', 'medias']);

    if (!ObjectID.isValid(id)) {
        return res.status(404).send({
            error: "Memory ID is invalid"
        });
    };

    let memories = {
        '_id': id
    };
    if (!req.loggedInUser.adminUser) {
        memories._creator = req.loggedInUser._creatorRef;
    }

    Memory.findOneAndUpdate(memories, {
        $set: body
    }, {
        new: true
    }).then((memory) => {

        if (memory) {
            res.send({
                memory
            });
        } else {
            res.status(404).send({
                error: "memory not found for id"
            });
        }

    }, (e) => {
        res.status(400).send();
    });
});

module.exports = router;