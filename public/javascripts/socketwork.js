var connection;
var statuslog;

var btnSetDestinationMacId;
var txtSetDestinationMacId;

var btnSetDigitalIo;
var txtSetDigitalIoMacId;
var txtSetDigitalIoPin;
var txtSetDigitalIoPinState;

var btnGetGatewayRadioMacIdInfo;
var btnGetGatewayRadioSerialLinkDestinationMacIdInfo;
var btnGetGatewayRadioDios;
var btnDoNodeDiscover;
var btnGetRemoteRadioDios
var txtRemoteRadioMacId;

var divMacIds;

// NOTE: Intentional explicit function setup, with non-DRY code for clarity (presumed...)

window.onload = function () {
    connection = document.getElementById('connection');
    statuslog = document.getElementById('statuslog');
    divMacIds = document.getElementById('macIds');
    btnSetDestinationMacId = document.getElementById('setDestinationRadioMacIdInputBtn');
    txtSetDestinationMacId = document.getElementById('setDestinationRadioMacIdInputTxt');

    btnSetDigitalIo = document.getElementById('setDigitalIoByApiInputBtn');
    txtSetDigitalIoMacId = document.getElementById('setDigitalIoByApiMacIdInputTxt');
    txtSetDigitalIoPin = document.getElementById('setDigitalIoByApiPinNumberInputTxt');
    txtSetDigitalIoPinState = document.getElementById('setDigitalIoByApiPinStateInputTxt');

    btnGetGatewayRadioMacIdInfo = document.getElementById('getGatewayRadioMacIdInfo');
    btnGetGatewayRadioSerialLinkDestinationMacIdInfo = 
        document.getElementById('getGatewayRadioSerialLinkDestinationMacIdInfo');

    btnGetGatewayRadioDios = document.getElementById('getGatewayRadioDios');
    btnDoNodeDiscover = document.getElementById('doNodeDiscover');

    txtRemoteRadioMacId = document.getElementById('remoteRadioMacIdInputTxt');
    btnGetRemoteRadioDios = document.getElementById('getRemoteRadioDios');

    // TODO DRY ... eventually ...
    btnSetDestinationMacId.addEventListener("click", function() {
        socket.emit('client_set_destination_mac_id', txtSetDestinationMacId.value);
    }, false);

    btnSetDigitalIo.addEventListener("click", function() {
        socket.emit('client_set_digital_io', txtSetDigitalIoMacId.value, txtSetDigitalIoPin.value, txtSetDigitalIoPinState.value);
    }, false);

    btnGetGatewayRadioMacIdInfo.addEventListener("click", function() {
        socket.emit('client_get_gateway_radio_mac_id_info');
    }, false);

    btnGetGatewayRadioSerialLinkDestinationMacIdInfo.addEventListener("click", function() {
        socket.emit('client_get_gateway_radio_serial_link_destination_mac_id_info');
    }, false);

    btnGetRemoteRadioDios.addEventListener("click", function() {
        socket.emit('client_get_remote_radio_dios', txtRemoteRadioMacId.value);
    }, false);

    btnDoNodeDiscover.addEventListener("click", function() {
        socket.emit('client_do_node_discover');
    }, false);

    btnGetGatewayRadioDios.addEventListener("click", function() {
        socket.emit('client_get_gateway_radio_dios');
    }, false);

}


//
// TODO -- on serial connected -- enable buttons
//


// https://stackoverflow.com/questions/11653237/socket-io-failed-to-load-resource

var origin = window.location.origin;
var socket = io.connect(origin + '/gateway');

// https://stackoverflow.com/questions/41924713/node-js-socket-io-page-refresh-multiple-connections
//
//var socket = io.connect(origin, {transports: ['websocket'], upgrade: false});

socket.on('connected', function(){
  connection.innerHTML += "Socket Connected";
  socket.emit('join', 'Client emit: client socket.on(connected) reply to server connected msg via socket.on(connected) fnc');
});
socket.on('disconnect', function(){
  connection.innerHTML = "Socket Disconnected";
});
socket.on('data', function (data) {
  statuslog.innerHTML = statuslog.innerHTML + data;
  statuslog.scrollTop = statuslog.scrollHeight;
});
socket.on('connect', function(data) {
  connection.innerHTML += "<br>socket.on('connect') [next: emit join to server]<br>" + socket.id + "<br>";
  socket.emit('join', 'Client emit: client socket.on(connect) fcn fired'); // may not go through?
});

// TODO -- this belongs in gateway page only socket work:
socket.on('macids', function(data) {
  macIds.innerHTML = data;
  $(macIds).show();
});

