var models  = require('../models');
var models_test = require('../models_test');
var express = require('express');
var router  = express.Router();
var passport = require('passport');
var util =require('util');
var sys = require('sys')
var exec = require('child_process').exec;

var path = require('path');     //used for file path
var fs = require('fs-extra');       //File System - for file manipulation


router.get('/', function(req, res) {
    res.render('index', { message: 'Welcome to Survivable Social Network on a Chip' });
});

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/loginFailure'
  })
);

router.get('/loginFailure', function(req, res) {
    res.render('error', { message: 'loginFailure, you should provide a different username password match.' });
});


router.get('/home',function(req,res){
	var user = req.session.passport.user;

	//get the lastest message
  models.Message.findAll({include:[ models.User ]}).then(function (message){
      models.Announcement.findOne({include:[ models.User ], order: [['id', 'DESC']] }).then(function (announcement) {
        res.render('home',{user:user,message:message,announcement:announcement});
      });
  });
});

router.get('/logout',function(req,res){

  models.User.find({ where: {id: req.session.passport.user.id}}).then(function(logout_user) {
      logout_user.updateAttributes({
        status: 0
      }).then(function() {
        req.logout();
        res.render('logout');
      });
  })

});

router.get('/chat',function(req,res){
  var login_user = req.session.passport.user;
  models.User.find({ where: {username: req.query.user}}).then(function(chat_user) {
      models.PrivateMessage.findAll({where:{receiver: chat_user.username, sender: login_user.username}, include:[ models.User ]}).then(function (privatemessage1){
        models.PrivateMessage.findAll({where:{receiver: login_user.username, sender: chat_user.username}, include:[ models.User ]}).then(function (privatemessage2){
            var message = privatemessage1.concat(privatemessage2);
            message.sort(function(a, b){
              if(a.createdAt < b.createdAt) return -1;
              if(a.createdAt > b.createdAt) return 1;
              return 0;
            });
          res.render('chat',{login_user:login_user, chat_user:chat_user, message: message});
        });
      });
  })
  //console.log(req.query.id);

});


//news feed

router.post('/postnewsfeed', function(req,res) {
  var fstream;
  var content;
  var username = req.session.passport.user.username;



  req.pipe(req.busboy);
  req.busboy.on('file', function (fieldname, file, filename) {
      console.log("Uploading: " + filename);
      //Path where image will be uploaded
      filename = (new Date()).toString() + filename;
      fstream = fs.createWriteStream(__dirname + '/../public/uploads/' + filename);
      file.pipe(fstream);
      fstream.on('close', function () {
          console.log("Upload Finished of " + filename);
          process.nextTick(function() {
            models.User.find({where: {username: username}}).then(function(user) {
              models.NewsFeed.create({content: content, filename: filename}).then(function(new_newsfeed) {
                new_newsfeed.setUser(user).then(function() {
                  models.NewsFeed.findAll({include:[ models.User]}).then(function(newsfeeds) {
                    models.PostComment.findAll({include: [models.NewsFeed]}).then(function(comments) {
                      models.User.findAll({where: {status: 1}}).then(function(users){
                        var userlist = [];
                        for(var i = 0; i < users.length; i++) {
                          if(users[i].username != req.session.passport.user.username) {
                            userlist.push(users[i].username);
                          }
                        }
                        res.render('newsfeed', {newsfeeds: newsfeeds, comments: comments, userlist: userlist, username: username});
                      });
                    });
                  });
                });
              });
            });
          });
      });
  });

  req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
    if(key == "words") {
      content = value;
    }
  });
});


