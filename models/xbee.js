// 
/* Model :: xbee */
//


//
// No Schema yet
// Primarily for XBee function calls at Class level (statics)
// 


var Utils = require('../lib/utils');
var sleep = Utils.sleep;

var defaultClientSocketChannel = 'data';


var XBee = function(data) {
    this.data = data;
    // Could include e.g.:
    // this.data.macid = data.macid; // etc.
}


XBee.prototype.data = {}


XBee.EnterCommandMode = async function(port, clientSocket) {
    
    clientSocket.emit(
        defaultClientSocketChannel, 
        "<br>>+++ [Enter command mode] (2000ms)<br>");
    port.write("+++");
    await sleep(2000);
    // TODO instead of wait, loop until read OK\r\n
    // otherwise max wait time and exit lack of success

} 


XBee.ExitCommandMode = async function(port, clientSocket) {
    
    clientSocket.emit(
        defaultClientSocketChannel, 
        "<br>>atcn [Exit command mode] (100ms)<br>");
    port.write("atcn\r\n");

} 


XBee.IssueAtCommand = async function(port, clientSocket, cmd, timeoutms = 100) {

    clientSocket.emit(
        defaultClientSocketChannel,
        "<br>>" + cmd + " (" + timeoutms.toString() + "ms)<br>");
    port.write(cmd + "\r\n");
    await sleep(timeoutms);

}



module.exports = {
    XBee:   XBee
}
