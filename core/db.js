var pg = require('pg');
var memjs = require('memjs') 
var config = require('../config')
var md5 = require('MD5');



if (config.use_memcache == false){
  mc = require('./MemcacheDummy');
}
else{
  mc = memjs.Client.create()
}



exports.query =  function(sql, callback){

      //look for query result in cache
      mc.get(md5(sql), function(err,val) {

          if (val == undefined){ // query not found in cache

              pg.connect(config.connection_string,        
                  function(err, client, done){

                     client.query(sql, function(err, result) {

                        done();

                        if(err) {
                            callback(err);
                            return;
                        }

                         mc.set(md5(sql),JSON.stringify(result.rows));

                         callback(null, result.rows);
                   });
              });
          }
          else {//query found in cache
              val = JSON.parse(val.toString());
                  callback(null, val);
          }
      });
  };