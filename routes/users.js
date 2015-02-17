var models  = require('../models');
var express = require('express');
var router  = express.Router();
var passport = require('passport');

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/loginFailure'
  })
);

module.exports = router;
