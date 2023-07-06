//
/* Model :: gateway */
//


// see:
// https://stackoverflow.com/questions/9230932/file-structure-of-mongoose-nodejs-project

// Our early work before moving to library:
var XBee = require('./xbeeMod').XBee;

var xbee_api = require('xbee-api');


var Mdbradio = require('./mdbradioMod');
var Utils = require('../lib/utils');
var sleep = Utils.sleep;
var Log = require('./logMod');
var Wateringcircuit = require('./wateringcircuitMod.js');

const backendEvents = require('../lib/utils.js').ServerSideEmitter;



var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var GatewaySchema = new Schema({

  name 			: String,

});

//var app = require('../app');

//
// Developer resource links:
//
// https://stackoverflow.com/questions/18239358/adding-virtual-variables-to-a-mongoose-schema
//
// https://stackoverflow.com/questions/24609991/using-socket-io-in-express-4-and-express-generators-bin-www
//
// http://danialk.github.io/blog/2014/04/26/arduino-and-processingjs-and-socketio-in-action/
//
// https://node-serialport.github.io/node-serialport/SerialPort.html#open





var SerialPort = require('serialport');
//var port_name;
//var port;
// var apiPacketString;
// var apiStringTrans;
// var stringBuffer = "";


// Notifications
const nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  host: 'box569.bluehost.com', /*'smtp.oshablue.com',*/
  port: 465,
  secure: true,
  auth: {
    user: 'notifications@oshablue.com',
    pass: 'W?X:1m4@3VaWQ2'
  }
});
var mailOptions = {
  from: 'notifications@oshablue.com',
  to: 'notifications@oshablue.com',
  subject: 'Notification from Xerisure',
  text: 'Blank text body from Xerisure'
};







GatewaySchema.statics.start = function(io){ //, sport) {
  io.of('/gateway').on('connection', async function(socket) { //, sport) {
    Gateway.setup_serial_port_and_socket_messaging(io, socket); //, sport);
    // nope that doesn't make repeat port.on('data')s go away
    // socket.on('disconnect', function() {
    //   socket.removeAllListeners();
    // });
  });
}


