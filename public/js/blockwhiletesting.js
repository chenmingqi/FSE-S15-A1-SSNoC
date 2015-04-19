$(document).ready(function() {
  var socket = io();
  var blockonce = true;

  // notification
  socket.on('notify client', function(data) {
    var curr_user = $('#username').val();
    if(data[0] instanceof Array) {
      if($.inArray(curr_user, data[0]) != -1) {
        alert(data[1] + " has posted a new feed!");
      }
    }
    else {
      if(curr_user == data[0]) {
        alert(data[1] + " has posted a new feed!");
      }
    }
  });

  //block the system
  socket.on('measure performance', function(data){
    // var username = data[0];
    // var curr_user = $('#username').val();
    // if( username != curr_user ){
      //system become unusable
      if(blockonce == true){
        blockonce = false;
        $.blockUI({ message: '<h1>Some other users are testing the performance of the system, system is unavailable now...</h1>' });
      }
    // }
  });

  //unblock the system
  socket.on('empty test database and get result',function(data){
    // var username = data[1];
    // var curr_user = $('#username').val();
    // if(curr_user != username){
      //unblock the system
      $.unblockUI();
      blockonce = true;
    // }
  });
});
