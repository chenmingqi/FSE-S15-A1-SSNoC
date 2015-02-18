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

router.get('/home',function(req,res){
	var user = req.session.passport.user;

	//get the lastest message
	models.Message.findAll().then(function (message){
		//get all the online and offline users
		models.User.findAll({where: {status: 1}}).then(function (online_users){  
		  models.User.findAll({where:{status:0}}).then(function (offline_users){
		  	res.render('home',{user:user, online_users:online_users, offline_users:offline_users,message:message});
		  });    
		});
	})
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
