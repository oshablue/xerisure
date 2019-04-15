var Gateway = require('../models/gatewayMod').Gateway;


//
// Gateway is the server itself at this time
//



exports.serial_port_list = function(req, res) {

    console.log("\r\nCONTROLLER: Got to gatewayController exports.serial_port_list");

    res.render('gateway', { serialPortList: Gateway.serial_port_list} );

};



exports.initialize_serial = function(req, res) {

    console.log("\r\nCONTROLLER: Got to gatewayController exports.initialize_serial");

    var app = require('../app');
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

    var items = Gateway.initialize_gateway_serial();

    res.render('gateway', { serialPortList: items.list, serialPortToUse: items.first_port, port: items.port });

};
