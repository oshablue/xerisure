const events = require('events');
//class Emitter extends EventEmitter{};
var ServerSideEmitter = new events.EventEmitter();



var sleep = function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// usbreset: FT231X USB UART = 0403:6015
// See Readme about sleep and wake and the serial path issue for Ubuntu 18 and maybe others (?)
// Might also this work: ?
// SerialPort.list().then(ports => {
//    ports.forEach(function(port) {
//        console.log(port.path);
//    });
// });
var getFirstTtyUsbDeviceSync = function() {

    const execSync = require('child_process').execSync;
    code = execSync('ls /dev/ttyUSB*');
    list_in = "" + code;
    var first_one = list_in.split("\n")[0].replace(/\r?\n|\r/,"");
    return first_one;

}






module.exports = {
    sleep: sleep,
    getFirstTtyUsbDeviceSync,
    ServerSideEmitter
};
