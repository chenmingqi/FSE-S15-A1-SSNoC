var models  = require('../models');
var models_test = require('../models_test');
var express = require('express');
var router  = express.Router();
var passport = require('passport');

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

module.exports = router;
