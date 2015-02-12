var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('fse.db');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { message: 'Welcome to Survivable Social Network on a Chip' });
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/logout/:username', function(req, res) {
  var username = req.params.username;
  var status = "off";

  var stmt = db.prepare("UPDATE userInfo SET status=? where username=?");
  stmt.run(status,username);
  stmt.finalize();

  db.each("SELECT * FROM userInfo", function(err, row) {
      console.log(row.username + ", " + row.password + ", " + row.status);
    });
  res.render('index', {message: "You successfully log out!"});
});


router.post('/login', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var confirm = req.body.confirm;
  var status = "on";

  //todo: reject reserved names

  if (username.length < 3) {
    res.render('index', {message: 'Username is too short'})
    return
  }

  if (confirm != password) {
    res.render('index', {message: 'Two passwords entered are not equal'})
    return
  }

  db.get("SELECT * from userInfo where username=?", username,function(err,row){
    if(err) { res.render('login', {message: 'Failure to authenticate'})}

    if(!row) {
      var stmt = db.prepare("INSERT INTO userInfo VALUES(?,?,?)");
      stmt.run(username,password,status);
      stmt.finalize();
    }
    else {
      if(row.password != password) { res.render('logout', {message: 'Wrong password!'})}
    }

    var stmt = db.prepare("UPDATE userInfo SET status=? where username=?");
    stmt.run(status,username);
    stmt.finalize();

    db.each("SELECT * FROM userInfo", function(err, row) {
        console.log(row.username + ", " + row.password + ", " + row.status);
      });
    res.render('home', {name: username});
  });

});



module.exports = router;
