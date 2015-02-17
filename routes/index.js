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
	res.render('home',{user:user});
});

router.get('/logout',function(req,res){
  	req.logout();
  	res.redirect('/');
});

module.exports = router;
