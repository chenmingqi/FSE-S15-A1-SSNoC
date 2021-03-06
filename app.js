//app
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var app = express();
var models  = require('./models');
var models_test  = require('./models_test');

//passport login setting
var passport = require('passport')
var session = require( "express-session" );
var LocalStrategy = require('passport-local').Strategy;

var busboy = require('connect-busboy'); //middleware for form/file upload


app.use(session({secret: 'mingqi',
                 saveUninitialized: true,
                 resave: true}));
app.use(passport.initialize());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(id, done) {
  models.User.find({where: {id: id}}).success(function(user){
    done(null, user);
  }).error(function(err){
    done(err, null);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {

    models.User.find({ where: { username: username }}).then(function(user) {
      if (!user) {

        //create test user
        models_test.User.create({
            username: username,
            password: password,
            privilege: "Citizen",
            share: 'U',
            status: 1,
            active: 1
        }).then(function(){});

        //create a new user
        models.User.create({
            username: username,
            password: password,
            privilege: "Citizen",
            share: 'U',
            status: 1,
            active: 1
        }).then(function(new_user) {
              done(null, new_user);
            });



      } else if (password != user.password) {
        done(null, false, { message: 'Invalid password'});
      } else if(user.active == 0){
        done(null, false, { message: 'Account inactive'});
      } else {
        //update user status
        models.User.find({where:{username:username, password:password}}).then(function(login_user){
          login_user.updateAttributes({status: 1}).then(function() {
              done(null, user);
          });
        });
      }
    })
  }
));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(busboy());

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
