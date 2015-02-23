
var models  = require('../models');

module.exports = function(io) {
  io.on('connection', function(socket){

    //share status
    socket.on('share status', function(data) {
      console.log('get status for ' + data[0] + ": " + data[1]);
    });

    //announcement
    socket.on('announce', function(data){
    //store the announcement into database
    models.User.find({where: {username: data[0]}}).then(function(user) {
      models.Announcement.create({content: data[1]}).then(function(new_announcement) {
        new_announcement.setUser(user).then(function() {
          var timestamp = new_announcement.createdAt.toString();
          io.emit('announce', [data[0], data[1], timestamp]);
        });
      });
    });
    });

    //real time chat
    socket.on('chat message', function(data){
    //store the chat message into database
    models.User.find({where: {username: data[0]}}).then(function(user) {
        models.Message.create({content: data[1]}).then(function(new_message) {
          new_message.setUser(user).then(function() {
              //then send the new message to the frontend
              var timestamp = new_message.createdAt.toString();
              io.emit('chat message', [data[0], data[1], timestamp]);
          });
        });
      });
    });
    //check connected clients
    socket.on('update userlist', function(userlist) {
      models.User.findAll({where:{status:1}}).then(function(online_users) {
        models.User.findAll({where:{status:0}}).then(function(offline_users){
            online_users.sort(function(a, b){
              if(a.username < b.username) return -1;
              if(a.username > b.username) return 1;
              return 0;
            });
            offline_users.sort(function(a, b){
              if(a.username < b.username) return -1;
              if(a.username > b.username) return 1;
              return 0;
            });
            var current_userlist = new Array(online_users,offline_users);
            io.emit('update userlist', current_userlist);
        });
      });
    });
  });
}
