var pg = require('pg');
var memjs = require('memjs')
var config = require('../config')
var md5 = require('MD5');
var QueryStream = require('pg-query-stream')
var Promise = require('bluebird');

var pgp = require('pg-promise')({
    promiseLib: Promise
});
var db = pgp(config.connection_string);

if (config.use_memcache === false) {
    mc = require('./MemcacheDummy');
}
else {
    mc = memjs.Client.create()
}

/**
 * Query DB, or get from memcache if already present
 *
 * @param sql - SQL query
 * @param callback - callback function that with params (err, rows)
 * @param bypassMemcache - boolean, if true, ignore memcache
 */

exports.query = function (sql, callback, bypassMemcache) {
    
    //look for query result in cache
    mc.get(md5(sql), function (err, val) {
        if (val == undefined || bypassMemcache === true) { // query not found in cache
            db.query(sql)
                .then(function (data) {
                    if (bypassMemcache !== true) {
                        mc.set(md5(sql), JSON.stringify(data));
                    }
                    if (callback != undefined) {
                        callback(null, data);
                    }
                })
                .catch(function (error) {
                    if (callback != undefined) {
                        callback(error);
                    }
                });
        }
        else {//query found in cache
            val = JSON.parse(val.toString());
            if (callback != undefined) {
                callback(null, val);
            }
        }
    });
};

/**
 * Query DB, or get from memcache if already present
 *
 * @param sql - SQL query
 * @param callback - callback function that with params (err, rows)
 * @param bypassMemcache - boolean, if true, ignore memcache
 */

exports.queryp = function (sql, bypassMemcache) {

    //look for query result in cache
    mc.get(md5(sql), function (err, val) {

        if (val == undefined || bypassMemcache === true) { // query not found in cache

            return pgp.query(sql).then(function (result) {
                    if (bypassMemcache !== true) {
                        mc.set(md5(sql), JSON.stringify(result.rows));
                    }

                    return result.rows;
                })
                .catch(function (err) {
                    console.log(err);
                })
        }
        else {//query found in cache
            val = JSON.parse(val.toString());
            return val;
        }
    });
};


/**
 * Query DB, return results on stream
 *
 * @param sql - SQL query
 * @return Promise that resolves to stream
 */
exports.streamQuery = function (sql) {

    return new Promise(function (resolve, reject) {
        pg.connect(config.connection_string,
            function (err, client, done) {

                if (err) {
                    return reject(err);
                }

                var query = new QueryStream(sql)
                var stream = client.query(query)

                //release the client when the stream is finished
                stream.on('end', done);

                return resolve(stream);

            });
    });
}

exports.memcache = mc;
