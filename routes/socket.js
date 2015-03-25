
var models  = require('../models');
var models_test = require('../models_test');
var util =require('util');
var sys = require('sys')
var exec = require('child_process').exec;

module.exports = function(io) {
  io.on('connection', function(socket){

    //share status
    socket.on('update status', function(data) {
      models.User.find({where:{username:data[0]}}).then(function(user){
        user.updateAttributes({share: data[1]}).then(function() {
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

    //real time private chat
    socket.on('privatechat', function(data){
      models.User.find({where: {username: data[0]}}).then(function(login_user) {
        models.PrivateMessage.create({content: data[2], sender: data[0], receiver:data[1]}).then(function(new_message) {
          new_message.setUser(login_user).then(function() {
              //then send the new message to the frontend
              var timestamp = new_message.createdAt.toString();
              io.emit('privatechat', [data[0], data[1], data[2], timestamp]);
          });
        });
      });
    });

    //private chat notification
    socket.on('privatechat_notification', function(data){
      var sender = data[0];
      var receiver = data[1];
      io.emit('privatechat_notification', [sender, receiver]);
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

    //measure performance 
    socket.on('measure performance', function(data){
      //store the chat message into database
      models_test.User.find({where: {username: data[0]}}).then(function(user) {
          models_test.Message.create({content: data[1]}).then(function(new_message) {
            new_message.setUser(user).then(function() {
                //then send the new message to the frontend
                var timestamp = new_message.createdAt.toString();
                io.emit('measure performance', [data[0], data[1], timestamp]);
            });
          });
      });
    });

    //empty test database
    socket.on('empty test database and get result', function(username){
      var message_num = 0;
      models_test.Message.findAll().then(function(data){
        message_num = data.length;
        models_test.Message.destroy({ where: {},truncate: true}).then(function(){
          io.emit('empty test database and get result',[message_num,username]);
        }); 
      });
    });

    //measure memory
    socket.on('measure memory', function(data){
      // console.log(util.inspect(process.memoryUsage()));
      var child = exec("df -l", function (error, stdout, stderr) {
        //split stdout, 11, 12, 13
        var split_result = stdout.split(/ +/);
        // console.log("512-blocks:   "+split_result[11]);
        // console.log("Used:   "+split_result[12]);
        // console.log("Available:   "+split_result[13]);

        //get non-volatile memory
        var diskTotal = split_result[11];
        var diskUsed = split_result[12];
        if (error !== null) {
          console.log('exec error: ' + error);
        }
        
        //get volatile memory
        var heapTotal = util.inspect(process.memoryUsage().heapTotal);
        var heapUsed = util.inspect(process.memoryUsage().heapUsed);
        var timestamp = new Date();
        var username = data;
        io.emit('measure memory',[username,timestamp,heapTotal,heapUsed,diskTotal,diskUsed]);
      });

    });


  });
}
