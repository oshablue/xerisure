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


// Add this function to your utils.js file

const fs = require('fs');

function getAllTtyUsbDevices() {
    try {
        const devices = fs.readdirSync('/dev')
            .filter(file => file.startsWith('ttyUSB'))
            .map(file => `/dev/${file}`)
            .sort(); // Sort to get consistent ordering
        return devices;
    } catch (err) {
        console.error('Error reading /dev directory:', err);
        return [];
    }
}

async function findWorkingTtyUsbDevice(baudRate = 9600) {
    const devices = getAllTtyUsbDevices();
    console.log('Available USB devices:', devices);
    
    if (devices.length === 0) {
        throw new Error('No ttyUSB devices found');
    }

    for (const devicePath of devices) {
        try {
            console.log(`Trying to open ${devicePath}...`);
            const SerialPort = require('serialport').SerialPort;
            
            // Test if the device can be opened
            const testPort = new SerialPort({
                path: devicePath,
                baudRate: baudRate,
                autoOpen: false
            });
            
            await new Promise((resolve, reject) => {
                testPort.open((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        testPort.close(() => {
                            resolve();
                        });
                    }
                });
            });
            
            console.log(`Successfully tested ${devicePath}`);
            return devicePath;
            
        } catch (err) {
            console.log(`Failed to open ${devicePath}: ${err.message}`);
            continue;
        }
    }
    
    throw new Error('No working ttyUSB devices found');
}







module.exports = {
    sleep: sleep,
    getFirstTtyUsbDeviceSync,
    getAllTtyUsbDevices,
    findWorkingTtyUsbDevice,
    ServerSideEmitter
};
