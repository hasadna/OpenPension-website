var Promise = require('bluebird');
var MemcacheDummy = function(){

};

MemcacheDummy.get = function(key,callback){

	return new Promise(function(resolve, reject){
		resolve(null);
	});

	callback && callback(null,undefined);
};

MemcacheDummy.set = function(key,val){
	return new Promise(function(resolve, reject){
		resolve(null);
	});
};

MemcacheDummy.flush = function(key,val){
	return new Promise(function(resolve, reject){
		resolve(null);
	});
};

module.exports = MemcacheDummy;
