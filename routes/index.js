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
    user.getStatus(function(userlist) {
      res.render('index', {message: "You successfully log out!", on: JSON.stringify(userlist.on), off: JSON.stringify(userlist.off) });
    });
  });
});


// router.post('/login', function(req, res) {
//   var username = req.body.username;
//   var password = req.body.password;
//   var confirm = req.body.confirm;

//   user.login(username,password,confirm, function(result) {
//     if(result.message) {
//       res.render(result.page, {message: result.message});
//     }
//     else {
//       user.getStatus(function(userlist) {
//         res.render(result.page, {name: result.username, on: JSON.stringify(userlist.on), off: JSON.stringify(userlist.off)} );
//       });
//     }

//   });
// });


//passport login
var crypto = require('crypto');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('fse.db');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;

router.use(passport.initialize());
router.use(passport.session());

// function hashPassword(password, salt) {
//   var hash = crypto.createHash('sha256');
//   hash.update(password);
//   hash.update(salt);
//   return hash.digest('hex');
// }
passport.use(new LocalStrategy(function(username, password, done) {
  db.get('SELECT salt FROM users WHERE username = ?', username, function(err, row) {
    console.log(username);
    console.log(password);
    if (!row) return done(null, false);
    // var hash = hashPassword(password, row.salt);
    db.get('SELECT username, id FROM users WHERE username = ? AND password = ?', username, password, function(err, row) {
      if (!row) return done(null, false);
      return done(null, row);
    });
  });
}));

passport.serializeUser(function(user, done) {
  return done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  db.get('SELECT id, username FROM users WHERE id = ?', id, function(err, row) {
    if (!row) return done(null, false);
    return done(null, row);
  });
});

router.post('/passport_login',
  passport.authenticate('local', {
    successRedirect: '/loginSuccess',
    failureRedirect: '/loginFailure'
  })
);


module.exports = router;
