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


XBee.SendApiRemoteAtPacket = async function(port, clientSocket, macid, cmd, timeoutms = 100) {

    // return the parsed API response packet, parsed for content
    // data event handler will get the response actually - so parse separately

    // https://www.digi.com/resources/documentation/Digidocs/90001942-13/concepts/c_api_frame_structure.htm?tocpath=XBee%20API%20mode%7C_____2

    // https://www.digi.com/resources/documentation/Digidocs/90001942-13/reference/r_supported_frames_zigbee.htm?tocpath=XBee%20API%20mode%7C_____3

    // https://www.digi.com/resources/documentation/Digidocs/90001942-13/reference/r_zigbee_frame_examples.htm?tocpath=XBee%20API%20mode%7C_____4

    // https://www.digi.com/resources/documentation/digidocs/pdfs/90000976.pdf

    port.flush();

    var responseAsIfAtCmd = "";
    var plength = 0x0D;                 // Payload length (not pointer to length ;)

    const START_BYTE = 0x7E;
    const FRAME_TX_TYPE = 0x17;         // Execute AT command request on remote radio
    const FRAME_RX_TYPE = 0x97;         // Remote AT command response frame type
    const APPLY_CHANGES = 0x02;
    
    // Uint8Array declaration for bytes, but can't push so pre-define large
    var bytes = new Uint8Array(100);  

    bytes[0] = (START_BYTE);
    bytes[1] = (0x00);                  // Length MSB (payload bytes 3 .. end excl checksum)
    bytes[2] = (0x10);                  // Length LSB (payload bytes 3 .. end excl checksum) - update laters
    bytes[3] = (FRAME_TX_TYPE);            // Payload (for length and checksum) starts here
    bytes[4] = (0x01);                  // Frame ID (increment from 1 or set to 0 for no ack ti FID reply)

    for ( var i = 0; i < macid.length/2; i++ ) {
        bytes[5+i] = (parseInt("0x" + macid.substr(i*2,2))); // me likey parseInt with this
    }

    bytes[5+8] = (0xFF);                // Reserved for longer addresses - yes bytes[13]
    bytes[6+8] = (0xFE);                // or 0xFFFF for broadcast - yes bytes[14]
    bytes[7+8] = (0x02);                // Apply changes or 0x00 for N/A or don't apply?

    // Payload length including address is 13 bytes in length up to here, excluding the 
    // command itself, which is 0x0D
    
    //bytes[8+8] = ("D".charCodeAt(0));   // e.g. (B) = 0x42
    //bytes[9+8] = (pin.charCodeAt(0));   // e.g. (H) = 0x48
    //bytes[10+8] = (parseInt("0x" + state.substr(0,2))); // e.g. 0x01 = 1
    // parseInt("0x" + "04") = 4 vs "4" charCode = 52
    // no argument = query the parameter
    // the parseInt and substr combo work is the state is just "4" too
  
    // AT commands are always just 2 characters
    bytes[8+8] = cmd.charCodeAt(0);
    bytes[9+8] = cmd.charCodeAt(1);
    plength += 2;
    
    // AT command parameters is always just one byte so "0xNN" just the "NN" part
    if ( cmd.length > 2 ) {
      bytes[10+8] = (parseInt("0x" + cmd.substr(2,2))); // e.g. 0x01 = 1
      plength += 1;
    }

    // TODO move to external fcn
    var sum = 0x0000;
    for ( var j = 3; j < bytes.length; j++ ) {
        sum += bytes[j];
    }
    sum &= 0x00FF;
    var checksum = 0xFF - sum;

    //bytes[11+8]= (checksum);       
    bytes[plength + 3] = (checksum);      // +3 for the first 3 bytes not included in the length
    bytes[2] = plength;                   // only the LSB of the length will matter for AT commands (ish)
    console.log("Checksum: " + checksum);

    clientSocket.emit('data', "SendApiRemoteAtPacket: " + cmd + " API packet sent with timeout " + timeoutms + "<br>");
    console.log(JSON.stringify(bytes.slice(0, plength + 4))); // huh? : 17? ... 11+17)));
    port.write(bytes.slice(0, plength + 4));
    await sleep(timeoutms);

    // Read response
    
    // Well actually, the data event handler in the main code will get the response


    //return responseAsIfAtCmd;

}




// Checksum function







module.exports = {
    XBee:   XBee
}
