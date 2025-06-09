var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');



// Q1 2019
// Is body parser still needed for our versions of express, etc.?
const bodyParser = require('body-parser'); // https://codeburst.io/writing-a-crud-app-with-node-js-and-mongodb-e0827cbbdafb


// 6-6-25 Removing mongoose / mongodb because on this PC after Ubuntu update to 22.04 LTS without AVX instruction in the CPU
// get core dump but cannot install non-AVX version 4.4 or less on Ubuntu 22.04 - so here we are
//const mongoose = require('mongoose');
//const Schema = mongoose.Schema;


var app = express();

// https://blog.sylo.space/use-global-variable-for-socket-io/
// 2023 Q2
// < Single global >
// var SerialPort = require('serialport');
// //var port_name;
// var port;
// var apiPacketString;
// var apiStringTrans;
// var stringBuffer = "";
// app.locals.port = port;
// app.set('SerialPort',SerialPort);
// app.set('port',port);
// app.set('apiPacketString',apiPacketString);
// app.set('apiStringTrans',apiStringTrans);
// app.set('stringBuffer',stringBuffer);
// </ Single global? >



const {sequelize} = require('./db');
sequelize.sync() // Sync the database schema to the definitions in the model files
  .then(() => {
    console.log("Database synchronized successfully");
  })
  .catch(err => {
    console.error("Unable to synchronize database", err);
  });


sequelize.getQueryInterface().showAllSchemas().then((tableObj) => {
  console.log('// Tables in database','==========================');
  console.log(tableObj);
})
.catch((err) => {
  console.log('showAllSchemas ERROR',err);
});

sequelize.getQueryInterface().describeTable('Radios').then((tableObj) => {
  console.log('// Describe Radios','==========================');
  console.log(tableObj);
})
.catch((err) => {
  console.log('showAllSchemas ERROR',err);
});

sequelize.getQueryInterface().describeTable('WateringCircuits').then((tableObj) => {
  console.log('// Describe WateringCircuits','==========================');
  console.log(tableObj);
})
.catch((err) => {
  console.log('showAllSchemas ERROR',err);
});


sequelize.getQueryInterface().describeTable('LogEvents').then((tableObj) => {
  console.log('// Describe LogEvents','==========================');
  console.log(tableObj);
})
.catch((err) => {
  console.log('showAllSchemas ERROR',err);
});


// sequelize.getQueryInterface().describeTable('LogEvents').then((tableObj) => {
//   console.log('// Describe LogEvents','==========================');
//   console.log(tableObj);
// })
// .catch((err) => {
//   console.log('showAllSchemas ERROR',err);
// });




// This should be before routes (?)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false})); // false = use querystring = data is string or array (not anything)


// dB Setup
// 6-6-25 Update switch to something else?
//let dev_db_url = "mongodb://xerisureUser:"+encodeURIComponent("captainXeri1@8")+"@localhost:27017/xerisure";
//let mongoDB = process.env.MONGODB_URI || dev_db_url;
//mongoose.connect(mongoDB, { useNewUrlParser: true});
//mongoose.Promise = global.Promise;
//let db = mongoose.connection;
//db.on('error', console.error.bind(console, 'MongoDB connection error:'));
//const DbConnector = require('better-sqlite3');
//const db = new DbConnector('xerisure-6-6-25.sqlite');
// const {Sequelize} = require ("sequelize");
// const sequelize = new Sequelize(
//   {
//     dialect: "sqlite",
//     host:"./xerisure-6-6-25.sqlite"
//   }
// );

// const connectedDB = async () => {
//   sequelize.sync();
//   await sequelize.authenticate();
//   console.log("Connected to DB".yellow.underline);
// };




// Routes
var indexRouter = require('./routes/indexRou');
// var usersRouter = require('./routes/usersRou');
var gatewayRouter = require('./routes/gatewayRou');
// var mdbradioRouter = require('./routes/mdbradioRou');
// var devRouter = require('./routes/devRou');
// var wateringcircuitRouter = require('./routes/wateringcircuitRou');
// var logRouter = require('./routes/logRou');


// Old? Prior to update to sequelize and node 24?
// var socket_io = require('socket.io');
// var io = socket_io();
// app.io = io;

// New? 
//const { Server } = require('socket.io');





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
// app.use('/users', usersRouter);
app.use('/gateway', gatewayRouter);
// app.use('/mdbradios', mdbradioRouter);
// app.use('/dev', devRouter);
// app.use('/wateringcircuits', wateringcircuitRouter);
// app.use('/logs', logRouter);

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

module.exports = { app };
