var dialogue;
var box;
window.onload = function () {
    dialogue = document.getElementById('dialogue');
    box = document.getElementById('angle');
}

// https://stackoverflow.com/questions/11653237/socket-io-failed-to-load-resource

var origin = window.location.origin;
var socket = io.connect(origin);

socket.on('connected', function(){
  dialogue.innerHTML = "Socket Connected";
});
socket.on('disconnect', function(){
  dialogue.innerHTML = "Socket Disconnected";
});
socket.on('data', function (data) {
  box.innerHTML = box.innerHTML + data;
  angle = data;
});
socket.on('connect', function(data) {
  socket.emit('join', 'Hello from client connect function');
});
