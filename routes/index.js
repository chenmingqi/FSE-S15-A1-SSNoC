var models  = require('../models');
var express = require('express');
var router  = express.Router();
var passport = require('passport');

router.get('/', function(req, res) {
    res.render('index', { message: 'Welcome to Survivable Social Network on a Chip' });
});

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/loginFailure'
  })
);

router.get('/loginFailure', function(req, res) {
    res.render('error', { message: 'loginFailure, you should provide a different username password match.' });
});


router.get('/home',function(req,res){
	var user = req.session.passport.user;

	//get the lastest message
  models.Message.findAll({include:[ models.User ]}).then(function (message){
      models.Announcement.findOne({include:[ models.User ], order: [['id', 'DESC']] }).then(function (announcement) {
        res.render('home',{user:user,message:message,announcement:announcement});
      });
  });
});

router.get('/logout',function(req,res){

  models.User.find({ where: {id: req.session.passport.user.id}}).then(function(logout_user) {
      logout_user.updateAttributes({
        status: 0
      }).then(function() {
        req.logout();
        res.render('logout');
      });
  })

});

router.get('/chat',function(req,res){
  var login_user = req.session.passport.user;
  models.User.find({ where: {username: req.query.user}}).then(function(chat_user) {
      models.PrivateMessage.findAll({where:{receiver: chat_user.username, sender: login_user.username}, include:[ models.User ]}).then(function (privatemessage1){
        models.PrivateMessage.findAll({where:{receiver: login_user.username, sender: chat_user.username}, include:[ models.User ]}).then(function (privatemessage2){
            var message = privatemessage1.concat(privatemessage2);
            message.sort(function(a, b){
              if(a.createdAt < b.createdAt) return -1;
              if(a.createdAt > b.createdAt) return 1;
              return 0;
            });
          res.render('chat',{login_user:login_user, chat_user:chat_user, message: message});
        });
      });
  })
  //console.log(req.query.id);

});

router.get('/search/:type', function(req,res) {
  var type = req.params.type;
  console.log(type);
  res.render('search' + type);
});

router.post('/result/name', function(req,res) {
  var name = req.body.name;
  models.User.findAll({where: ["username like ?", '%' + name + '%']}).then(function(users) {
    if(users.length == 0) {
      res.render('searchcitizen', {message: "No citizens found!"});
    }
    else {
      var online_user = [];
      var offline_user = [];
      for(var i = 0; i < users.length; i++) {
        if(users[i].status) {
          online_user.push(users[i].username);
        }
        else {
          offline_user.push(users[i].username);
        }
      }
      res.render('citizenresult', {online_user:online_user.sort(), offline_user: offline_user.sort()});
    }
  });
});

router.post('/result/status', function(req,res) {
  var status = req.body.status;
  var mapping = {'OK': 'O', 'Help': 'H', 'Emergency': 'E'};
  console.log(mapping[status]);
  if(typeof mapping[status] == "undefined") {
    res.render('searchcitizen', {message: "You provided a wrong status name!"});
  }
  else {
    models.User.findAll({ where: {share: mapping[status]}}).then(function(users) {
      if(users.length == 0) {
        res.render('searchcitizen', {message: "No citizens found!"});
      }
      else {
        var online_user = [];
        var offline_user = [];
        for(var i = 0; i < users.length; i++) {
          if(users[i].status) {
            online_user.push(users[i].username);
          }
          else {
            offline_user.push(users[i].username);
          }
        }
        res.render('citizenresult', {online_user:online_user.sort(), offline_user: offline_user.sort()});
      }
    });
  }
});

