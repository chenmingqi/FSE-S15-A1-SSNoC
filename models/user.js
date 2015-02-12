var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('fse.db');

function User() {

  this.logout = function(username) {
    var status = "off";
    var stmt = db.prepare("UPDATE userInfo SET status=? where username=?");
    stmt.run(status,username);
    stmt.finalize();

    db.each("SELECT * FROM userInfo", function(err, row) {
        console.log(row.username + ", " + row.password + ", " + row.status);
      });
  }

  this.login = function(res, username, password, confirm) {
    var status = "on";

    if (username.length < 3) {
      res.render('index', {message: 'Username is too short'});
      return;
    }

    if (confirm != password) {
      res.render('index', {message: 'Two passwords entered are not equal'});
      return;
    }

    db.get("SELECT * from userInfo where username=?", username,function(err,row){
      if(err) {
        res.render('login', {message: 'Failure to authenticate'});
        return;
      }

      if(!row) {
        var stmt = db.prepare("INSERT INTO userInfo VALUES(?,?,?)");
        stmt.run(username,password,status);
        stmt.finalize();
      }
      else {
        if(row.password != password) {
          res.render('login', {message: 'Wrong password!'})
        }
      }

      var stmt = db.prepare("UPDATE userInfo SET status=? where username=?");
      stmt.run(status,username);
      stmt.finalize();

      db.each("SELECT * FROM userInfo", function(err, row) {
          console.log(row.username + ", " + row.password + ", " + row.status);
        });

      res.render('home', {name: username});
    });
  }
}

module.exports = User;
