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
        //console.log(announcement);
        //res.end('ok');
        console.log(announcement.content);
        console.log(announcement.User.username);
        //res.end(announcement.content);
        res.render('home',{user:user,message:message,announcement:announcement});
      });
  });

  /*
  models.Announcement.find().then(function (announcement) {
    console.log("New: " +  announcement);
    res.end('ok');
    //res.render('home',{user:user,message:null,announcement:announcement});
  });
  */

  /*
	models.Message.findAll({include:[ models.User ]}).then(function (message){
    models.Announcement.find({order: ['id']}).then(function (announcement) {
      console.log("New: " +  announcement.context);
      res.render('home',{user:user,message:message,announcement:announcement});
    });
	});*/
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

module.exports = router;
