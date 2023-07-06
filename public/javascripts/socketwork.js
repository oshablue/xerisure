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
    
    //$('#storedWateringCircuitsHeaderDiv').text("Content loaded from socketwork.js on window.load()");
    $('#storedWateringCircuitsDiv').text("Content loaded from socketwork.js on window.load()");
    

} // end of window.onload


//
// TODO -- on serial connected -- enable buttons
//


// https://stackoverflow.com/questions/11653237/socket-io-failed-to-load-resource
//
//var origin = window.location.origin;
var socket = io('/gateway');
//var socket = io.connect(origin + '/gateway');

// https://stackoverflow.com/questions/41924713/node-js-socket-io-page-refresh-multiple-connections
//
//var socket = io.connect(origin, {transports: ['websocket'], upgrade: false});

socket.on('connected', function(status){
  connection.innerHTML += "Socket Connected " + status;
  //socket.emit('join', 'Client emit: client socket.on(connected) reply to server connected msg via socket.on(connected) fnc');
  socket.emit('setupSerialPort');
});
socket.on('disconnect', function(){
  connection.innerHTML = "Socket Disconnected";
});
socket.on('data', function (data) {
  statuslog.innerHTML = statuslog.innerHTML + data;
  statuslog.scrollTop = statuslog.scrollHeight;
});
/*socket.on('connect', function(data) {
  connection.innerHTML += "<br>socket.on('connect') [next: emit join to server]<br>" + socket.id + "<br>";
  socket.emit('join', 'Client emit: client socket.on(connect) fcn fired'); // may not go through?
});*/

// TODO -- this belongs in gateway page only socket work:
socket.on('macids', function(data) {
  macIds.innerHTML = data;
  $(macIds).show();
});
socket.on('macidssel', function(data) {   // macIdsSel is a div containing macIdsSelSel the actual select html tag set
  macIdsSel.innerHTML = data;
  $(macIdsSel).show();
  // TODO:
  // Now also we could trigger a click or event to load the watering data as well
  // e.g. on page load 
  // or possibly cookie or somehow stored last selected macid and go back to it
  // $(macIdsSel).click(); // nope
  // This would be like the gateway.pug macIdsSelFcn()
  // To stick to the domain of just this code file:
  var sel = $('select[name="macIdsSelSel"]');
  var inp = $('input[name="setDigitalIoByApiMacIdInputTxt"]');
  var newMac = sel.val();
  inp.val(newMac);
  //testFunction(newMac); // adding to populate eg watering circuits stored
  //console.log(socket);
  socket.emit('client_load_radio_data', newMac);
  // Yeah this function works enough to populate on page load
});
socket.on('macIdsFromDb', function(data) {
  divMacIdsFromDb.innerHTML = data;
  $(macIdsFromDb).show();
});
socket.on('getDioPinStateResult', function(data) {
  divGetDioPinState.innerHTML = data;
  $(getDioPinState).show();
  $(getDioPinState).css('background-color','green');
  setTimeout(function(){
    $(getDioPinState).css('background-color','white'); // TODO really need comparison for green/red etc as this builds out
  }, 2000);
});
socket.on('getDioPinStateResultIndicator', function(data) {
  var div = $();
  
  // $('#storedWateringCircuitsDiv > table').find('td').filter(function() { return $(this).text() == data.pin; }).parent('tr') or .closest("tr")
  // $('#storedWateringCircuitsDiv > table').find(`tr:contains("${data.pin}")`).length

  let table = $('#storedWateringCircuitsDiv > table');
  var indexOfNameColumn = $(table).find(`tr:eq(0)`).find(`th:contains("Name")`).index();
  var indexOfGpioColumn = $(table).find(`tr:eq(0)`).find(`th:contains("GPIO")`).index();

  // TODO swap to 0 compare and return but leave error messages
  var theTd;
  if ( indexOfGpioColumn > -1 ) {
    theTd = $(table).find(`td`).filter( function() { 
      return $(this).text() == data.pin && $(this).index() == indexOfGpioColumn 
    }); //.parent('tr').text()
  }
  var theTdToUpdate;
  if ( $(theTd).is('td') ) {
    theTdToUpdate = $(theTd).parent('tr').find('td').eq(indexOfNameColumn);
    if ( $(theTdToUpdate).is('td') ) {
      $(theTdToUpdate).css('background-color', 'green');
      var s = $(theTdToUpdate).find('span#sCurVal');
      if ( $(s).is('span') ) {
        s.text(data.pinState);
      } else {
        $(theTdToUpdate).append(`<span id="sCurVal">${data.pinState}</span>`);
      }
      setTimeout(function(){
        $(theTdToUpdate).css('background-color','white');
      }, 4000);
    }
  }

});
socket.on('radiodata', function(data) {
	$('#storedWateringCircuitsDiv').html(data);
});
