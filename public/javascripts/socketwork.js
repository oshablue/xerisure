var connection;
var statuslog;

var btnSetDestinationMacId;
var txtSetDestinationMacId;

var btnSetDigitalIo;
var btnGetDigitalIo;
var txtSetDigitalIoMacId;
var txtSetDigitalIoPin;
var txtSetDigitalIoPinState;

var btnGetGatewayRadioMacIdInfo;
var btnGetGatewayRadioSerialLinkDestinationMacIdInfo;
var btnGetGatewayRadioDios;
var btnDoNodeDiscover;
var btnStoreNdRadiosInDb;
var btnGetDbRadioMacIds;
var btnPopDbRadioMacIds;
var btnGetRemoteRadioDios
var txtRemoteRadioMacId;

var btnReconnectSocket;

var divMacIds;
var divMacIdsFromDb;
var divGetDioPinState;

var selPinCycleDurationMinutesSel;
var txtPinCycleDurationMinutesTxt;
var btnTimedPinCycle;

// NOTE: Intentional explicit function setup, with non-DRY code for clarity (presumed...)

window.onload = function () {
    connection = document.getElementById('connection');
    statuslog = document.getElementById('statuslog');
    divMacIds = document.getElementById('macIds');
    divMacIdsFromDb = document.getElementById('macIdsFromDb');
    divGetDioPinState = document.getElementById('getDioPinState');

    btnSetDestinationMacId = document.getElementById('setDestinationRadioMacIdInputBtn');
    txtSetDestinationMacId = document.getElementById('setDestinationRadioMacIdInputTxt');

    btnSetDigitalIo = document.getElementById('setDigitalIoByApiInputBtn');
    btnGetDigitalIo = document.getElementById('getDigitalIoByApiInputBtn');
    txtSetDigitalIoMacId = document.getElementById('setDigitalIoByApiMacIdInputTxt');
    txtSetDigitalIoPin = document.getElementById('setDigitalIoByApiPinNumberInputTxt');
    txtSetDigitalIoPinState = document.getElementById('setDigitalIoByApiPinStateInputTxt');

    btnGetGatewayRadioMacIdInfo = document.getElementById('getGatewayRadioMacIdInfo');
    btnGetGatewayRadioSerialLinkDestinationMacIdInfo =
        document.getElementById('getGatewayRadioSerialLinkDestinationMacIdInfo');
    btnGetDbRadioMacIds = document.getElementById('getDbRadioMacIds');
    btnPopDbRadioMacIds = document.getElementById('popDbRadioMacIds');

    btnGetGatewayRadioDios = document.getElementById('getGatewayRadioDios');
    btnDoNodeDiscover = document.getElementById('doNodeDiscover');
    btnStoreNdRadiosInDb =  document.getElementById('storeNdRadiosInDb');

    txtRemoteRadioMacId = document.getElementById('remoteRadioMacIdInputTxt');
    btnGetRemoteRadioDios = document.getElementById('getRemoteRadioDios');

    btnReconnectSocket = document.getElementById('reconnectSocketBtn');

    selPinCycleDurationMinutesSel = document.getElementById('pinCycleDurationMinutesSel');
    txtPinCycleDurationMinutesTxt = document.getElementById('pinCycleDurationMinutesTxt');
    btnTimedPinCycle = document.getElementById('timedPinCycleBtn');

    // TODO DRY ... eventually ...
    btnSetDestinationMacId.addEventListener("click", function() {
        socket.emit('client_set_destination_mac_id', txtSetDestinationMacId.value);
    }, false);

    btnSetDigitalIo.addEventListener("click", function() {
      //console.log("set_digital_io" +  txtSetDigitalIoMacId.value, txtSetDigitalIoPin.value, txtSetDigitalIoPinState.value);
      socket.emit('client_set_digital_io', txtSetDigitalIoMacId.value, txtSetDigitalIoPin.value, txtSetDigitalIoPinState.value);
    }, false);

    btnGetDigitalIo.addEventListener("click", function() {
      socket.emit('client_get_digital_io', txtSetDigitalIoMacId.value, txtSetDigitalIoPin.value);
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

    btnGetDbRadioMacIds.addEventListener("click", function() {
        socket.emit('client_get_db_radio_mac_ids');
    }, false);

    btnPopDbRadioMacIds.addEventListener("click", function() {
        socket.emit('client_pop_db_radio_mac_ids');
    }, false);

    selPinCycleDurationMinutesSel.addEventListener("click", function() {
      pinCycleDurationMinutesFcn();
    }, false);

    btnTimedPinCycle.addEventListener("click", function() {
      if ( txtPinCycleDurationMinutesTxt.value < 0 ) {
        socket.emit('client_set_digital_io', txtSetDigitalIoMacId.value, txtSetDigitalIoPin.value, txtSetDigitalIoPinState.value);
      } else if ( txtPinCycleDurationMinutesTxt.value >= 0 ) {
        socket.emit('client_set_digital_io_with_timed_reset',
          txtSetDigitalIoMacId.value, txtSetDigitalIoPin.value, txtSetDigitalIoPinState.value, txtPinCycleDurationMinutesTxt.value);
      } else {
        console.log("socketwork.js: btnTimedPinCycle txt input value not < 0 or >= 0"); }
    })

    btnReconnectSocket.addEventListener("click", function() {
        $.get('/ping', function () {
        });
        //$.get('/gateway', function () {
        //});
        console.log("Trying reconnect to socket...");

        console.log("Before");
        console.log(socket);
        socket.close();
        socket.connect(); // only for socket IO < 2
        console.log("After:");
        console.log(socket);
    }, false);

    // TODO this is obivously bad for production:
    btnStoreNdRadiosInDb.addEventListener("click", function(e) {
      //var sel = document.getElementById('macIdsSelSel').innerHTML;
      //console.log(sel); // will go to browser console
      var sel = document.getElementById('macIdsSelSel');
      var i;
      var res = [];
      var mac;
      var nameraw, name;
      for ( i=0; i < sel.length; i++) {
        mac = sel.options[i].value;
        nameraw = sel.options[i].text;
        name = nameraw.match(/\([\w\d\s]*\)/);
        if (name) {
          name = name[0].replace(/^\(/, "").replace(/\)$/, "");
        } else {
          name = nameraw || "";
        }
        if ( mac != -1 ) {
          res.push({
            "mac" : mac,
            "name" : name,
            "description" : ""
          });
        }
      }
      //console.log(res);
      socket.emit('client_store_nd_radios_in_db', res);
    }, false);

}


//
// TODO -- on serial connected -- enable buttons
//


// https://stackoverflow.com/questions/11653237/socket-io-failed-to-load-resource

var origin = window.location.origin;
//var socket = io();
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
socket.on('macidssel', function(data) {
  macIdsSel.innerHTML = data;
  $(macIdsSel).show();
});
socket.on('macIdsFromDb', function(data) {
  divMacIdsFromDb.innerHTML = data;
  $(macIdsFromDb).show();
});
socket.on('getDioPinState', function(data) {
  divGetDioPinState.innerHTML = data;
  $(getDioPinState).show();
  $(getDioPinState).css('background-color','green');
  setTimeout(function(){
    $(getDioPinState).css('background-color','white'); // TODO really need comparison for green/red etc as this builds out
  }, 2000);
});
