var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('fse.db');

function User() {

  this.logout = function(username, callback) {
    var status = "off";
    var stmt = db.prepare("UPDATE userInfo SET status=? where username=?");
    stmt.run(status,username);
    stmt.finalize();

    db.each("SELECT * FROM userInfo", function(err, row) {
        console.log(row.username + ", " + row.password + ", " + row.status);
      });

    process.nextTick(function(){
      callback();
    });
  }

  this.login = function(username, password, confirm, callback) {
    var status = "on";
    var result = {};

    if (username.length < 3) {
      result = {page: 'index', message: 'Username is too short'};
      process.nextTick(function(){
        callback(result);
      });
    }
    else if (confirm != password) {
      result =  {page: 'index', message: 'Two passwords entered are not equal'};
      process.nextTick(function(){
        callback(result);
      });
    }
    else {
      db.get("SELECT * from userInfo where username=?", username,function(err,row){
        if(err) {
          result =  {page: 'index', message: 'Log in fails'};
        }
        else {
          if(!row) {
            var stmt = db.prepare("INSERT INTO userInfo VALUES(?,?,?)");
            stmt.run(username,password,status);
            stmt.finalize();
            result = {page: 'home', username: username};
          }
          else if(row.password != password) {
            result =  {page: 'login', message: 'Wrong password'};
          }
          else {
            var stmt = db.prepare("UPDATE userInfo SET status=? where username=?");
            stmt.run(status,username);
            stmt.finalize();

            db.each("SELECT * FROM userInfo", function(err, row) {
                console.log(row.username + ", " + row.password + ", " + row.status);
              });

            result = {page: 'home', username: username};
          }
        }

        process.nextTick(function(){
          callback(result);
        });

      });
    }

  }
}

module.exports = User;
