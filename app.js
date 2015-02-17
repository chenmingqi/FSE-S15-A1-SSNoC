var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var app = express();
var models  = require('./models');

//passport login setting
var passport = require('passport')
var session = require( "express-session" );
var LocalStrategy = require('passport-local').Strategy;

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
        
        //create a new user
        models.User.create({
            username: username,
            password: password,
            status: 1
        }).then(function(new_user) {
              done(null, new_user);
            });   

      } else if (password != user.password) {
        done(null, false, { message: 'Invalid password'});
      } else {
        done(null, user);
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

app.use('/', routes);

/*Socket.io backend */
var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', function(socket){
  socket.on('chat message', function(data){
    io.emit('chat message', data);
  });

  //check connected clients
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