GatewaySchema.statics.setup_serial_port_and_socket_messaging = async function(io, socket) { //, port) {

  //port = app.locals.sport;

  console.log("setup_serial_port_and_socket_messaging");
  //io.emit('data', "test"); //nope
  //socket.$emit.apply(socket, ['writeserialdata', "test"]);
  //console.log("sp:");
  //console.log(JSON.stringify(sp));

  // if ( !port ) {
  //   console.log("setup_serial_port_and_socket_messaging: !port, so calling initialize_gateway_serial");
  //   var items = Gateway.initialize_gateway_serial(port);
  //   port = items.port;
  // }

  // TODO
  // error handling if port not set up etc.
  // may need to move elsewhere as we want this either:
  //  - open on gateway launch to do background items and checks independently
  //    - omit and just send port status to connected socket
  //  - open on socket client request if need to change port
  //    - Soln: Do indepently with close and re-open controls
  // if ( !port.isOpen ) {
  //     console.log("...serial port not yet open...call open() now...");
  //     io.emit('data', 'serial port closed - attempting to open...<br>');
  //     //socket.emit('data', 'serial port closed - attempting to open...<br>');
  //     port.open();
  //     await sleep(2000); // TODO move to promises
  //     // without this sleep delay, next statement isOpen check will immediately
  //     // still show not open (yet)
  // } else {
  //     console.log("...serial port is already open...");
  // }

  // if ( port.isOpen ) {
  //     console.log("... serial port is open ...");
  //     //socket.emit('data', '<br>gateway serial port is open<br>');
  //     io.emit('data', '<br>gateway serial port is open<br>');
  // } else {
  //     console.log("... serial port is not open ...");
  //     //socket.emit('data', '<br>gateway serial port is not open (but it ought to be ... err?)<br>');
  //     io.emit('data', '<br>gateway serial port is not open (but it ought to be ... err?)<br>');
  // }

  // Do any on connection link proof here
  // Sometimes on reload page, we get 2 of these fired
  // Just for testing
  //Gateway.onSocketConnect();
  // NOTE if using the above or start up serial, then note that serial needs
  // not only open, but also sufficient sleep delay to allow full open process

  // TODO error handling - e.g. if port not yet instantiated?
  // port.on('data', function(data){
  //     socket.emit('data', "<br>Socket ID: " + socket.id + "<br>");
  //     console.log(socket.id);
  //     socket.emit('data', "<br>Raw in rcvd: " + data.toString().replace("\r","<br>"));
  //     // was replace with <br> // lines terminated with 0x0d
  //     // or replace with " " (using "" creates a problem)

  //     // API type data
  //     // TODO Complete API packet parsing implementation and DRY/Encap etc.
  //     var s = " ";
  //     var bufAsString = " ";
  //     for ( var i = 0; i < data.length; i++ ) {
  //       s = "0x" + ('0' + (data[i] & 0xFF).toString(16)).slice(-2);
  //       bufAsString += " " + s;
  //       if ( s == '0x7e' ) {
  //         socket.emit('data', "<br>API Packet start rcvd: Flush to screen and reset the prior API Packet hex and ASCII keepers: <br>");
  //         socket.emit('data', "apiPacketString: " + apiPacketString + "<br>");
  //         socket.emit('data', "apiStringTrans:  " + apiStringTrans + "<br>Done flushes.<br>");
  //         apiPacketString = s;
  //         apiStringTrans = '----';
  //       } else {
  //         apiPacketString += " " + s;
  //         if ( parseInt(s) > 32 && parseInt(s) < 127 ) {
  //           apiStringTrans += " " + "   " + String.fromCharCode(parseInt(s));
  //         } else {
  //           apiStringTrans += " " + s;
  //         }
  //       }
  //     }
  //     socket.emit('data', "<br>Current bufAsString: " + bufAsString + "<br>");
  //     socket.emit('data', "<br>Current apiPacketString: " + apiPacketString + "<br>");

  //     stringBuffer += data.toString();              // Accumulate between data received until buffer is dumped, etc.

  //     // Alert: Until complete API is implemented, we'll be one buffer short so request one extra frame etc.

  //     console.log("port data received:");
  //     console.log(data);
  // }); // end of port.on data

  
  // app.locals.sport = port;

  
  socket.on('serialdataRx', function(data) {

      socket.emit('data', "<br>Socket ID: " + socket.id + "<br>");
      console.log(socket.id);
      socket.emit('data', "<br>Raw in rcvd: " + data.toString().replace("\r","<br>"));
      // was replace with <br> // lines terminated with 0x0d
      // or replace with " " (using "" creates a problem)

      // API type data
      // TODO Complete API packet parsing implementation and DRY/Encap etc.
      var s = " ";
      var bufAsString = " ";
      for ( var i = 0; i < data.length; i++ ) {
        s = "0x" + ('0' + (data[i] & 0xFF).toString(16)).slice(-2);
        bufAsString += " " + s;
        if ( s == '0x7e' ) {
          socket.emit('data', "<br>API Packet start rcvd: Flush to screen and reset the prior API Packet hex and ASCII keepers: <br>");
          socket.emit('data', "apiPacketString: " + apiPacketString + "<br>");
          socket.emit('data', "apiStringTrans:  " + apiStringTrans + "<br>Done flushes.<br>");
          apiPacketString = s;
          apiStringTrans = '----';
        } else {
          apiPacketString += " " + s;
          if ( parseInt(s) > 32 && parseInt(s) < 127 ) {
            apiStringTrans += " " + "   " + String.fromCharCode(parseInt(s));
          } else {
            apiStringTrans += " " + s;
          }
        }
      }
      socket.emit('data', "<br>Current bufAsString: " + bufAsString + "<br>");
      socket.emit('data', "<br>Current apiPacketString: " + apiPacketString + "<br>");

      stringBuffer += data.toString();              // Accumulate between data received until buffer is dumped, etc.

      // Alert: Until complete API is implemented, we'll be one buffer short so request one extra frame etc.

      console.log("port data received:");
      console.log(data);
  });

  // Do you miss ajax and post?
  // Or are socket(s) awesome here?
  socket.on('client_set_destination_mac_id', function(macid) {
      console.log("Server socket received client_set_destination_mac_id of " + macid);
      Gateway.set_destination_radio_mac_id(socket, macid);
  });

  socket.on('client_set_digital_io', function(macid, pin, state) {
      console.log("Server socket received client_set_digital_io of "
          + macid + " for pin " + pin
          + " to state " + state);
      Gateway.set_digital_io(socket, macid, pin, state);
  });

  socket.on('client_get_digital_io', function(macid, pin, state) {
      console.log("Server socket received client_get_digital_io of "
          + macid + " for pin " + pin
          + " to state " + state);
      Gateway.get_digital_io(socket, macid, pin);
  });

  socket.on('client_get_gateway_radio_serial_link_destination_mac_id_info', function() {
      console.log('Server socket received client_get_gateway_radio_serial_link_destination_mac_id_info');
      Gateway.get_gateway_xbee_dest_mac(socket);
  });

  socket.on('client_get_gateway_radio_mac_id_info', function() {
      console.log('Server socket received client_get_gateway_radio_mac_id_info');
      Gateway.get_gateway_xbee_mac(socket);
  });

  socket.on('client_get_remote_radio_dios', function(macid) {
      console.log('Server socket received client_get_remote_radio_dios');
      Gateway.get_remote_radio_dios(socket, macid);
  });

  socket.on('client_do_node_discover', function() {
      console.log('Server socket received client_do_node_discover');
      Gateway.do_node_discover(socket);
  });

  socket.on('client_get_gateway_radio_dios', function() {
      console.log('Server socket received client_get_gateway_radio_dios');
      Gateway.get_gateway_radio_dios(socket);
  });

  socket.on('client_get_db_radio_mac_ids', function() {
      console.log('Server socket received client_get_db_radio_mac_ids');
      Gateway.get_db_radio_mac_ids(socket);
  });

  socket.on('client_pop_db_radio_mac_ids', function() {
      console.log('Server socket received client_pop_db_radio_mac_ids');
      Gateway.pop_db_radio_mac_ids(socket);
  });

  socket.on('client_set_digital_io_with_timed_reset', function( macid, pin, timedstate, durationMinutes) {
      console.log('Server socket receive client_set_digital_io_with_timed_reset');
      Gateway.set_digital_io_with_timed_reset(socket, macid, pin, timedstate, durationMinutes);
  });
  
  socket.on('client_set_digital_io_with_timed_reset_known_state_values', function( macid, pin, timedstate, durationMinutes, offstate) {
      console.log('Server socket receive client_set_digital_io_with_timed_reset_known_state_values');
      console.log('durationMinutes: ' + durationMinutes);
      if ( !durationMinutes || !parseInt(durationMinutes) || parseInt(durationMinutes) < 0 || parseInt(durationMinutes) > 2880 ) { // TODO max config minutes watering length
        console.log('durationMinutes: missing or incorrect parameter');
      }
      //console.log(JSON.stringify(arguments));
      Gateway.set_digital_io_with_timed_reset_known_state_values(socket, macid, pin, timedstate, durationMinutes, offstate);
  });

  // Not implemented
  socket.on('client_store_nd_radios_in_db', function(radios) {
      console.log('Server socket received client_store_nd_radios_in_db');
      Gateway.store_nd_radios_in_db(socket, radios);
  });
  
  socket.on('client_load_radio_data', function(macId) {
    console.log('Server socket received client_load_radio_data');
    Gateway.load_radio_data(socket, macId);
  });

  // Call any further on-connect startup functions now

  // Populate select with stored MACs
  Gateway.pop_db_radio_mac_ids(socket);

} // end of: GatewaySchema.statics.setup_serial_port_and_socket_messaging









