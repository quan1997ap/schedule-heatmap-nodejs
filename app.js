var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

// import router
var http = require('http');
var indexRouter = require('./routes/index');
var heatmapRouter = require('./routes/heatmap');

// connect to mongodb
// var mongodbConnection = require("./schema/connect-mongodb"); // create connect to mongoDB 

// connect to rethinkdb
var  rethinkDdConnection= require("./schema/connect-rethinkdb");
rethinkDdConnection.connectRethinkDb("./schema/emma.crt"); // path to ssl
rethinkDdConnection.keepConnection();


// run schedule
var createHeatMap = require("./schema/schedule-create-heatmap");
createHeatMap.runTaskDrawHeatMap();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));

// api
app.use(cors());
app.use('/', indexRouter);
app.use('/heatmap', heatmapRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


var port = process.env.PORT || 8080 ;
// var port = 5000;
app.listen(port, () => console.log(`App listening on port ${port}!`));

setInterval(function() {
  console.log('wakeup - server - heroku');
  http.get("http://pam-air.herokuapp.com/");
}, 300000); // every 5 minutes (300000)

module.exports = app;
