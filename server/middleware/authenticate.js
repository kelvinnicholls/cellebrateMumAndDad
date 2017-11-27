let {
  User
} = require('../models/user');

let authenticate = (req, res, next) => {
  console.log('authenticate req',req);
  console.log('authenticate res',res);
  console.log('authenticate next',next);
  var token = req.header('x-auth');
  console.log('authenticate token',token);
  User.findByToken(token).then((user) => {
    console.log('authenticate 1');
    if (!user) {
      console.log('authenticate 2');
      return Promise.reject();
    };
    console.log('authenticate 3');
    req.loggedInUser = user;
    console.log('authenticate 4');
    req.token = token;
    console.log('authenticate 5');
    next();
    console.log('authenticate 5a');
    
  }).catch((e) => {
    console.log('authenticate 6');
    console.log("authenticate error: ", e);
    res.status(401).render('index');
    //res.status(401).send();
  });
}


module.exports.authenticate = authenticate;