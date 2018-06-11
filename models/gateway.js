//
/* Model :: gateway */
//


// see:
// https://stackoverflow.com/questions/9230932/file-structure-of-mongoose-nodejs-project


var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var GatewaySchema = new Schema({

  name 			: String,
  //socket_id     : String // will this break when we use live db connection? or be a speed / io issue?

});


// https://stackoverflow.com/questions/18239358/adding-virtual-variables-to-a-mongoose-schema

//GatewaySchema.virtual('socket_id').get(function() {
//    return this.__socket_id;
//}).set(function(id) {
//    this.__socket_id = id;
//});




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

    console.log("Got into test_serial_as_xbee");

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
            console.log(socket.id);
            //this.socket_id = socket.id; // not an instance method
            var app = require('../app');
            app.locals.gateway_socket_id = socket.id;


            port.on('data', function(data){
                socket.emit('data', data.toString().replace("\r","<br>")); // lines terminated with 0x0d
                console.log(data);
                //var angle = data[0];
                //if(lastValue !== angle){
                    //socket.emit('data', angle);
                //}
                //lastValue = angle;
            });

            socket.on('join', function(data) {
                console.log("Server socket received connect with data: " + data);
            });

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

    // Set local radio to API mode:
    //serialport.write "+++"
    //sleep(2)
    //enter_command_result = serialport.read(3)
    //
    //serialport.write("atap1\r\n")
    //sleep(0.1)
    //
    //enter_command_result = serialport.read(3)
    //
    //# Exit command mode
    //serialport.write("atcn\r\n")

    this_socket.emit('data', "<br>>+++ [Enter command mode] (2000ms)<br>");
    port.write("+++");
    await sleep(2000);

    this_socket.emit('data', ">atap1 (100ms)<br>");
    port.write("atap1\r\n");
    await sleep(100);

    this_socket.emit('data', "<br>>atcn [Exit command mode]<br>");
    port.write("atcn\r\n");

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


    //sum = 0x0000
    //arr.each { |x| sum += x }
    //#Rails.logger.info "#{sum}"
    //sum &= 0x00FF
    //#Rails.logger.info "#{sum}"
    //#Rails.logger.info "#{0xFF - sum}"
    //return (0xFF - sum)

    var sum = 0x0000;
    for ( var j = 3; j < bytes.length; j++ ) {
        sum += bytes[j];
    }
    sum &= 0x00FF;
    var checksum = 0xFF - sum;

    bytes[11+8]= (checksum);
    console.log("Checksum: " + checksum);

    // actually bytes get sent as chr's 

    //for ( i = 0; i < bytes.length; i++ ) {
    //    bytes[i] = bytes[i]; // hey wait we needed the chr e.g. ruby 65.chr = "A" ... so we could have just sent the above as string/text?
    //}

    this_socket.emit('data', ">(bytes array for api packet) (1000ms)<br>");
    console.log(JSON.stringify(bytes.slice(0, 11+17)));
    port.write(bytes.slice(0, 11+17));
    await sleep(1000);


    // TODO obviously move and DRY
    /*
    start_byte = START_BYTE
    frame_type = FRAME_TYPE
    
    bytes = []
    bytes << start_byte
    bytes << 0x00       # length MSB - bytes between length and checksum
    bytes << 0x10       # length LSB - bytes between length and checksum
    bytes << frame_type
    bytes << 0x01       # frame ID - set to 0 for no response
    bytes << mac_as_string.scan(/../).map { |x| x.to_i(16) }
    bytes.flatten!
    bytes << 0xFF       # 16-bit address
    bytes << 0xFE       # 16-bit address
    bytes << 0x02       # Apply Changes: true = 0x02 - needed for changes to take effect
    bytes << "D".unpack('C*')   # Send the DIO "D" before the pin number
    bytes << pin_as_string.unpack('C*') # Send the string pin number as the ASCII char value
    bytes << value_as_hex      # 0x04 active low, 0x05 active high
    bytes.flatten!
    checksum_byte = xbee_checksum(bytes[3..-1])
    bytes << checksum_byte
    
    Rails.logger.info "#{bytes.inspect}"
    
    bytes_to_send = bytes.map{|b| b.chr}.join.to_s #to_s not needed most likely
    
    portlist = `ls /dev/ttyUSB*`  # TODO split etc.
    port_to_use = portlist.split("\n")[0].gsub("\n","") # Use the first for now - TODO select and store
    
    serialport = Serial.new port_to_use
    
    # purge
    b = serialport.getbyte
    while !b.nil?
      b = serialport.getbyte
    end
    
    serialport.write(bytes_to_send)
    sleep(0.1)
    */



};



GatewaySchema.statics.set_destination_radio_mac_id = async function ( port, macid ) {

    var app = require('../app');
    var io = app.io;
    var socket_id = app.locals.gateway_socket_id;
    var this_socket = io.sockets.connected[socket_id];
    this_socket.emit('data', "Set destination radio mac id...<br>");

    this_socket.emit('data', "<br>>+++ [Enter command mode] (2000ms)<br>");
    port.write("+++");
    await sleep(2000);
// TODO add console prints to double-check
    this_socket.emit('data', ">atdh= (100ms)<br>");
    port.write("atdh " + macid.substr(0,8) + "\r\n");
    await sleep(100);

    this_socket.emit('data', ">atdl= (100ms)<br>");
    port.write("atdl " + macid.substr(8,8) + "\r\n");
    await sleep(100);

    this_socket.emit('data', "<br>>atcn [Exit command mode]<br>");
    port.write("atcn\r\n");

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

    var app = require('../app');
    var io = app.io;
    var socket_id = app.locals.gateway_socket_id;
    var this_socket = io.sockets.connected[socket_id];
    this_socket.emit('data', "Get Gateway XBee MAC ID (after port.open() and sleep)...<br>");

    port.flush();

    this_socket.emit('data', "<br>>+++ [Enter command mode] (2000ms)<br>");
    port.write("+++");
    await sleep(2000);

    this_socket.emit('data', ">atsl (100ms)<br>");
    port.write("atsl\r\n");
    await sleep(100);

    this_socket.emit('data', ">atsh (100ms)<br>");
    port.write("atsh\r\n");
    await sleep(100);

    // Destination if any

    this_socket.emit('data', ">atdl (100ms)<br>");
    port.write("atdl\r\n");
    await sleep(100);

    this_socket.emit('data', ">atdh (100ms)<br>");
    port.write("atdh\r\n");
    await sleep(100);
    
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
        this_socket.emit('data', ">" + cmd + " (200ms)<br>");
        port.write(cmd + "\r\n");
        await sleep(200);
    }

    // Node discover
    this_socket.emit('data', ">atnd (100ms)<br>");
    port.write("atnd\r\n");
    await sleep(100);
    // Is below really necessary?  Just wait some amount of time for data to be returned ... async ...
    var intervalms = 100.0;
    var maxwaittimesec = 10.0;
    var maxwaitintervals = maxwaittimesec * 1000.0 / intervalms; 
    for ( i = 0; i < maxwaitintervals; i++ ) {
        this_socket.emit('data', "> ... waiting ... interval " + i.toString() + " of " + maxwaitintervals.toString() + "<br>");
        await sleep(intervalms);
    }
    

    this_socket.emit('data', "<br>>atcn [Exit command mode]<br>");
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




