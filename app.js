require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
var mongoDB = 'mongodb://127.0.0.1/sign-in-backend';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var userRouter = require('./routes/user');
var registerRouter = require('./routes/register');
var loginRouter = require('./routes/login');
var moduleRouter = require('./routes/module');
var attendanceRouter = require('./routes/attendance');

app.use('/user', userRouter);
app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/module', moduleRouter);
app.use('/attendance', attendanceRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
