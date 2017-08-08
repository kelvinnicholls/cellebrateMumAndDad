var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
console.log("mongoose process.env.MONGODB_URI = ",process.env.MONGODB_URI);

// Just some options for the db connection
// var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, 
//                 replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } }; 

// mongoose.connect('YOUR_DB_LOCATION', options);
// var db = mongoose.connection;


mongoose.connect(process.env.MONGODB_URI);

module.exports = {mongoose};

// process.env.NODE_ENV === 'production'; // Heroku
// process.env.NODE_ENV === 'development'; // localhost
// process.env.NODE_ENV === 'test'; // Mocha