/* Bad boys and girls! No sync! */
// Use .methods for instance functions
GatewaySchema.statics.serial_port_list_sync = function () {

    const execSync = require('child_process').execSync;
    code = execSync('ls /dev/ttyUSB*');
    return code;

};





GatewaySchema.statics.serial_port_to_use = function (list_in) {

    list_in = "" + list_in;
    var first_one = list_in.split("\n")[0].replace(/\r?\n|\r/,"");
    return first_one;

};



GatewaySchema.statics.emit_delayed_socket_message = async function ( socket, channel, data, delay_ms ) {

    await sleep(delay_ms);
    socket.emit(channel, data);
    console.log("emit_delayed_socket_message fired with channel " + channel + " socket id: " + socket.id);

}




GatewaySchema.statics.dump_string_buffer = function ( socket ) {

    socket.emit('data', "<br><br>String Buffer Dump: <br>");
    socket.emit('data', stringBuffer);
    stringBuffer = "";

}




GatewaySchema.statics.setup_serial_port = function (port_name, port) {

    console.log("Got into setup_serial_port");

    if ( port == null ) {

        console.log("serial port is null, initializing serial port ... for port_name: " + port_name);
        port = new SerialPort( port_name, {
            baudRate: 9600,
            autoOpen: false
        });
    //} // chasing down multiple port calls on refresh - no diff

    // TODO error handling (if open undefined etc)
    port.on('open', function() {
        console.log('port.on(open): serial port open ... that is all.');
    });


    port.on('error', function(err) {
        console.log('SerialPort port Error: ', err.message + err.stack);
    });

    } // chasing down multiple port calls on refresh - no diff

    return port;

};


// To get all digital IO Statements
// Try the ATIS command
// https://www.digi.com/resources/documentation/Digidocs/90002002/Content/Reference/r_zb_i_o_sampling.htm
// A remote command response has the following bytes (after the API identifier):
// [64-bit address] + [16-bit address] + [Command Name] + [Status] + [IO Data] + [Checksum]
// The IO data is the same for a local IS or a remote IS:
// [# Samples] + [Digital Mask] + [Analog Mask] + [Digital IO Data] + [Analog Data (if applicable)]




// A variation on:
// medium.com
// N. Gabisonia: "sing socket.io with async/await to simulate realtime Fetch behavior"
// Except we're using EventEmitter for backend server events 
// Maybe there is a better way ... but seems ok so far
function asyncWriteRead ( returnEventMsgType, outgoingData, xbeeAPI ) {
  return new Promise(function (resolve, reject) {
    console.log('asyncWriteRead');
    xbeeAPI.builder.write(outgoingData);
    backendEvents.once(returnEventMsgType, result => {
      console.log(`got backendEvents result ${JSON.stringify(result)}`);
      resolve(result);
    });
    setTimeout(function() {
      resolve('err: asyncWriteRead timed out');
    }, 5000);
  });
}





