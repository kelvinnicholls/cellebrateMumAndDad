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
  Memory,
  memoryInsertFields,
  memoryUpdateFields
} = require('../models/memory');

const {
  User
} = require('../models/user');

const {
  Comment
} = require('../models/comment');

const {
  ObjectID
} = require('mongodb');






let transformCreatorToUser = (memories) => {
  return new Promise((resolve, reject) => {
    let numMemories = memories ? memories.length : 0;
    let processedMemories = 0;
    let transformedMemories = [];
    for (let memory of memories) {
      if (memory.comments && memory.comments.length > 0) {
        let numComments = memory.comments.length;
        let processedComments = 0;
        for (let comment of memory.comments) {
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
              transformedMemories.push(memory);
              processedMemories++;
              if (numMemories === processedMemories) {
                return resolve(transformedMemories);
              };
            };
          }, (e) => {
            reject(e);
          });
        };
      } else {
        transformedMemories.push(memory);
        processedMemories++;
        if (numMemories === processedMemories) {
          return resolve(transformedMemories);
        };
      };
    };
  });
}

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


router.get('/', authenticate, (req, res) => {

  let memoriesObj = {};
  if (!req.loggedInUser.adminUser) {
    memoriesObj._creator = req.loggedInUser._creatorRef;
  };

  Memory.find(memoriesObj).populate('comments tags people').then((memories) => {
    transformCreatorToUser(memories).then((memories) => {
      let obj = {};
      obj['memories'] = memories;
      res.send(obj);
    }, (e) => {
      console.log("transformCreatorToUser error", e);
    });
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
    let obj = {};
    obj['memories'] = memories;
    res.send(obj);
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
  }).populate('comments tags people').then((memory) => {
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
        let obj = {};
        obj['memories'] = memories;
        res.send(obj);
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

let updateMemories = (res, body, memories, commentId) => {

  let updateObj = {
    $set: body
  };

  if (commentId) {
    updateObj['$push'] = {
      "comments": commentId
    };
  };

  Memory.findOneAndUpdate(memories, updateObj, {
    new: true
  }).populate('comments tags people').then((memory) => {

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
};


router.patch('/:id', authenticate, (req, res) => {
  let {
    id
  } = req.params;

  let body = _.pick(req.body, memoryUpdateFields);

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
  };


  if (body.comment) {

    let memoriesCommentObj = {
      'comment': body.comment
    };
    let comment = new Comment(memoriesCommentObj);

    comment._creator = req.loggedInUser._creatorRef;
    comment.commentDate = new Date().getTime();
    console.log('comment', comment);

    comment.save().then((comment) => {
      updateMemories(res, body, memories, comment._id);
    });
  } else {
    updateMemories(res, body, memories, null);
  };
});

module.exports = router;
