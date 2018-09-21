var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
const cors = require('cors');
import db from './database';
import passportConfig from './config/passport';
import initRoute from './components/routes';
import bodyParser from 'body-parser';
import flash from 'connect-flash';
import session from 'express-session';

var app = express();
passportConfig(passport);

app.use(bodyParser.json())
app.use(cors());
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'ilovescotchscotchyscotchscotch', // session secret
  resave: true,
  saveUninitialized: true,
}));
app.use(passport.initialize());

initRoute(app,passport);// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log(req.originalUrl);
  next(createError(404));
});

console.log(db);


module.exports = app;
