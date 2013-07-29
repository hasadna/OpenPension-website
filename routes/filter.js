
var Filter = function(){
    this.filters = {};

	this.addFilter = function (field, value){
	    if (!this.filters.hasOwnProperty(field)){
	      this.filters[field] = [];       
	    }

		this.filters[field].push({"data": value }) ;    
	   
	}
    
	this.toString = function(){
		return JSON.stringify(this);
	}
}

Filter.fromRequest = function(req){

	var filter = new Filter();
	var query = req.query;

	//build filter from query string
	for( var field in query){
		query[field] = [].concat( query[field] );
		for (var index in query[field]){
			filter.addFilter(field, query[field][index]);
		}
	}

	return filter;
};

module.exports = Filter;