var pg = require('pg');
var memjs = require('memjs') 
var config = require('../config')
var md5 = require('MD5');
var QueryStream = require('pg-query-stream')
var JSONStream = require('JSONStream')



if (config.use_memcache === false){
  mc = require('./MemcacheDummy');
}
else{
  mc = memjs.Client.create()
}

/**
 * Query DB, or get from memcache if already present  
 *
 * @param sql - SQL query 
 * @param callback - callback function that with params (err, rows)
 * @param bypassMemcache - boolean, if true, ignore memcache 
 */

exports.query =  function(sql, callback, bypassMemcache){

      //look for query result in cache
      mc.get(md5(sql), function(err,val) {

          if (val == undefined || bypassMemcache === true ){ // query not found in cache

              pg.connect(config.connection_string,        
                  function(err, client, done){

                     client.query(sql, function(err, result) {

                        done();

                        if(err) {
                            if (callback != undefined){
                              callback(err);
                            }
                            return;
                        }

                        if (bypassMemcache !== true){
                          mc.set(md5(sql),JSON.stringify(result.rows));
                        }

                        if (callback != undefined){
                          callback(null, result.rows);
                        }
                   });
              });
          }
          else {//query found in cache
              val = JSON.parse(val.toString());
              if (callback != undefined){
                callback(null, val);
              }
          }
      });
  };

/**
 * Query DB, return results on stream
 *
 * @param sql - SQL query 
 * @param callback - callback function that with params (err, stream)
 */
exports.streamQuery = function(sql, callback){

    pg.connect(config.connection_string,
      function(err, client, done) {
  
        if(err) throw err;
    
        var query = new QueryStream(sql)
        var stream = client.query(query)
        
        //release the client when the stream is finished
        stream.on('end', done)
        callback(err, stream);
   
    })
}


exports.memcache = mc;