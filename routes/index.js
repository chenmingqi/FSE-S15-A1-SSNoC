var models  = require('../models');
var express = require('express');
var router  = express.Router();

router.get('/', function(req, res) {
    res.render('index', {});
});

router.get('/home',function(req,res){
	var user = req.session.passport.user;
	res.render('home',{user:user});
});

module.exports = router;
