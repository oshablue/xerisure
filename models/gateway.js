//
/* Model :: gateway */
//


// see:
// https://stackoverflow.com/questions/9230932/file-structure-of-mongoose-nodejs-project

var XBee = require('./xbee').XBee;
var Utils = require('../lib/utils');
var sleep = Utils.sleep;

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var GatewaySchema = new Schema({

  name 			: String,

});


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
var port_name;
var port;



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






GatewaySchema.statics.test_serial_as_xbee = function (port_name) {

    console.log("Got into test_serial_as_xbee");

    if ( port == null ) {

        console.log("port is null, initializing serial port ... for port_name: " + port_name);
        port = new SerialPort( port_name, {
            baudRate: 9600,
            autoOpen: false
        });
    }

    var io = require('../app').io;

    port.on('open', function(){

        console.log('Serial Port Opened');

        io.sockets.on('connection', function (socket) {
            
            //Connecting to client 
            console.log('Socket connected');
            socket.emit('connected');
            console.log(socket.id);
            var app = require('../app');
            app.locals.gateway_socket_id = socket.id;

            port.on('data', function(data){
                socket.emit('data', "<br>" + data.toString().replace("\r","<br>")); 
                // was replace with <br> // lines terminated with 0x0d
                // or replace with " " (using "" creates a problem)

                console.log(data);
            });

            socket.on('join', function(data) {
                console.log("Server socket received connect with data: " + data);
            });


            // Do you miss ajax and post?
            // Or are socket(s) awesome here?
            socket.on('client_set_destination_mac_id', function(macid) {
                console.log("Server socket received client_set_destination_mac_id of " + macid);
                Gateway.set_destination_radio_mac_id(port, macid);
            });

            socket.on('client_set_digital_io', function(macid, pin, state) {
                console.log("Server socket received client_set_digital_io of " + macid + " for pin " + pin + " to state " + state);
                Gateway.set_digital_io(port, macid, pin, state);
            });

        });
    });

    port.on('error', function(err) {
        console.log('SerialPort port Error: ', err.message + err.stack);
    });

    return port;

};




GatewaySchema.statics.set_digital_io = async function ( port, macid, pin, state ) {

    var app = require('../app');
    var io = app.io;
    var socket_id = app.locals.gateway_socket_id;
    var this_socket = io.sockets.connected[socket_id];
    this_socket.emit('data', "Set Digital IO via API...<br>");    

    await XBee.EnterCommandMode(port, this_socket);

    await XBee.IssueAtCommand(port, this_socket, "atap1");

    await XBee.ExitCommandMode(port, this_socket);

    const START_BYTE = 0x7E;
    const FRAME_TYPE = 0x17;

    var bytes = new Uint8Array(100);
    bytes[0] = (START_BYTE);
    bytes[1] = (0x00);
    bytes[2] = (0x10);
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
    bytes[10+8] = (parseInt("0x" + state.substr(0,2)));

    var sum = 0x0000;
    for ( var j = 3; j < bytes.length; j++ ) {
        sum += bytes[j];
    }
    sum &= 0x00FF;
    var checksum = 0xFF - sum;

    bytes[11+8]= (checksum);
    console.log("Checksum: " + checksum);

    this_socket.emit('data', ">(bytes array for api packet) (1000ms)<br>");
    console.log(JSON.stringify(bytes.slice(0, 11+17)));
    port.write(bytes.slice(0, 11+17));
    await sleep(1000);

};




GatewaySchema.statics.set_destination_radio_mac_id = async function ( port, macid ) {

    // TODO DRY - How? Socket_id only after establishes socket, so again some sort of null checks
    var app = require('../app');
    var io = app.io;
    var socket_id = app.locals.gateway_socket_id;
    var this_socket = io.sockets.connected[socket_id];
    this_socket.emit('data', "Set destination radio mac id...<br>");

    await XBee.EnterCommandMode(port, this_socket);

    await XBee.IssueAtCommand(port, this_socket, "atdh " + macid.substr(0,8));

    await XBee.IssueAtCommand(port, this_socket, "atdl " + macid.substr(8,8));

    await XBee.ExitCommandMode(port, this_socket);

};




//var _initialize_gateway_serial = function() {
GatewaySchema.statics.initialize_gateway_serial = function () {

    console.log("Got into GatewaySchema.statics.initialize_gateway_serial");

    var _port_list = Gateway.serial_port_list_sync();
    var _first_port = Gateway.serial_port_to_use(_port_list);
    var _port = Gateway.test_serial_as_xbee(_first_port);
    var _gw_xbee_mac = Gateway.get_gateway_xbee_mac(_port);
    return { list:_port_list, first_port:_first_port, port:_port};

};
//exports.initialize_gateway_serial = _initialize_gateway_serial();


// TODO move to utils, etc.
//function sleep(ms) {
//    return new Promise(resolve => setTimeout(resolve, ms));
//}




GatewaySchema.statics.get_gateway_xbee_mac = async function (port) {

    console.log("Got into get_gateway_xbee_mac");

    //console.log("Port is open?" + port.isOpen.toString());
    if ( !port.isOpen ) {
        port.open();
        await sleep(2000);
    } else {
        console.log("...port is already open...");
    }

    var app = require('../app');
    var io = app.io;
    var socket_id = app.locals.gateway_socket_id;
    var this_socket = io.sockets.connected[socket_id];
    this_socket.emit('data', "Get Gateway XBee MAC ID (after port.open() and sleep)...<br>");

    port.flush();

    await XBee.EnterCommandMode(port, this_socket);
    
    await XBee.IssueAtCommand(port, this_socket, "atsl"); // default timeoutms is 100 - this is ok

    await XBee.IssueAtCommand(port, this_socket, "atsh"); // default timeoutms is 100 - this is ok

    
    // Destination if any

    await XBee.IssueAtCommand(port, this_socket, "atdl");

    await XBee.IssueAtCommand(port, this_socket, "atdh");
    
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
        await XBee.IssueAtCommand(port, this_socket, cmd, 200);
    }


    // Node discover
    await XBee.IssueAtCommand(port, this_socket, "atnd");

    // Is below really necessary?  Just wait some amount of time for data to be returned ... async ...
    var intervalms = 100.0;
    var maxwaittimesec = 10.0;
    var maxwaitintervals = maxwaittimesec * 1000.0 / intervalms; 
    // TODO create waiting notification output function
    for ( i = 0; i < maxwaitintervals; i++ ) {
        this_socket.emit(
            'data', 
            "> ... waiting ... interval " + i.toString() + " of " + maxwaitintervals.toString() + "...");
        await sleep(intervalms);
    }
    
    await XBee.ExitCommandMode(port, this_socket);

};








// Yeah, this needs to be at the end to capture all of the statics, so it seems at this point ...

var Gateway = mongoose.model('Gateway', GatewaySchema);

module.exports = {
    Gateway: Gateway
}



console.log("Gateway model parsed to end");




