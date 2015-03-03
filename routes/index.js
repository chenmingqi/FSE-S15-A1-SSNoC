var models  = require('../models');
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
  models.User.find({ where: {id: req.query.id}}).then(function(chat_user) {
      res.render('chat',{login_user:login_user, chat_user:chat_user});
  })

  //console.log(req.query.id);

});

module.exports = router;
