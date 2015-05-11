var MemcacheDummy = function(){

};

MemcacheDummy.get = function(key,callback){
	callback(null,undefined);
};

MemcacheDummy.set = function(key,val){
	return;    
};

MemcacheDummy.flush = function(key,val){
	return;    
};

module.exports = MemcacheDummy;