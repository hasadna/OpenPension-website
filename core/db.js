var pg = require('pg');
var config = require('../config')
var db = {};

db.pg = function() {
  this.client = new pg.Client(config.connection_string);
  this.client.connect();
};

db.pg.prototype = {
  querys: function(sql,callback) {
    var self = this;
    this.client.query(sql, function(err, result) {
      if(err) {
        callback(err);
        return;
      }

      callback(null, result.rows);

      self.client.end();
    });

  },
  multiple_queries: function(sql,callback) {
    this.client.query(sql, function(err, result) {
      if(err) {
        callback(err);
        return;
      }

      callback(null, result.rows);
    });

  },
  end: function(sql,callback) {
	this.client.end();
  }

};

exports.open = function() {
    return new db.pg();
};