// xbb = xbeeAPI.builder from top level singleton / instance
GatewaySchema.statics.get_digital_io = async function ( socket, macid, pin, xbeeAPI) { // sp ) {

  // TODO WARN IF NO MACID !

  var app = require('../app');
  var this_socket = socket;

  console.log("");

  if ( !pin ) {
    console.log("gatewayMod: get_digitial_io: pin is not set, subbing 0....");
    pin = 0;
  }

  console.log("gatewayMod: get_digital_io called - get pin sate for pin: " + pin + " at MAC ID: " + macid);

  //port.flush();

  // Keeping for posterity:
  /*
  await XBee.EnterCommandMode(sp, this_socket); // was (port, ....)
  await XBee.IssueAtCommand(sp, this_socket, "atap1"); // was (port, ...)
  await XBee.ExitCommandMode(sp, this_socket); // was (port, ...)

  const START_BYTE = 0x7E;  // 
  const FRAME_TYPE = 0x17;  // Remote Command Request

  var bytes = new Uint8Array(100);
  bytes[0] = (START_BYTE);
  bytes[1] = (0x00);
  bytes[2] = (0x0F); // for set with state payload byte, we use 0x10
  bytes[3] = (FRAME_TYPE);
  bytes[4] = (0x01);
  for ( var i = 0; i < macid.length/2; i++ ) {
      bytes[5+i] = (parseInt("0x" + macid.substr(i*2,2))); // to_i(16)
  }
  bytes[5+8] = (0xFF);
  bytes[6+8] = (0xFE);
  bytes[7+8] = (0x02);
  bytes[8+8] = ("D".charCodeAt(0));
  bytes[9+8] = (pin.charCodeAt(0));
  //bytes[10+8] = (parseInt("0x" + state.substr(0,2)));

  var sum = 0x0000;
  for ( var j = 3; j < bytes.length; j++ ) {
      sum += bytes[j];
  }
  sum &= 0x00FF;
  var checksum = 0xFF - sum;

  // get: 11+8 => 10+8
  bytes[10+8]= (checksum);
  console.log("Checksum (Get IO): " + checksum);
  */ // Kept for posterity

  var frameId = xbeeAPI.nextFrameId();
  var frame_obj = {
    type: xbee_api.constants.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST,
    id: frameId,
    destination64: macid,
    command: "D"+pin.toString(),
    commandParameter: []     // None means query
  }

  this_socket.emit('data', "<br>> sent xb builder write of frame data");
  this_socket.emit('data', `<br>> as json: " ${JSON.stringify(frame_obj)}`);

  const msgType = `xbee-data-frameType${xbee_api.constants.FRAME_TYPE.REMOTE_COMMAND_RESPONSE.toString(16)}`;
  const res = await asyncWriteRead(msgType, frame_obj, xbeeAPI);

  console.log(`res of asyncWriteRead: ${JSON.stringify(res)} (if it's nothing, we return)`);

  if ( !res ) {
    console.log(`!res ... returning`);
    return null;
  }


  // TODO
  // Error handling
  // Verify command as well for certainty as system scales


  var pinState; 
  try {
    // res is an xbee-api frame
    pinState = parseInt(res.commandData[0]); // eg commandData { type: Buffer, data: [4]}
  } catch (e) {
    console.log(e);
  }
  console.log(`pinState: ${pinState}`);

  //this_socket.emit('data', ">(Gateway.get_digital_io (1000ms)");
  //console.log("Get IO packet to send, stringified:" + JSON.stringify(bytes.slice(0, 11+16))); // set: 11+17
  //apiPacketString = "";
  //sp.flush();
  //sp.write(bytes.slice(0, 11+16));
  //this_socket.emit('writeserialdata', bytes.slice(0, 11+16));
  //await sleep(1000);

  // Somewhere in here if there was successful transmission, then the port.on data 
  // function was called - and apiPacketString was built up ... 
  // however probably a different instance / context - so current issue:
  // apiPacketString is huge and grows hugelyier
  // so, above, let's try purging apiPacketStringprior to the write?


  await this_socket.emit('data', "<br>> <b>Finished:</b> Get Digital IO via API for: " + macid + " pin: " + pin);

  /*
  // Now, to test, we could assume we have a reply to this request and parse it from the API packet accumulator Buffer
  var apiPacketString = app.locals.apiPacketString;
  var ss = apiPacketString.replace(/\s/g,"").replace(/0x/g,"").toUpperCase();
  this_socket.emit('data', "\r apiPacketString: ");
  this_socket.emit('data', apiPacketString);
  this_socket.emit('data', "\r with spaces and 0x removed: ");
  this_socket.emit('data', ss);
  var sa = apiPacketString.split(" ");
  var len = sa.length;
  var apiLen = parseInt(sa[2]);
  if ( apiLen == (sa.length - 4) ) console.log("API length byte matches the payload length of the apiPacketString buffer: " + apiLen);
  var macidReply = sa.slice(5,5+8).join("").replace(/0x/g,"");
  if ( macidReply === macid ) console.log("API reply MAC ID matches the command MAC ID");

  // For now for the DIO command, grab the 4th data payload reply byte as the pin state
  var replyPinState = sa[18];
  var toMatch = macid.toUpperCase() + "FFFE" + "D".charCodeAt(0).toString(16) + pin.charCodeAt(0).toString(16);
  var rx = new RegExp(toMatch);
  var mat = ss.match(rx);
  var replyPinStateBySearch;
  if ( mat ) {
    replyPinStateBySearch = ss.slice(mat.index + toMatch.length).match(/.{1,2}/g) || "";
    if ( replyPinStateBySearch ) {
      replyPinStateBySearch = replyPinStateBySearch[1] || "";
      replyPinStateBySearch = parseInt(replyPinStateBySearch);
    } // 2nd byte of the 3 remaining bytes - the last byte is the checksum
  }
  console.log("ss: " + ss + " sa: " + sa + " apiLen: " + apiLen + " macid: " + macidReply + " replyPinStateBySearch: " + replyPinStateBySearch);
  */

  await this_socket.emit('data', "<br>> Get Digital IO via API Value in Reply: " + pinState + "</b>");
  await this_socket.emit('getDioPinStateResult', pinState);

  // Now we give feedback to water circuit specific area near or on GPIO clicked too 
  this_socket.emit(
    'getDioPinStateResultIndicator', 
    { pin: pin, pinState: pinState }
  );

  // TODO need to have UI indicator with passing along failed / non-int / undefined state

  console.log("gatewayMod: get_digital_io finished.");
  console.log("");

  return pinState;

};


