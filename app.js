require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

const mongoose = require('mongoose');
const mongoDB = 'mongodb://127.0.0.1/sign-in-backend';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.disable('etag');
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const userRouter = require('./routes/user');
const registerRouter = require('./routes/register');
const loginRouter = require('./routes/login');
const moduleRouter = require('./routes/module');
const attendanceRouter = require('./routes/attendance');

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

const weekScraper = require('./scrapers/weekScraper');
weekScraper.saveToDB().then(() => {
  console.log('Saved Weeks in Database');
});

module.exports = app;
