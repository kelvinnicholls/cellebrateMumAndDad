const bcrypt = require('bcryptjs');

const utils = {};

const {
  ObjectID
} = require('mongodb');

utils.schemaToObject = (propsArr) => {
  const retObj = {};
  propsArr.forEach(function (element) {
    retObj[element] = "";
  }, this);
  return retObj;
};

utils.getEncryptedPassword = (password, callback) => {
  bcrypt.genSalt(10, (err, salt) => {
    if (!err) {
      bcrypt.hash(password, salt, (err, hash) => {
        if (!err) {
          callback(null, hash);
        } else {
          callback(err);
        };
      });
    };
  });
};

utils.genQueryForCriteria = function (tags, users, fromDate, toDate, dateField) {
  let queryObj = {};

  if (fromDate && toDate) {
    queryObj[dateField] = {
      "$gte": fromDate,
      "$lte": toDate
    }
  } else
  if (fromDate && !toDate) {
    queryObj[dateField] = {
      "$gte": fromDate
    }
  } else
  if (!fromDate && toDate) {
    queryObj[dateField] = {
      "$lte": toDate
    }
  };


  if (tags && tags.length > 0) {
    queryObj.tags = {
      "$in": tags
    }
  };
  if (users && users.length > 0) {
    let usersAsObjectIds = [];
    users.forEach((user) => {
      usersAsObjectIds.push(ObjectID(user));
    });
    queryObj.users = {
      "$in": usersAsObjectIds
    }
  };
  return queryObj;
};

module.exports = utils;