GatewaySchema.statics.set_digital_io_with_timed_reset = async function ( socket, macid, pin, state, durMins ) {

  console.log("");
  console.log("gatewayMod: set_digital_io_with_timed_reset started ... duration is: " + durMins + "(Will add a standard base delay of 5 seconds)");

  var timeMs = (durMins * 60. * 1000.) + (5 * 1000.);

  var maxtries = 4;
  var i = 0;
  var currentPinState = -1;
  while ( i++ < maxtries) {
    currentPinState = await Gateway.get_digital_io( socket, macid, pin );
    console.log("Gateway model: set_digital_io_with_timed_reset: get_digital_io: value: " + currentPinState);
    if ( currentPinState < 10 && currentPinState > -1 ) {
      break;
    }
  }
  if ( i >= maxtries ) {
    console.log("Couldn't get a reasonable current pin state (not between 0 and 9) maxtries: " + i + " with last currentPinState: " + currentPinState);
    console.log("Maybe try checking the MAC ID selection and the Pin Number Settings as well as power to devices.");
    return -1; //
  }

  await Gateway.set_digital_io( socket, macid, pin, state);

  setTimeout( function() {
    console.log("Will reset pin " + pin + " to " + currentPinState + " in " + durMins + " minutes (plus base 5-second delay).");
    Gateway.set_digital_io( socket, macid, pin, currentPinState);
  }, timeMs );

}







GatewaySchema.statics.set_digital_io_with_timed_reset_known_state_values = async function ( 
  socket, macid, pin, state, durMins, offstate, xbeeAPI ) {

  // This is called like from when water Run button is clicked

  console.log("");
  var msg = `gatewayMod: set_digital_io_with_timed_reset_known_state_values started for duration: ${durMins}`;
  console.log(msg);
  socket.emit('data', `<br>> ${msg}`);

  var timeMs = (durMins * 60. * 1000.) + (5 * 1000.); // add 5 seconds as overhead padding for comms

  // TODO return success or failure and proceed accordingly 
  await Gateway.set_digital_io( socket, macid, pin, state, xbeeAPI);

  // TODO - in case lost between boots / process restarts etc - 
  // actually these things need to get posted to a dB queue or better 
  // to make sure ON-ness gets OFF-d as fallback and/or etc !
  msg = `Will reset pin ${pin} to ${offstate} (off) in ${durMins} minutes.`;
  setTimeout( function() {
    var msg = `Will now reset pin ${pin} to ${offstate} after having waited ${durMins} minutes.`;
    socket.emit('data', `<br>> ${msg}`);
    console.log(msg);
    Gateway.set_digital_io( socket, macid, pin, offstate, xbeeAPI );
  }, timeMs );

} // end of: set_digital_io_with_timed_reset_known_state_values






