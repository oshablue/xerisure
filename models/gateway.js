//
/* Model :: gateway */
//


// see:
// https://stackoverflow.com/questions/9230932/file-structure-of-mongoose-nodejs-project


var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var GatewaySchema = new Schema({

  name 			: String

});


// https://stackoverflow.com/questions/24609991/using-socket-io-in-express-4-and-express-generators-bin-www

//var app = require('../app');
//var app = require('express');
//var server = require('http').createServer(app);
//var io = require('socket.io').listen(app.server);
//console.log(app.server);

//var server = require('http').Server(app);
//var io = require('socket.io')(server);

//var io = app.io;
//console.log(io);



/* Bad boys and girls! No sync! */
// Use .methods for instance functions
GatewaySchema.statics.serial_port_list_sync = function () {

    const execSync = require('child_process').execSync;
    code = execSync('ls /dev/ttyUSB*');
    return code;

};
//exports.serial_port_list = _serial_port_list_sync();





//var _serial_port_to_use = function(list_in) {
GatewaySchema.statics.serial_port_to_use = function (list_in) {

    list_in = "" + list_in;
    var first_one = list_in.split("\n")[0].replace(/\r?\n|\r/,"");
    return first_one;

};
//exports.serial_port_to_use = _serial_port_to_use();






var SerialPort = require('serialport');
//var SerialPort = serialport.SerialPort; // also Poller, base, etc.
// https://node-serialport.github.io/node-serialport/SerialPort.html#open

GatewaySchema.statics.test_serial_as_xbee = function (port_name) {

    var port = new SerialPort(port_name, {
        baudRate: 9600,
        autoOpen: false
    });

    var io = require('../app').io;

    // Works
    //port.on("open", function () {
    //    console.log('open');
    //    port.on('data', function(data) {
    //        console.log(data); // + ' as string: ' + data.toString()); // serialport returns Buffer object as the data
    //        console.log(data.toString());
    //    });
    //});

    // Now try socketed
    // http://danialk.github.io/blog/2014/04/26/arduino-and-processingjs-and-socketio-in-action/
    port.on('open', function(){
        // Now server is connected to Arduino
        console.log('Serial Port Opened');

        //var lastValue;
        //io.sockets.on('connection', function (socket) {
        io.sockets.on('connection', function (socket) {
            //Connecting to client 
            console.log('Socket connected');
            socket.emit('connected');
            //var lastValue;

            port.on('data', function(data){
                socket.emit('data', data.toString());
                console.log(data);
                //var angle = data[0];
                //if(lastValue !== angle){
                    //socket.emit('data', angle);
                //}
                //lastValue = angle;
            });
        });
    });


    port.on('error', function(err) {
        console.log('SerialPort port Error: ', err.message + err.stack);
    });

    return port;

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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


GatewaySchema.statics.get_gateway_xbee_mac = async function (port) {

    console.log("Got into get_gateway_xbee_mac");

    port.open();
    await sleep(2000);

    port.flush();

    port.write("+++");
    await sleep(2000);

    port.write("atsl\r\n");
    await sleep(100);

    port.write("atsh\r\n");
    await sleep(100);

    port.write("atcn\r\n");

    /* From the RoR port (prior draft and testing basics)
    # purge
    b = serialport.getbyte
    while !b.nil?
      b = serialport.getbyte
    end
    
    serialport.write "+++"
    sleep(2)
    @enter_command_result = serialport.read(3)
    
    serialport.write("atsl\r\n")
    sleep(0.1)
    @data_atsl = serialport.read(8)
    
    serialport.write("atsh\r\n")
    sleep(0.1)
    @data_atsh = serialport.read(8)
    @data_atsh.gsub!(/\W/,'')   # Remove non alphanumeric, etc. e.g. sometimes 0013A200 will be printed as ??13A200 and prep for rjust

    serialport.write("atdl\r\n")
    sleep(0.1)
    @data_atdl = serialport.read(8)
    
    serialport.write("atdh\r\n")
    sleep(0.1)
    @data_atdh = serialport.read(8)
    @data_atdh.gsub!(/\W/,'') 

    @data_ios = []
    (0..7).each do |i|
      cmd = "atd#{i.to_s}\r\n"
      serialport.write(cmd)
      sleep(0.2)
      @data_ios << serialport.read(2).gsub!(/\W/,'')
    end
    
    # Exit command mode
    serialport.write("atcn\r\n")
    sleep(1)

    */    

};








// Yeah, this needs to be at the end to capture all of the statics, so it seems at this point ...

var Gateway = mongoose.model('Gateway', GatewaySchema);

module.exports = {
    Gateway: Gateway
}



console.log("Gateway model parsed to end");




