const utils = require('../utils/utils.js');

let {
  User
} = require('../models/user');

let authenticate = (req, res, next) => {
  utils.log(utils.LoglevelEnum.Info,'authenticate req',req);
  utils.log(utils.LoglevelEnum.Info,'authenticate res',res);
  utils.log(utils.LoglevelEnum.Info,'authenticate next',next);
  var token = req.header('x-auth');
  utils.log(utils.LoglevelEnum.Info,'authenticate token',token);
  User.findByToken(token).then((user) => {
    if (!user) {
      return Promise.reject();
    };
    req.loggedInUser = user;
    req.token = token;
    next();
    
  }).catch((e) => {
    utils.log(utils.LoglevelEnum.Info,"authenticate error: ", e);
    res.status(401).render('index');
    //res.status(401).send();
  });
}


module.exports.authenticate = authenticate;