var should = require('should');
var assert = require('assert');
var request = require('supertest');
var models  = require('../models');
var app = require('../app');
var url = 'http://localhost:3000';
var superagent = require('superagent');
var agent = superagent.agent();

describe('Homepage', function() {
  it('should not report error when browsing homepage', function(done) {
    request(url)
    .get('/')
    .expect(200, done);
  });
});


describe('Login', function() {
  it('should log in successfully', function(done) {
    agent
    .post(url + '/login')
    .send({ username: 'Derek', password: 'password' })
    .end(function(err, res) {
      if(err) {
        throw err;
      }
      done();
    });
  });
});
