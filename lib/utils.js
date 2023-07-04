const events = require('events');
//class Emitter extends EventEmitter{};
var ServerSideEmitter = new events.EventEmitter();



var sleep = function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



module.exports = {
    sleep: sleep,
    ServerSideEmitter
};