GatewaySchema.statics.set_digital_io = async function ( socket, macid, pin, state, xbeeAPI ) {

  var app = require('../app');
  var this_socket = socket;

  state = '' + state;

  console.log("");
  console.log("gatewayMod: set_digital_io called - set to: " + state + " for pin " + pin + " at MAC ID: " + macid);


  var frameId = xbeeAPI.nextFrameId();
  var frame_obj = {
    type: xbee_api.constants.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST,
    id: frameId,
    destination64: macid,
    command: "D"+pin.toString(),
    commandParameter: [state]     // None means query
  }

  this_socket.emit('data', "<br>> sent xb builder write of frame data");
  this_socket.emit('data', `<br>> as json: " ${JSON.stringify(frame_obj)}`);

  const msgType = `xbee-data-frameType${xbee_api.constants.FRAME_TYPE.REMOTE_COMMAND_RESPONSE.toString(16)}`;
  const res = await asyncWriteRead(msgType, frame_obj, xbeeAPI);

  console.log(`res of asyncWriteRead: ${JSON.stringify(res)} (if it's nothing, we return)`);

  if ( !res ) {
    console.log(`!res ... returning`);
    return;
  }

  await this_socket.emit('data', "<br>> <b>Finished:</b> Set Digital IO via API for: " + macid + " " + pin + " " + state);
  
  var logThisXaction = true;

  // Check the work now by reading back the pin state
  console.log("gatewayMod: set_digital_io: right before calling get_digital_io for confirmation...");
  const pinAsRead = await Gateway.get_digital_io(this_socket, macid, pin, xbeeAPI);
  
  if ( !pinAsRead ) {
    var m = `getting the pin state returned nothing (pinAsRead is nothing) - will not log this`;
    console.log(m);
    socket.emit('data', `<br>> ${m}`);
    logThisXaction = false;
  }
  
  var verifiedPinState;
  try {
    // res is an xbee-api frame
    verifiedPinState = parseInt(pinAsRead); // eg commandData { type: Buffer, data: [4]}
    state = parseInt(state);
  } catch (e) {
    console.log(e);
  }
  console.log(`verifiedPinState (via get_digital_io): ${verifiedPinState}`);
  if ( verifiedPinState !== state ) {
    var m = `verifiedPinState does not match state requested in the set_digital_io, no log entry`;
    console.log(m);
    socket.emit('data', `<br>> ${m}`);
    logThisXaction = false;
  } else {
    var m = `Good. verifiedPinState from get_digital_io matches the requested state to be set by set_digital_io.`;
    console.log(m);
    socket.emit('data', `<br>> ${m}`);
  }
    
  // Log entry here (?) - should we log attempted vs results separately? (yes probably for most granular)
  // TODO add description that includes the result of the get_digital_io too? etc.
  // At present - returning if the get fails above - so no log in that case ... (?)
  if ( logThisXaction ) {
    Log.createDioEntryByMacAndPin(macid, pin, state); 
  } else {
    console.log(`skipping logging this set_digital_io xaction`);
    this_socket.emit('data',"<br>> Skipping log of the set digital io event");
  }

  console.log("gatewayMod: set_digital_io: right before calling set up set_digital_io email notification...");
  mailOptions.text = "Xerisure message: gatewayModel: set_digital_io for: MAC ID: " + macid + " Pin (base 0): " + pin + ", Setting to state: " + state + " [End Message]";
  await transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
      // Can use info.MessageId etc.
      this_socket.emit('data', "<br>> Error on sending mail notification from gatewayModel for set_digital_io");
    } else {
      console.log('Email sent: ' + info.response);
      this_socket.emit('data', "<br>> <b>Finished sending mail notification from gatewayModel for set_digital_io");
    }
  });

  console.log("gatewayMod: finished set_digital_io, after email notification.");
  console.log("");

}; // end of: set_digitial_io








// https://stackoverflow.com/questions/35962539/express-mongoose-model-find-returns-undefined
// https://stackoverflow.com/questions/45379341/function-returns-undefined-when-i-want-to-find-documents-from-dababase-in-mongoo
// https://stackoverflow.com/questions/50555343/async-await-mongoose-doesnt-always-run-correctly
GatewaySchema.statics.get_db_radio_mac_ids = async function (socket) {

    /*await Mdbradio.find({}, 'name mac description', function (err, radios) {
          if (err) {
            console.log(err);
          } else {
            console.log("no err looking up find all radios");
            console.log(radios);
            res = radios; // send is for JSON // render for html
          }
      });*/

    var radios = await Mdbradio.listAll();

    socket.emit('macIdsFromDb', 'These are your database mac ids:<br>' + JSON.stringify(radios));
};



// TODO match this with other imlementation to keep the names in there too
GatewaySchema.statics.pop_db_radio_mac_ids = async function (socket) {
    var radios = await Mdbradio.listAll();
    // https://stackoverflow.com/questions/5515310/is-there-a-standard-function-to-check-for-null-undefined-or-blank-variables-in
    if ( radios ) {
      socket.emit('macIdsFromDb', 'These are your database mac ids:<br>' + JSON.stringify(radios));
      var sel = '<select name=\"macIdsSelSel\" id=\"macIdsSelSel\" onchange=\"macIdsSelFcn()\" onclick=\"macIdsSelFcn()\">';
      radios.forEach(function(radio) {
          //var mac = s.replace(/\r[\w\d][^\r]*\rFFFE/,"").replace(/FFFE/g,"").replace(/\W/g,"");
          var mac = radio.mac;

          //var name = s.replace(/FFFE\r0013A200\r[0-9A-F]{8}/,"").replace(/FFFE/g,"").replace(/[^\w\s]/g,"").replace(/^\s/,"").replace(/\s$/,"");
          var name = radio.name;
          //var tplus = mac + "<br>";
          //socket.emit('data', tplus);
          //d += tplus;
          sel += "<option value=\"" + mac + "\">" + mac + " (" + name + ")" + "</option>";
      });
      sel += "</select>";
      socket.emit('macidssel', sel);
      
      // TODO - on client: cookie for last selected mac id? or somehow store and re-select?
      // Look to socketwork maybe to place that?
      // Now - try to populate the watering data automatically from the selected mac id?
      // added in socketwork js in the macidssel event handler

      var sel = '<select name=\"macIdsSelSel\" id=\"macIdsSelSel\" onchange=\"macIdsSelFcn()\" onclick=\"macIdsSelFcn()\">'; // TODO Huh?
    } else {
      console.log("No radios to populate the select");
    }
}




GatewaySchema.statics.store_nd_radios_in_db = async function (socket, radios) {

  // TODO I'm pretty sure this is the totally wrong way to organize this workflow

  await socket.emit('data', "<br>Storing ND Radios in DB...<br><br>");
  // TODO clean this up
  radios.forEach(async function(r){
    await socket.emit('data', "MAC: " + r.mac + ", Name: " + r.name + "<br>");
  });

  await Mdbradio.storeAll(radios);

  await socket.emit('data', "<br>Completed storing ND Radios in DB<br>");

}




