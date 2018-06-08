var Gateway = require('../models/gateway').Gateway;


exports.serial_port_list = function(req, res) {

    res.render('gateway', { serialPortList: Gateway.serial_port_list} );

};



exports.initialize_serial = function(req, res) {

    console.log("Got to gatewayController exports.initialize_serial");

    var items = Gateway.initialize_gateway_serial();

    res.render('gateway', { serialPortList: items.list, serialPortToUse: items.first_port });

};


