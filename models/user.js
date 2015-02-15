var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('fse.db');

var forbidden_list = ['about', 'access', 'account', 'accounts', 'add', 'address', 'adm', 'admin', 'administration', 'adult', 'advertising', 'affiliate', 'affiliates', 'ajax', 'analytics', 'android', 'anon', 'anonymous', 'api', 'app', 'apps', 'archive', 'atom', 'auth', 'authentication', 'avatar', 'backup', 'banner', 'banners', 'bin', 'billing', 'blog', 'blogs', 'board', 'bot', 'bots', 'business', 'chat', 'cache', 'cadastro', 'calendar', 'campaign', 'careers', 'cgi', 'client', 'cliente', 'code', 'comercial', 'compare', 'config', 'connect', 'contact', 'contest', 'create', 'code', 'compras', 'css', 'dashboard', 'data', 'db', 'design', 'delete', 'demo', 'design', 'designer', 'dev', 'devel', 'dir', 'directory', 'doc', 'docs', 'domain', 'download', 'downloads', 'edit', 'editor', 'email', 'forum', 'forums', 'faq', 'favorite', 'feed', 'feedback', 'flog', 'follow', 'file', 'files', 'free', 'ftp', 'gadget', 'gadgets', 'games', 'guest', 'group', 'groups', 'help', 'home', 'homepage', 'host', 'hosting', 'hostname', 'html', 'http', 'httpd', 'https', 'hpg', 'info', 'information', 'image', 'img', 'images', 'imap', 'index', 'invite', 'intranet', 'indice', 'ipad', 'iphone', 'irc', 'java', 'javascript', 'job', 'jobs', 'js', 'knowledgebase', 'log', 'login', 'logs', 'logout', 'list', 'lists', 'mail', 'mail1', 'mail2', 'mail3', 'mail4', 'mail5', 'mailer', 'mailing', 'mx', 'manager', 'marketing', 'master', 'me', 'media', 'message', 'microblog', 'microblogs', 'mine', 'mp3', 'msg', 'msn', 'mysql', 'messenger', 'mob', 'mobile', 'movie', 'movies', 'music', 'musicas', 'my', 'name', 'named', 'net', 'network', 'new', 'news', 'newsletter', 'nick', 'nickname', 'notes', 'noticias', 'ns', 'ns1', 'ns2', 'ns3', 'ns4', 'old', 'online', 'operator', 'order', 'orders', 'page', 'pager', 'pages', 'panel', 'password', 'perl', 'pic', 'pics', 'photo', 'photos', 'photoalbum', 'php', 'plugin', 'plugins', 'pop', 'pop3', 'post', 'postmaster', 'postfix', 'posts', 'profile', 'project', 'projects', 'promo', 'pub', 'public', 'python', 'random', 'register', 'registration', 'root', 'ruby', 'rss', 'sale', 'sales', 'sample', 'samples', 'script', 'scripts', 'secure', 'send', 'service', 'shop', 'sql', 'signup', 'signin', 'search', 'security', 'settings', 'setting', 'setup', 'site', 'sites', 'sitemap', 'smtp', 'soporte', 'ssh', 'stage', 'staging', 'start', 'subscribe', 'subdomain', 'suporte', 'support', 'stat', 'static', 'stats', 'status', 'store', 'stores', 'system', 'tablet', 'tablets', 'tech', 'telnet', 'test', 'test1', 'test2', 'test3', 'teste', 'tests', 'theme', 'themes', 'tmp', 'todo', 'task', 'tasks', 'tools', 'tv', 'talk', 'update', 'upload', 'url', 'user', 'username', 'usuario', 'usage', 'vendas', 'video', 'videos', 'visitor', 'win', 'ww', 'www', 'www1', 'www2', 'www3', 'www4', 'www5', 'www6', 'www7', 'wwww', 'wws', 'wwws', 'web', 'webmail', 'website', 'websites', 'webmaster', 'workshop', 'xxx', 'xpg', 'you', 'yourname', 'yourusername', 'yoursite', 'yourdomain'];
function User() {

  this.getStatus = function(callback) {
    var on = [];
    var off = [];

    db.serialize(function() {
      db.each("SELECT * FROM userInfo where status = \'on\'", function(err, row) {
          on.push(row.username);
        });

      db.each("SELECT * FROM userInfo where status = \'off\'", function(err, row) {
          off.push(row.username);
        });

      db.get("SELECT * from userInfo where username=?", "none",function(err,row){
        process.nextTick(function() {
          callback({on: on.sort(), off: off.sort()});
        })
      });

    });

  }

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

    if(forbidden_list.indexOf(username) != -1) {
      result = {page: 'index', message: 'Please choose another username'};
      process.nextTick(function() {
        callback(result);
      });
    }
    else if (username.length < 3) {
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
