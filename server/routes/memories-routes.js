const express = require('express');
const router = express.Router();
const _ = require('lodash');
const utils = require('../utils/utils.js');
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
  memoryOutFields,
  memoryQueryFields,
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
    utils.log(utils.LoglevelEnum.Info,"memories.transformCreatorToUser numMemories",numMemories);
    let processedMemories = 0;
    let transformedMemories = [];
    if (numMemories > 0) {
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
    } else {
      return resolve(transformedMemories);
    };
  });
}

router.post('/', authenticate, (req, res) => {
  if (!req.loggedInUser.guestUser) {
    let body = _.pick(req.body, memoryInsertFields);
    let memory = new Memory(body);
    memory._creator = req.loggedInUser._creatorRef;
    memory.addedDate = new Date().getTime();
    memory._id = new ObjectID();

    memory.comments = [];

    memory.save().then((newMemory) => {
      utils.log(utils.LoglevelEnum.Info,'memory2', newMemory);
      res.send(_.pick(newMemory, memoryOutFields));
    }, (e) => {
      utils.log(utils.LoglevelEnum.Info,'memory.save() e', e);
      res.status(400).send();
    });
  };
});


router.get('/', authenticate, (req, res) => {

  let memoriesObj = {};
  // if (!req.loggedInUser.adminUser) {
  //   memoriesObj._creator = req.loggedInUser._creatorRef;
  // };

  Memory.find(memoriesObj).populate('comments tags people medias').then((memories) => {
    utils.log(utils.LoglevelEnum.Info,"GET memories.length",memories.length);
    transformCreatorToUser(memories).then((memories) => {
      utils.log(utils.LoglevelEnum.Info,"after transformCreatorToUser memories.length",memories.length);
      let obj = {};
      obj['memories'] = memories;
      res.send(obj);
    }, (e) => {
      utils.log(utils.LoglevelEnum.Info,"transformCreatorToUser error", e);
    });
  }).catch((e) => {
    utils.log(utils.LoglevelEnum.Info,"app.get('/memories/' error", e);
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
  }).populate('comments tags people medias').then((memory) => {
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


router.get('/title/:title', authenticate, (req, res) => {
  let title = req.params.title;
  let memoryObj = {
    title
  };
  utils.log(utils.LoglevelEnum.Info,"memoryObj", memoryObj);
  Memory.findOne(memoryObj).then((memory) => {
    utils.log(utils.LoglevelEnum.Info,"memory", memory);
    if (memory) {
      res.send({
        'titleFound': true,
        '_id': memory._id
      });
    } else {
      res.send({
        'titleFound': false
      });
    }

  }, (e) => {
    utils.log(utils.LoglevelEnum.Info,"memory router.get('/title/:title' e", e);
    res.status(400).send(CONSTS.AN_ERROR_OCURRED);
  });
});

router.delete('/:id', authenticate, (req, res) => {
  if (!req.loggedInUser.guestUser) {
    if (!req.loggedInUser.guestUser) {
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
    };
  };
});


router.delete('/', authenticate, (req, res) => {
  if (!req.loggedInUser.guestUser) {

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
  };
});

let addUserToComments = (memory) => {
  return new Promise((resolve, reject) => {
    let retMemory = JSON.parse(JSON.stringify(memory));
    let numComments = retMemory.comments.length;
    let processedComments = 0;
    let commentsArr = [];

    //('addUserToComments', 'numComments', numComments);
    if (retMemory.comments && retMemory.comments.length > 0) {
      for (let comment of retMemory.comments) {
        utils.log(utils.LoglevelEnum.Info,'addUserToComments', 'comment', comment);
        let userObj = {
          '_creatorRef': comment._creator
        };
        User.findOne(userObj).populate('_profileMemoryId', ['location']).then((user) => {
          utils.log(utils.LoglevelEnum.Info,'addUserToComments', 'user', user);
          utils.log(utils.LoglevelEnum.Info,'addUserToComments', 'typeof user', typeof user);
          utils.log(utils.LoglevelEnum.Info,'addUserToComments', 'typeof comment', typeof comment);
          if (user) {
            delete user._id;
            let newComment = JSON.parse(JSON.stringify(comment));
            utils.log(utils.LoglevelEnum.Info,'addUserToComments', 'user.name', user.name);
            utils.log(utils.LoglevelEnum.Info,'addUserToComments', 'user._profileMemoryId', user._profileMemoryId);
            newComment.user = {};
            utils.log(utils.LoglevelEnum.Info,'addUserToComments', 'newComment.user', newComment.user);
            newComment.user.name = user.name;
            newComment.user._profileMemoryId = user._profileMemoryId;
            utils.log(utils.LoglevelEnum.Info,'addUserToComments', 'newComment.user2', newComment.user);

            commentsArr.push(newComment);
            utils.log(utils.LoglevelEnum.Info,'addUserToComments', 'newComment', newComment);
          };

          processedComments++;
          if (numComments === processedComments) {
            retMemory.comments = commentsArr;
            utils.log(utils.LoglevelEnum.Info,'addUserToComments', 'resolve', retMemory);
            return resolve(retMemory);
          };
        }, (e) => {
          reject(e);
        });
      };
    } else {
      return resolve(retMemory);
    };
  });
};

let updateMemories = (res, body, memories, commentId) => {

  utils.log(utils.LoglevelEnum.Info,"updateMemories", body, memories, commentId);

  // let memoriesObj = {
  //   _id : memories._id
  // };

  let updateObj = {
    $set: body
  };

  if (commentId) {
    updateObj['$push'] = {
      "comments": commentId
    };
  };
  utils.log(utils.LoglevelEnum.Info,"updateObj", updateObj);
  utils.log(utils.LoglevelEnum.Info,"memories", memories);

  Memory.findOneAndUpdate(memories, updateObj, {
    new: true
  }).populate('comments tags people medias').then((memory) => {
    if (memory) {
      if (memory.comments) {
        addUserToComments(memory).then((memory) => {
          res.send({
            memory
          });
        }, (e) => {
          res.status(400).send();
          utils.log(utils.LoglevelEnum.Info,e);
        });
      } else {
        res.send({
          memory
        });
      };
    } else {
      res.status(404).send({
        error: "memory not found for id"
      });
    }

  }, (e) => {
    res.status(400).send();
    utils.log(utils.LoglevelEnum.Info,e);
  });
};


router.patch('/:id', authenticate, (req, res) => {
  if (!req.loggedInUser.guestUser) {
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



    if (body.comment) {

      let memoriesCommentObj = {
        'comment': body.comment
      };
      let comment = new Comment(memoriesCommentObj);

      comment._creator = req.loggedInUser._creatorRef;
      comment.commentDate = new Date().getTime();
      utils.log(utils.LoglevelEnum.Info,'comment', comment);

      comment.save().then((comment) => {
        updateMemories(res, body, memories, comment._id);
      });
    } else {
      if (!req.loggedInUser.adminUser) {
        memories._creator = req.loggedInUser._creatorRef;
      };
      updateMemories(res, body, memories, null);
    };
  };
});

module.exports = router;
