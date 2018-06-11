var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var gatewayRouter = require('./routes/gateway');

var app = express();


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