GatewaySchema.statics.set_destination_radio_mac_id = async function ( socket, macid ) {

    // TODO DRY - How? Socket_id only after establishes socket, so again some sort of null checks
    var app = require('../app');
    var io = app.io;
    var socket_id = app.locals.gateway_socket_id;
    var this_socket = socket; // io.sockets.connected[socket_id];
    this_socket.emit('data', "Set destination radio mac id...<br>");

    await XBee.EnterCommandMode(port, this_socket);

    await XBee.IssueAtCommand(port, this_socket, "atdh " + macid.substr(0,8));

    await XBee.IssueAtCommand(port, this_socket, "atdl " + macid.substr(8,8));

    await XBee.ExitCommandMode(port, this_socket);

};





GatewaySchema.statics.onSocketConnect = async function (socket) {

    console.log("Got into GatewaySchema.statics.onSocketConnect");
    await Gateway.get_gateway_xbee_mac(socket);
};






GatewaySchema.statics.initialize_gateway_serial = function (port) {

    console.log("Got into GatewaySchema.statics.initialize_gateway_serial");

    var _port_list = Gateway.serial_port_list_sync();
    var _first_port = Gateway.serial_port_to_use(_port_list);
    var _port = Gateway.setup_serial_port(_first_port, port);
    return { list:_port_list, first_port:_first_port, port:_port};

};





GatewaySchema.statics.get_gateway_xbee_mac = async function (socket) {

    console.log("Got into get_gateway_xbee_mac");

    port.flush();

    await XBee.EnterCommandMode(port, socket);

    await XBee.IssueAtCommand(port, socket, "atsl"); // default timeoutms is 100 - this is ok

    await XBee.IssueAtCommand(port, socket, "atsh"); // default timeoutms is 100 - this is ok

    await XBee.ExitCommandMode(port, socket);

};







GatewaySchema.statics.get_gateway_radio_dios = async function (socket) {

    console.log("Got into get_gateway_radio_dios");

    port.flush();

    await XBee.EnterCommandMode(port, socket);

    // Keeping test code here for reference for getting local gateway radio DIOs
    // Miss ruby yet?
    //@data_ios = []
    //(0..7).each do |i|
    //  cmd = "atd#{i.to_s}\r\n"
    //  serialport.write(cmd)
    //  sleep(0.2)
    //  @data_ios << serialport.read(2).gsub!(/\W/,'')
    //end

    var maxdios = 8;
    for ( var i = 0; i < maxdios; i++ ) {
        cmd = "atd" + i.toString();
        await XBee.IssueAtCommand(port, socket, cmd, 200);
    }

    await XBee.ExitCommandMode(port, socket);

};






GatewaySchema.statics.get_remote_radio_dios = async function (socket, macid) {

    console.log("Got into get_remote_radio_dios");

    port.flush();


    // TODO - API logic (pre/before hand) - only if needed?
    // TODO - implement then packet parsing is required to retrieve the results and extract the pin value
    // TODO - fancy schmancy update to received data parsing for API packets etc.


    await XBee.EnterCommandMode(port, socket);

    await XBee.IssueAtCommand(port, socket, "atap1");

    await XBee.ExitCommandMode(port, socket);

    socket.emit('data', 'Put gateway xbee into API(1) mode via AT commands.  Preparing for remote radio comms via API packets for remote radio MAC ID ' + macid);
    // socket.emit('data', 'This function is not yet implemented. Please see code');

    // TODO max DIO number ... somewhere -- XBee module?
    for ( var i = 0; i < 9; i++ ) {
      cmd = "D" + i.toString();
      await XBee.SendApiRemoteAtPacket(port, socket, macid, cmd, 50);
      // These can be all queued up and sent directly - the responses will come back over time

      // Now we could detach the data event (flow mode for the serial port) and do explicit read w/ timeout
      // or alternate method ...
    }


    // Returned API packet data
    // Data section
    // Will show the command, command status, command value
    // So if we see: D705 (0x44 0x37 0x00 0x05 = "D" "7" (0x00) (0x05) so No error = 0x00 and Value = 0x05
    // To test: "7".charCodeAt(0).toString(16) => 37 = 0x37
    //

};






// TODO fix naming conventions

GatewaySchema.statics.get_gateway_xbee_dest_mac = async function (socket) {

    console.log("Got into get_gateway_xbee_dest_mac");

    var this_socket = socket; // io.sockets.connected[socket_id];

    port.flush();

    await XBee.EnterCommandMode(port, this_socket);

    await XBee.IssueAtCommand(port, this_socket, "atdl");

    await XBee.IssueAtCommand(port, this_socket, "atdh");

    await XBee.ExitCommandMode(port, this_socket);

};