router.post('/post/:id', function(req,res) {
    var content = req.body.comment;
    var username = req.session.passport.user.username;
    var id = req.params.id;
    console.log("new comment");

    models.NewsFeed.find({where: {id: id}}).then(function(newsfeed) {
      models.PostComment.create({content: content, username: username}).then(function(new_comment) {
        new_comment.setNewsFeed(newsfeed).then(function() {
          models.NewsFeed.findAll({include: [models.User]}).then(function(newsfeeds) {
            models.PostComment.findAll({include: [models.NewsFeed]}).then(function(comments) {
              models.User.findAll({where: {status: 1}}).then(function(users){
                var userlist = [];
                for(var i = 0; i < users.length; i++) {
                  if(users[i].username != req.session.passport.user.username) {
                    userlist.push(users[i].username);
                  }
                }
                res.render('newsfeed', {newsfeeds: newsfeeds, comments: comments, userlist: userlist, username: username});
              });
            });
          });
        });
      });
    });
});

router.get('/newsfeed', function(req,res) {
  var username = req.session.passport.user.username;
  models.NewsFeed.findAll({include:[ models.User]}).then(function(newsfeeds) {
      models.PostComment.findAll({include: [models.NewsFeed]}).then(function(comments) {
        models.User.findAll({where: {status: 1}}).then(function(users){
          var userlist = [];
          for(var i = 0; i < users.length; i++) {
            if(users[i].username != req.session.passport.user.username) {
              userlist.push(users[i].username);
            }
          }
          res.render('newsfeed', {newsfeeds: newsfeeds, comments: comments, userlist: userlist, username:username});
        });
      });
  });
});


//measure performance
router.get('/measureperformance',function(req,res){
  var login_user = req.session.passport.user;
  //empty test database except User table
  models_test.Message.destroy({ where: {},truncate: true}).then(function(){});
  models_test.Notification.destroy({ where: {},truncate: true}).then(function(){});
  models_test.PrivateMessage.destroy({ where: {},truncate: true}).then(function(){});
  models_test.Announcement.destroy({ where: {},truncate: true}).then(function(){});

  res.render('measureperformance',{login_user:login_user});
});

//measure memory
router.get('/measurememory',function(req,res){
  var login_user = req.session.passport.user;
  res.render('measurememory',{login_user:login_user});

});

router.get('/search/:type', function(req,res) {
  var type = req.params.type;
  res.render('search' + type);
});

router.post('/result/name', function(req,res) {
  var name = req.body.name;
  models.User.findAll({where: ["username like ?", '%' + name + '%']}).then(function(users) {
    if(users.length == 0) {
      res.render('searchcitizen', {message: "No citizens found!"});
    }
    else {
      var online_user = [];
      var offline_user = [];
      for(var i = 0; i < users.length; i++) {
        if(users[i].status) {
          online_user.push(users[i].username);
        }
        else {
          offline_user.push(users[i].username);
        }
      }
      res.render('citizenresult', {online_user:online_user.sort(), offline_user: offline_user.sort()});
    }
  });
});

router.post('/result/status', function(req,res) {
  var status = req.body.status;
  var mapping = {'OK': 'O', 'Help': 'H', 'Emergency': 'E'};
  if(typeof mapping[status] == "undefined") {
    res.render('searchcitizen', {message: "You provided a wrong status name!"});
  }
  else {
    models.User.findAll({ where: {share: mapping[status]}}).then(function(users) {
      if(users.length == 0) {
        res.render('searchcitizen', {message: "No citizens found!"});
      }
      else {
        var online_user = [];
        var offline_user = [];
        for(var i = 0; i < users.length; i++) {
          if(users[i].status) {
            online_user.push(users[i].username);
          }
          else {
            offline_user.push(users[i].username);
          }
        }
        res.render('citizenresult', {online_user:online_user.sort(), offline_user: offline_user.sort()});
      }
    });
  }
});

