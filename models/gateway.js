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
//var _test_serial_as_xbee = function(port_name) {
GatewaySchema.statics.test_serial_as_xbee = function (port_name) {

    port = new SerialPort(port_name, {
        baudRate: 9600
    });
    return port;

};






//var _initialize_gateway_serial = function() {
GatewaySchema.statics.initialize_gateway_serial = function () {
//exports.initialize_gateway_serial = function () {

    console.log("Got into GatewaySchema.statics.initialize_gateway_serial");

    var _port_list = Gateway.serial_port_list_sync();
    var _first_port = Gateway.serial_port_to_use(_port_list);
    var _port = Gateway.test_serial_as_xbee(_first_port);
    return { list:_port_list, first_port:_first_port, port:_port};

};
//exports.initialize_gateway_serial = _initialize_gateway_serial();



// Yeah, this needs to be at the end to capture all of the statics

var Gateway = mongoose.model('Gateway', GatewaySchema);

module.exports = {
    Gateway: Gateway
}



console.log("Gateway model parsed to end");




