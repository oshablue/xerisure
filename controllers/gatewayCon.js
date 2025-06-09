var Gateway = require('../models/Gateway').Gateway;


//
// Gateway is the server itself at this time
//



exports.serial_port_list = function(req, res) {

    console.log("\r\nCONTROLLER: Got to gatewayController exports.serial_port_list");

    res.render('gateway', { serialPortList: Gateway.serial_port_list} );

};



exports.initialize_serial = function(req, res) {

    console.log("\r\nCONTROLLER: Got to gatewayController exports.initialize_serial");

    //console.log(req.app.get('sp'));


    //console.log(req.sp);

    /*var app = require('../app');
    var io = app.io;
    var socket_id = app.locals.gateway_socket_id;
    var this_socket = io.sockets.connected[socket_id];
    var socket_info;
    if ( typeof this_socket === "undefined" ) {
        socket_info = "undefined";
    } else {
        socket_info = this_socket.id;
    }
    console.log("Current app.locals.gateway_socket_id: " + socket_id + " trying to get a socket by this id gives: " + socket_info);
    */

    //var port = req.app.locals.port;
    
    // Actually now at www level, Gateway.start(io) is called 
    // which sets event that on connection, setup_serial_port_and_socket_messaging 
    // is called which calls initialize_gateway_serial if needed anyway
    // commenting this out, we lose the items {} though
    //var items = Gateway.initialize_gateway_serial();

    // Right so now just the web page items are not present ... empty on the page
    //
    res.render('gateway', {}); //, {sp:sp}); // { serialPortList: items.list, serialPortToUse: items.first_port, port: items.port });

};
