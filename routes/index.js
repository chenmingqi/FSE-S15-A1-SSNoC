var express = require('express');
var router = express.Router();
var User = require('../models/user');
var user = new User();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { message: 'Welcome to Survivable Social Network on a Chip' });
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/logout/:username', function(req, res) {
  var username = req.params.username;
  user.logout(username, function() {
    res.render('index', {message: "You successfully log out!"});
  });
});


router.post('/login', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var confirm = req.body.confirm;

  user.login(username,password,confirm, function(result) {
    if(result.message) {
      res.render(result.page, {message: result.message});
    }
    else {
      res.render(result.page, {name: result.username});
    }
  });
});



module.exports = router;
