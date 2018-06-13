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



GatewaySchema.statics.emit_delayed_socket_message = async function ( socket, channel, data, delay_ms ) {

    await sleep(delay_ms);
    socket.emit(channel, data);
    console.log("emit_delayed_socket_message fired with channel " + channel + " socket id: " + socket.id);

}




GatewaySchema.statics.setup_serial_port_and_socket = function (port_name) {

    console.log("Got into setup_serial_port_and_socket");

    if ( port == null ) {

        console.log("serial port is null, initializing serial port ... for port_name: " + port_name);
        port = new SerialPort( port_name, {
            baudRate: 9600,
            autoOpen: false
        });
    }

    // Why doesn't it work to set this up (var app = ...) outside of the function?
    var app = require('../app');
    var io = app.io;

    // TODO error handling (if open undefined etc)
    port.on('open', function() {

        console.log('port.on(open): serial port open ... that is all.');

    });


    // Because with page reloads, it fires the get route function in app() repeatedly,
    // creating multiple listeners/on.events attached to a single socket
    // However new issue: with once, we are missing the very first emits on page load (not refresh)
    // async for:
    //    Gateway.emit_delayed_socket_message
    //    await sleep for serialport open
    // (if used)
    // .of('/gateway') is necessary because the socket.io on the client, if not yet set to
    // a path but rather just the window.origin e.g. IP:Port/
    // then right when the server starts, but before the /gateway route is fired to load the gateway page
    // a socket will be created - and then when the gateway page loads the socket ids will be out of sync
    // for the communications here - likely resulting in lost communications upon page first load
    // i.e. sockets are per page, per load (sort of - to be qualified)
    io.of('/gateway').once('connection', async function (socket) {

        
        socket.on('join', function(data) {
            console.log("Server socket received join with data: " + data);
            socket.emit('data', 'client join message received by server from: ' + data + '<br>');
        });


            
        //Connecting to client 
        console.log('Socket connected');
        console.log("socket.id: " + socket.id);
        console.log(' %s sockets connected', io.engine.clientsCount);
        // if using io.sockets.once vs io.sockets.on, then the first few
        // emits seem to be lost (not captured by the client as an update)
        // on first starting the serialport and loading the page 
        socket.emit('connected', true); 
        //Gateway.emit_delayed_socket_message(socket, 'connected', true, 4000); 
   
        //app.locals.gateway_socket_id = socket.id;

        // TODO 
        // error handling if port not set up etc.
        // may need to move elsewhere as we want this either:
        //  - open on gateway launch to do background items and checks independently
        //    - omit and just send port status to connected socket
        //  - open on socket client request if need to change port
        //    - Soln: Do indepently with close and re-open controls
        if ( !port.isOpen ) {
            console.log("...serial port not yet open...call open() now...");
            socket.emit('data', 'serial port closed - attempting to open...<br>');
            port.open();
            await sleep(2000);
            // without this sleep delay, next statement isOpen check will immediately
            // still show not open (yet)
        } else {
            console.log("...serial port is already open...");
        }

        if ( port.isOpen ) {
            console.log("... serial port is open ...");
            socket.emit('data', '<br>gateway serial port is open<br>');
        } else {
            console.log("... serial port is not open ...");
            socket.emit('data', '<br>gateway serial port is not open (but it ought to be ... err?)<br>');
        }

        // Do any on connection link proof here
        // Sometimes on reload page, we get 2 of these fired
        // Just for testing
        //Gateway.onSocketConnect();
        // NOTE if using the above or start up serial, then note that serial needs
        // not only open, but also sufficient sleep delay to allow full open process

        // TODO error handling - e.g. if port not yet instantiated?
        port.on('data', function(data){
            socket.emit('data', "<br>" + data.toString().replace("\r","<br>")); 
            // was replace with <br> // lines terminated with 0x0d
            // or replace with " " (using "" creates a problem)

            console.log(data);
        });

        socket.on('disconnect', function () {
            //app.locals.gateway_socket_id = null;
            console.log("Server got socket disconnect for: " + socket.id);
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

    });

    port.on('error', function(err) {
        console.log('SerialPort port Error: ', err.message + err.stack);
    });


    return port;

};




GatewaySchema.statics.set_digital_io = async function ( socket, macid, pin, state ) {

    var app = require('../app');
    var io = app.io;
    var socket_id = app.locals.gateway_socket_id;
    var this_socket = socket; // io.sockets.connected[socket_id];
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






GatewaySchema.statics.initialize_gateway_serial = function () {

    console.log("Got into GatewaySchema.statics.initialize_gateway_serial");

    var _port_list = Gateway.serial_port_list_sync();
    var _first_port = Gateway.serial_port_to_use(_port_list);
    var _port = Gateway.setup_serial_port_and_socket(_first_port);
    return { list:_port_list, first_port:_first_port, port:_port};

};





GatewaySchema.statics.get_gateway_xbee_mac = async function (socket) {

    console.log("Got into get_gateway_xbee_mac");

    port.flush();

    await XBee.EnterCommandMode(port, socket);
    
    await XBee.IssueAtCommand(port, socket, "atsl"); // default timeoutms is 100 - this is ok

    await XBee.IssueAtCommand(port, socket, "atsh"); // default timeoutms is 100 - this is ok


    // Keeping test code here for reference for getting local gateway radio DIOs
    // Miss ruby yet?
    //@data_ios = []
    //(0..7).each do |i|
    //  cmd = "atd#{i.to_s}\r\n"
    //  serialport.write(cmd)
    //  sleep(0.2)
    //  @data_ios << serialport.read(2).gsub!(/\W/,'')
    //end

    /*var maxdios = 8;
    for ( var i = 0; i < maxdios; i++ ) {
        cmd = "atd" + i.toString();
        await XBee.IssueAtCommand(port, this_socket, cmd, 200);
    }*/


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

    await XBee.EnterCommandMode(port, socket);

    await XBee.IssueAtCommand(port, socket, "atap1");

    await XBee.ExitCommandMode(port, socket);

    socket.emit('data', 'This function is not yet implemented. Please see code');

    return;

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

    socket.emit('data', ">(bytes array for api packet) (1000ms)<br>");
    console.log(JSON.stringify(bytes.slice(0, 11+17)));
    port.write(bytes.slice(0, 11+17));
    await sleep(1000);

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

};






// Yeah, this needs to be at the end to capture all of the statics, so it seems at this point ...

var Gateway = mongoose.model('Gateway', GatewaySchema);

module.exports = {
    Gateway: Gateway
}



console.log("Gateway model parsed to end");




