var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


const mediasRoutes = require('./routes/medias-routes');
const memoriesRoutes = require('./routes/memories-routes.js');
const usersRoutes = require('./routes/users-routes.js');
const tagsRoutes = require('./routes/tags-routes.js');
const peopleRoutes = require('./routes/people-routes.js');
const appRoutes = require('./routes/app-routes.js');
const googleCloudApi = require('./shared/google-cloud-api');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// un-comment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({
  limit: '50mb'
}));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
  next();
});

app.use(function (req, res, next) {
  //console.log("Request Url : " + req.originalUrl);
  next();
});


app.use('/medias', mediasRoutes);
app.use('/memories', memoriesRoutes);
app.use('/users', usersRoutes);
app.use('/tags', tagsRoutes);
app.use('/people', peopleRoutes);
app.use('/', appRoutes);


//catch 404 and forward to error handler
app.use(function (req, res, next) {
  //console.log("catch 404 and forward to error handler");
  res.render('index');
});

module.exports = app;
