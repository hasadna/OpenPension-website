var pg = require('pg');
var Promise = require('bluebird');
var qMemcached = require('memcache-promise');
var config = require('../config')
var md5 = require('MD5');
var QueryStream = require('pg-query-stream')

var pgp = require('pg-promise')({
    promiseLib: Promise
});
var dbp = pgp(config.connection_string);

if (config.use_memcache === false) {
    mc = Promise.promisifyAll(require('./MemcacheDummy'));
}
else {
    mc = new qMemcached("localhost:11211");
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
            dbp.query(sql)
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
 * Promise for Query DB, or get from memcache if already present
 *
 * @param sql - SQL query
 * @param bypassMemcache - boolean, if true, ignore memcache
 * @return Promise - resolves to query result
 */

exports.queryp = function (sql, bypassMemcache) {

    //look for query result in cache
    return mc.get(md5(sql))
	.then(function(val) {
        if (val == undefined || bypassMemcache === true) { // query not found in cache
            return dbp.query(sql).then(
				function (data) {
					//console.log(bypassMemcache)
                    if (bypassMemcache !== true) {
                        mc.set(md5(sql), JSON.stringify(data), 60 * 24 * 365);
                    }
                    return data;
                })
                .catch(function (err) {
                    console.log(err);
                });
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
