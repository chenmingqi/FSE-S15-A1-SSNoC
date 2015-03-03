var should = require('should');
var assert = require('assert');
var request = require('supertest');
var models  = require('../models');

describe('User', function() {
  it('New users should be created without error', function(done) {
    models.User.create({
        username: 'Guest',
        password: 'Guest',
        share: 'U',
        status: 1
    }).then(function(user) {
      user.should.have.property('username','Guest');
      user.should.have.property('password','Guest');
      user.should.have.property('share','U');
      user.should.have.property('status', true);
      done();
    });
  });

  it('Userlist should be fetched without error', function(done) {
    models.User.findAll().then(function(messages) {
      done();
    });
  });
});

describe('Message', function() {
  it('New messages should be created without error', function(done) {
    models.Message.create({content: 'New message.'}).then(function(message) {
      message.should.have.property('content', 'New message.');
      done();
    });
  })

  it('Message List shoud be fetched without error', function(done) {
    models.Message.findAll().then(function(messages) {
      done();
    });
  })
})


describe('Announcement', function() {
  it('New announcements should be created without error', function(done) {
    models.Announcement.create({content: 'New announcement.'}).then(function(announcement) {
      announcement.should.have.property('content', 'New announcement.');
      done();
    });
  })

  it('Announcement List shoud be fetched without error', function(done) {
    models.Announcement.findAll().then(function(Announcements) {
      done();
    });
  })
})
