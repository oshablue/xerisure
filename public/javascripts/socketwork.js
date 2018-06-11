var connection;
var statuslog;

var btnSetDestinationMacId;
var txtSetDestinationMacId;

var btnSetDigitalIo;
var txtSetDigitalIoMacId;
var txtSetDigitalIoPin;
var txtSetDigitalIoPinState;

window.onload = function () {
    connection = document.getElementById('connection');
    statuslog = document.getElementById('statuslog');
    btnSetDestinationMacId = document.getElementById('setDestinationRadioMacIdInputBtn');
    txtSetDestinationMacId = document.getElementById('setDestinationRadioMacIdInputTxt');

    btnSetDigitalIo = document.getElementById('setDigitalIoByApiInputBtn');
    txtSetDigitalIoMacId = document.getElementById('setDigitalIoByApiMacIdInputTxt');
    txtSetDigitalIoPin = document.getElementById('setDigitalIoByApiPinNumberInputTxt');
    txtSetDigitalIoPinState = document.getElementById('setDigitalIoByApiPinStateInputTxt');

    // TODO DRY
    btnSetDestinationMacId.addEventListener("click", function() {
        socket.emit('client_set_destination_mac_id', txtSetDestinationMacId.value);
    }, false);

    btnSetDigitalIo.addEventListener("click", function() {
        socket.emit('client_set_digital_io', txtSetDigitalIoMacId.value, txtSetDigitalIoPin.value, txtSetDigitalIoPinState.value);
    }, false);

}





// https://stackoverflow.com/questions/11653237/socket-io-failed-to-load-resource

var origin = window.location.origin;
var socket = io.connect(origin);

socket.on('connected', function(){
  connection.innerHTML = "Socket Connected";
});
socket.on('disconnect', function(){
  connection.innerHTML = "Socket Disconnected";
});
socket.on('data', function (data) {
  statuslog.innerHTML = statuslog.innerHTML + data;
});
socket.on('connect', function(data) {
  socket.emit('join', 'Hello from client connect function');
});
