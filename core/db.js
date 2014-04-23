var pg = require('pg');
var memjs = require('memjs')
var mc = memjs.Client.create()
var config = require('../config')
var md5 = require('MD5');
var db = {};



db.pg = function() {
  this.client = new pg.Client(config.connection_string);
  this.client.connect();
};

db.pg.prototype = {
  querys: function(sql,callback) {

    var self = this;
    //console.log('querys');
    //console.log(md5(sql)); 
    
    mc.get(md5(sql), function(err,val) {

        if (val == undefined || val.toString().indexOf("Error") == 0){ // value not found in cache
          //console.error("miss");
          self.client.query(sql, function(err, result) {
            if(err) {
              callback(err);
              return;
            }

            mc.set(md5(sql),JSON.stringify(result.rows));
            callback(null, result.rows);

            self.client.end();
          });
        }
        else{//value found in cache
          //console.error("hit");
          //console.error(val);
          val = JSON.parse(val.toString());
          callback(null, val);
        }
      });
  },
  multiple_queries: function(sql,callback) {

    var self = this;

    //console.log('multiple_queries');
    //console.log(md5(sql)); 
    
    mc.get(md5(sql), function(err,val) {
      
        if (val == undefined || val.toString().indexOf("Error") == 0){ // value not found in cache
          //console.error("miss");

          self.client.query(sql, function(err, result) {
            if(err) {
              callback(err);
              return;
            }

            //console.log(result.rows);
            //console.log("\n");

            mc.set(md5(sql),JSON.stringify(result.rows));
            callback(null, result.rows);
          });

        }
        else{//value found in cache
          //console.error("hit");
          //console.error(val);
          val = JSON.parse(val.toString());
          callback(null, val);
        }
      });
  
  },
  end: function(sql,callback) {
     this.client.end();
  }

};


exports.open = function() {
    return new db.pg();
};
