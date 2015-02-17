var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var app = express();

//passport settings
var passport = require('passport');
var session = require( "express-session" );

app.use(session({secret: 'mingqi', 
                 saveUninitialized: true,
                 resave: true}));
app.use(passport.initialize());

var crypto = require('crypto');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('fse.db');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require("./models/models");
passport.use(new LocalStrategy(
  function(username, password, done) {
    console.log("LocalStrategy");
    User.find({ where: { username: username }})
      .success(function(user) {
        if (!user) {
          console.log("No such user, create a new one");
          var user = User.create({ username: username, password: password });
          // User.findAll().success(function(result) {
          //   console.log("here");
          //   console.log("returned result : "+result);
          //   for( var u in result ){
          //     console.log(u);
          //   }
          // })
          var result = User.findAll();
          for(var u in result){
            console.log("a user's username "+u);
          }
          done(null, user);
        } else if (password != user.password) {
          console.log("Invalid password");
          done(null, false, { message: 'Invalid password'});
        } else {
          console.log("done");
          done(null, user);
        }
      }).error(function(err){
        console.log("err");
        done(err);
      });
  }
));

// //this make the req.user.id available
// passport.serializeUser(function(user, done) {
//   console.log("serializeUser "+user.username);
//   return done(null, user);
// });

// passport.deserializeUser(function(user, done) {
//   console.log("deserializeUser "+id);
//   db.get('SELECT id, username FROM users WHERE id = ?', id, function(err, row) {
//     if (!row) return done(null, false);
//     return done(null, row);
//   });
// });

passport.serializeUser(function(user, done) {
  console.log("serializeUser "+user.username);
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  db.User.find({where: {id: id}}).success(function(user){
    done(null, user);
  }).error(function(err){
    done(err, null);
  });
});

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

app.use('/', routes);


/*Socket.io backend */
var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', function(socket){
  socket.on('chat message', function(data){
    io.emit('chat message', data);
  });

  socket.on('update userlist', function(userlist) {
    io.emit('update userlist', userlist);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

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
