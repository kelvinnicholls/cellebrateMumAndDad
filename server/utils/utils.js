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

utils.genQueryForCriteria = function (tags, people, fromDate, toDate, dateField) {
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
    let tagsAsObjectIds = [];
    tags.forEach((tag) => {
      tagsAsObjectIds.push(ObjectID(tag));
    });
    queryObj.tags = {
      "$in": tagsAsObjectIds
    }
  };
  if (people && people.length > 0) {
    let peopleAsObjectIds = [];
    people.forEach((person) => {
      peopleAsObjectIds.push(ObjectID(person));
    });
    queryObj.people = {
      "$in": peopleAsObjectIds
    }
  };
  return queryObj;
};

utils.log = function (...arguments) {
  let passedArguments = arguments.slice();
  if (passedArguments && passedArguments.length > 0) {
    let logLevel = passedArguments[0];
    if (logLevel <= process.env.LOG_LEVEL) {
      passedArguments.shift();
      console.log.apply(this, passedArguments);
    };
  };
};


utils.union = function(arr1,arr2) {

  if (!arr1) {
    return arr2;
  }

  let retArr = arr1.slice();;

  if (arr2) {
    for (let i in arr2) {
      let found = retArr.find(function(element) {
        return element._id.toHexString() === arr2[i]._id.toHexString();
      });
      if (!found) {
        retArr.push(arr2[i]);
      };
    };
  }

  return retArr;
}

utils.LoglevelEnum = {
  Error: 0,
  Warn: 1,
  Info: 2
};


module.exports = utils;