var filter = function(words, callback) {
  var forbidden_list = ['about', 'access', 'account', 'accounts', 'add', 'address', 'adm', 'admin', 'administration', 'adult', 'advertising', 'affiliate', 'affiliates', 'ajax', 'analytics', 'android', 'anon', 'anonymous', 'api', 'app', 'apps', 'archive', 'atom', 'auth', 'authentication', 'avatar', 'backup', 'banner', 'banners', 'bin', 'billing', 'blog', 'blogs', 'board', 'bot', 'bots', 'business', 'chat', 'cache', 'cadastro', 'calendar', 'campaign', 'careers', 'cgi', 'client', 'cliente', 'code', 'comercial', 'compare', 'config', 'connect', 'contact', 'contest', 'create', 'code', 'compras', 'css', 'dashboard', 'data', 'db', 'design', 'delete', 'demo', 'design', 'designer', 'dev', 'devel', 'dir', 'directory', 'doc', 'docs', 'domain', 'download', 'downloads', 'edit', 'editor', 'email', 'forum', 'forums', 'faq', 'favorite', 'feed', 'feedback', 'flog', 'follow', 'file', 'files', 'free', 'ftp', 'gadget', 'gadgets', 'games', 'guest', 'group', 'groups', 'help', 'home', 'homepage', 'host', 'hosting', 'hostname', 'html', 'http', 'httpd', 'https', 'hpg', 'info', 'information', 'image', 'img', 'images', 'imap', 'index', 'invite', 'intranet', 'indice', 'ipad', 'iphone', 'irc', 'java', 'javascript', 'job', 'jobs', 'js', 'knowledgebase', 'log', 'login', 'logs', 'logout', 'list', 'lists', 'mail', 'mail1', 'mail2', 'mail3', 'mail4', 'mail5', 'mailer', 'mailing', 'mx', 'manager', 'marketing', 'master', 'me', 'media', 'message', 'microblog', 'microblogs', 'mine', 'mp3', 'msg', 'msn', 'mysql', 'messenger', 'mob', 'mobile', 'movie', 'movies', 'music', 'musicas', 'my', 'name', 'named', 'net', 'network', 'new', 'news', 'newsletter', 'nick', 'nickname', 'notes', 'noticias', 'ns', 'ns1', 'ns2', 'ns3', 'ns4', 'old', 'online', 'operator', 'order', 'orders', 'page', 'pager', 'pages', 'panel', 'password', 'perl', 'pic', 'pics', 'photo', 'photos', 'photoalbum', 'php', 'plugin', 'plugins', 'pop', 'pop3', 'post', 'postmaster', 'postfix', 'posts', 'profile', 'project', 'projects', 'promo', 'pub', 'public', 'python', 'random', 'register', 'registration', 'root', 'ruby', 'rss', 'sale', 'sales', 'sample', 'samples', 'script', 'scripts', 'secure', 'send', 'service', 'shop', 'sql', 'signup', 'signin', 'search', 'security', 'settings', 'setting', 'setup', 'site', 'sites', 'sitemap', 'smtp', 'soporte', 'ssh', 'stage', 'staging', 'start', 'subscribe', 'subdomain', 'suporte', 'support', 'stat', 'static', 'stats', 'status', 'store', 'stores', 'system', 'tablet', 'tablets', 'tech', 'telnet', 'test', 'test1', 'test2', 'test3', 'teste', 'tests', 'theme', 'themes', 'tmp', 'todo', 'task', 'tasks', 'tools', 'tv', 'talk', 'update', 'upload', 'url', 'user', 'username', 'usuario', 'usage', 'vendas', 'video', 'videos', 'visitor', 'win', 'ww', 'www', 'www1', 'www2', 'www3', 'www4', 'www5', 'www6', 'www7', 'wwww', 'wws', 'wwws', 'web', 'webmail', 'website', 'websites', 'webmaster', 'workshop', 'xxx', 'xpg', 'you', 'yourname', 'yourusername', 'yoursite', 'yourdomain'];
  var filtered_words = [];
  for(var i = 0; i < words.length; i++) {
    if(forbidden_list.indexOf(words[i]) == -1) {
      filtered_words.push(words[i]);
    }
  }
  process.nextTick(function() {
      callback(filtered_words);
  });
}

var match = function(messages, words, num, callback) {
  var matched_messages = [];
  for(var i = 0; i < messages.length; i++) {
    if(matched_messages.length == num) {
      break;
    }

    var message_words = messages[i].content.split(/[^a-zA-Z']+/);

    var isMatched = true;
    for(var j = 0; j < words.length; j++) {

      if(message_words.indexOf(words[j]) == -1) {
        isMatched = false;
        break;
      }
    }
    if(isMatched) {
      matched_messages.push(messages[i]);
    }
  }

  process.nextTick(function() {
    callback(matched_messages);
  });
}

router.post('/result/announcement', function(req,res) {
  var words = req.body.words.split(' ');
  var num = 10;
  if(typeof req.body.num != 'undefined') {
    num = parseInt(req.body.num);
  }

  filter(words, function(filtered_words) {
    //console.log(filtered_words);
    if(filtered_words.length == 0) {
      res.render('searchannouncement', {message: 'No announcements found!'})
    }
    else {
      console.log('filtered words: ');
      console.log(filtered_words);

      models.Announcement.findAll({include:[ models.User ]}).then(function (messages){
        match(messages, filtered_words, num, function(matched_messages) {
          if(matched_messages.length == 0) {
            res.render('searchannouncement', {message: 'No announcements found!'})
          }
          else{
            res.render('announcementresult', {announcements: matched_messages})
          }
        })
      });
    }
  });
});

module.exports = router;