GatewaySchema.statics.do_node_discover = async function (socket) {



    // TODO - move to XBee module?

    await XBee.EnterCommandMode(port, socket);

    // Node discover
    await XBee.IssueAtCommand(port, socket, "atnd");

    // Is below really necessary?  Just wait some amount of time for data to be returned ... async ...
    var intervalms = 100.0;
    var maxwaittimesec = 10.0;
    var maxwaitintervals = maxwaittimesec * 1000.0 / intervalms;
    // TODO create waiting notification output function
    for ( i = 0; i < maxwaitintervals; i++ ) {
        socket.emit(
            'data',
            "> ... waiting ... interval " + i.toString() + " of " + maxwaitintervals.toString() + "...");
        await sleep(intervalms);
    }

    await XBee.ExitCommandMode(port, socket);

    setTimeout(function(){Gateway.dump_string_buffer(socket)}, 15000); // clears buffer after dump
    setTimeout(function(){
      r = XBee.ParseStringForMacIdsAndNames(stringBuffer);
      if ( r ) {
        setTimeout(function() {
          socket.emit('data', "<br><br>MAC IDs parsed:<br>");
          var d = "";
          var sel = '<select name=\"macIdsSelSel\" id=\"macIdsSelSel\"  onchange=\"macIdsSelFcn()\" onclick=\"macIdsSelFcn()\">';
          for ( let s of r ) {
              var mac = s.replace(/\r[\w\d][^\r]*\rFFFE/,"").replace(/FFFE/g,"").replace(/\W/g,"");
              var name = s.replace(/FFFE\r0013A200\r[0-9A-F]{8}/,"").replace(/FFFE/g,"").replace(/[^\w\s]/g,"").replace(/^\s/,"").replace(/\s$/,"");
              var tplus = mac + "<br>";
              socket.emit('data', tplus);
              d += tplus;
              sel += "<option value=\"" + mac + "\">" + mac + " (" + name + ")" + "</option>";
          }
          sel += "</select>";
          socket.emit('macids', d);
          socket.emit('macidssel', sel);
        }, 1000); // setTimeout to print after the screen dump, since buffer gets cleared ... TODO cleanup
      }
    }, 14000);

};



GatewaySchema.statics.load_radio_data = async function( socket, macId )  {
	
	//macId += 'xxxx'; // crude test for bad radio macId
	
	Mdbradio.find({mac: macId}).populate({
		    path: 'wateringcircuits', 
		    populate: { path: 'logEvents' }
		  }).lean().exec( function(err, rdat) {
		  if (err) console.log(err);
		  rdat = rdat[0];
		  //var formatted = "Watering circuits:<br><br>"; // JSON.stringify(rdat) + "<br><br>Watering circuits:<br><br>";
		  var formatted = "";
		  if ( rdat && rdat.wateringcircuits ) {
		    // TODO table class for mobile or update media css
			formatted += "<table class=\"table table-striped table-sm table-responsive-sm\"><tr><th>#</th><th>Name</th><th>GPIO</th><th>On</th><th>Off</th><th>Timed Cycle</th><th>Descrip</th><th>Last Active</th></tr>";
  		    for ( let wc of rdat.wateringcircuits ) {
			  wc = new Wateringcircuit(wc);
			  formatted += "<tr>"; 
			  formatted += "<td>" + wc.number + "</td><td>" + wc.name;
            formatted += `<br><button class="btn btn-primary btn-xs" onclick="socket.emit('client_get_digital_io', '${macId}', '${wc.gpionumber}', '${wc.offstate}');">Get State</button>`;
        formatted += "</td><td>" + wc.gpionumber + "</td><td>"; // + wc.onstate;
			  formatted += "<button class=\"btn btn-primary\" onclick=\" socket.emit('client_set_digital_io', \'" + macId + "\', \'" + wc.gpionumber + "\', \'" + wc.onstate + "\');\">On (" + wc.onstate + ")</button>"; // socket.emit('client_set_digital_io', txtSetDigitalIoMacId.value, txtSetDigitalIoPin.value, txtSetDigitalIoPinState.value);
              formatted += "</td><td>"; // + wc.offstate;
              formatted += "<button class=\"btn btn-primary\" onclick=\" socket.emit('client_set_digital_io', \'" + macId + "\', \'" + wc.gpionumber + "\', \'" + wc.offstate + "\');\">Off (" + wc.offstate + ")</button>";
              formatted += "</td><td>";
              formatted += "<button class=\"btn btn-primary\" onclick=\"waterCycle(\'" + macId + "\', \'" + wc.gpionumber + "\', \'" + wc.onstate + "\', \'" + wc.offstate + "\');\">Run</button>";
              formatted += "</td><td>";
              formatted += wc.description + "</td><td>";
              formatted += wc.get('lastActiveString') + "</td>" //wc.logEvents + "</td>";
			  formatted += "</tr>";
		    }
		    formatted += "</table>";
		  } else {
			  // As of yet untested TODO-TEST
			  formatted += "No watering circuits found for this radio. Radio data is:<br><br>";
			  formatted += JSON.stringify(rdat);
			  formatted += "<br><br>for macId: " + macId;
		  }
		  // TODO add function or option etc to check for whether this is off or on state and set log correctly and state correctly 
		  socket.emit('radiodata', formatted);
	  }
	);
	
};




// Yeah, this needs to be at the end to capture all of the statics, so it seems at this point ...

var Gateway = mongoose.model('Gateway', GatewaySchema);

module.exports = {
    Gateway: Gateway
}



console.log("Dev Echo: Gateway model parsed to end");
