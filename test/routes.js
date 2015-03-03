var should = require('should');
var assert = require('assert');
var request = require('supertest');
var models  = require('../models');
var app = require('../app');
var url = 'http://localhost:3000';

describe('Homepage', function() {
  it('should not report error when browsing homepage', function(done) {
    request(url)
    .get('/')
    .expect(200, done);
  })
})