var filter = function(words, callback) {
  var forbidden_list = ['a', 'able', 'about', 'across', 'after', 'all', 'almost', 'also', 'am', 'among', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'because', 'been', 'but', 'by', 'can', 'cannot', 'could', 'dear', 'did', 'do', 'does', 'either', 'else', 'ever', 'every', 'for', 'from', 'get', 'got', 'had', 'has', 'have', 'he', 'her', 'hers', 'him', 'his', 'how', 'however', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'just', 'least', 'let', 'like', 'likely', 'may', 'me', 'might', 'most', 'must', 'my', 'neither', 'no', 'nor', 'not', 'of', 'off', 'often', 'on', 'only', 'or', 'other', 'our', 'own', 'rather', 'said', 'say', 'says', 'she', 'should', 'since', 'so', 'some', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'tis', 'to', 'too', 'twas', 'us', 'wants', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'would', 'yet', 'you', 'your'];
  var filtered_words = [];
  for(var i = 0; i < words.length; i++) {
    if(forbidden_list.indexOf(words[i]) == -1) {
      filtered_words.push(words[i]);
    }
  }
  process.nextTick(function() {
      callback(filtered_words);
  });
}

var match = function(messages, words, num, callback) {
  var matched_messages = [];
  for(var i = 0; i < messages.length; i++) {
    if(matched_messages.length == num) {
      break;
    }

    var message_words = messages[i].content.split(/[^a-zA-Z']+/);

    var isMatched = true;
    for(var j = 0; j < words.length; j++) {

      if(message_words.indexOf(words[j]) == -1) {
        isMatched = false;
        break;
      }
    }
    if(isMatched) {
      matched_messages.push(messages[i]);
    }
  }

  process.nextTick(function() {
    callback(matched_messages);
  });
}

router.post('/result/primes', function(req, res) {
  var user = req.session.passport.user;
  var words = req.body.words.split(' ');

  if(typeof req.body.num != 'undefined') {
    num = parseInt(req.body.num);
  }

  filter(words, function(filtered_words) {
    //console.log(filtered_words);
    if(filtered_words.length == 0) {
      res.render('searchprimes', {message: 'No messages found!'})
    }
    else {
      models.PrivateMessage.findAll({where:{sender: user.username}}).then(function (messages){
        match(messages, filtered_words, num, function(matched_messages) {
          if(matched_messages.length == 0) {
            res.render('searchprimes', {message: 'No messages found!'})
          }
          else{
            //res.send(matched_messages);
            res.render('primesresult', {messages: matched_messages})
          }
        })
      });
    }
  });
})

router.post('/result/pubmes', function(req, res) {
  var words = req.body.words.split(' ');
  var num = 10;
  if(typeof req.body.num != 'undefined') {
    num = parseInt(req.body.num);
  }

  filter(words, function(filtered_words) {
    //console.log(filtered_words);
    if(filtered_words.length == 0) {
      res.render('searchpubmes', {message: 'No messages found!'})
    }
    else {
      models.Message.findAll({include:[ models.User ]}).then(function (messages){
        match(messages, filtered_words, num, function(matched_messages) {
          if(matched_messages.length == 0) {
            res.render('searchpubmes', {message: 'No messages found!'})
          }
          else{
            res.render('pubmesresult', {messages: matched_messages})
          }
        })
      });
    }
  });
});


router.post('/result/announcement', function(req,res) {
  var words = req.body.words.split(' ');
  var num = 10;
  if(typeof req.body.num != 'undefined') {
    num = parseInt(req.body.num);
  }

  filter(words, function(filtered_words) {
    //console.log(filtered_words);
    if(filtered_words.length == 0) {
      res.render('searchannouncement', {message: 'No announcements found!'})
    }
    else {

      models.Announcement.findAll({include:[ models.User ]}).then(function (messages){
        match(messages, filtered_words, num, function(matched_messages) {
          if(matched_messages.length == 0) {
            res.render('searchannouncement', {message: 'No announcements found!'})
          }
          else{
            res.render('announcementresult', {announcements: matched_messages})
          }
        })
      });
    }
  });
});

// router.get('/mobile',function(req,res){
//   res.render('mobile',{});
// });

module.exports = router;
