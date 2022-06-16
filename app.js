var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Q1 2019
// Is body parser still needed for our versions of express, etc.?
const bodyParser = require('body-parser'); // https://codeburst.io/writing-a-crud-app-with-node-js-and-mongodb-e0827cbbdafb
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var app = express();

// This should be before routes (?)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false})); // false = use querystring = data is string or array (not anything)


// dB Setup
let dev_db_url = "mongodb://xerisureUser:"+encodeURIComponent("captainXeri1@8")+"@localhost:27017/xerisure";
let mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB, { useNewUrlParser: true});
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Routes
var indexRouter = require('./routes/indexRou');
var usersRouter = require('./routes/usersRou');
var gatewayRouter = require('./routes/gatewayRou');
var mdbradioRouter = require('./routes/mdbradioRou');
var devRouter = require('./routes/devRou');
var wateringcircuitRouter = require('./routes/wateringcircuitRou');
var logRouter = require('./routes/logRou');



var socket_io = require('socket.io');
var io = socket_io();
app.io = io;


//var app = require('express')();
//var server = require('http').Server(app);
//var io = require('socket.io')(server);
//server.listen(3000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.locals.siteName = "Xerisure";
app.locals.gateway_socket_id = null;




// Application Serial Port(s)
// Is there a better way to structure this?
// We need only one gateway radio serial port object, single item at the top level to prevent re-instantiation at the route handling
// (e.g.) level.
// However, it seems at this time not clear how to best add a non-database property of the Gateway model, whether static class level (?)
// or instance such that the serial port for the gateway is encapsulated within the Gateway model.
// Either way, in reality, there is, generally (though no absolutely) a single serial port for a gateway PAN radio per gateway (per network
// is maybe a more likely scenario.
// ... ok see Gateway Code
// Pero au meme fois, le server est le gateway maintenant
//var SerialPort = require('serialport')


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/gateway', gatewayRouter);
app.use('/mdbradios', mdbradioRouter);
app.use('/dev', devRouter);
app.use('/wateringcircuits', wateringcircuitRouter);
app.use('/logs', logRouter);

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

module.exports = app;
