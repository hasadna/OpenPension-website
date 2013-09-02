
var Filter = function(){
    this.filters = {};


	this.addFilter = function (field, value){
	    if (!this.filters.hasOwnProperty(field)){
	      this.filters[field] = [];       
	    }

		this.filters[field].push({"data": value }) ;    
	   
	}
    
    //returns an array of the fields applied in filter
    //example : filter.getFields();
    //returns : [ 'report_year', 'managing_body' ]
	this.getFields = function(){
		return Object.keys(this.filters);
	}

	//returns array of the filter data applied to field
	//example : filter.getFilter("report_year");
	//returns : [ { data: '2012' }, { data: '2013' } ]
	this.getFilter = function(field){
		return this.filters[field];
	}

	//returns array of data applied to filter
	//example : filter.getFilterData("report_year");
	//returns : [ '2012', '2013' ]
	this.getFilterData = function(field){
		var values = Object.keys(this.filters[field]).map(function (key) {
   		 		return this.filters[field][key]['data'];
		},this);
		return values;
	}

	this.toString = function(){

		var str = "{\"filters\":{"; //begin object, begin filters
		var filter_index = 0;		
		for (filter in this.filters){ // each filter in filters
			str += "\"" + filter + "\"";
			str += ":["; //begin data array
			for(data_index in this.filters[filter]){ // data_index of data array
				str += "{\"data\":";
				str += "\"" + this.filters[filter][data_index]['data'] + "\"";
				str += "}";
				if (data_index < this.filters[filter].length-1){ // dont add after last
					str += ",";
				}
			}

			str += "]"; //end data array
			if (filter_index < Object.keys(this.filters).length-1){ //dont add after last
					str += ",";
			}
			filter_index++;

		}
		str += "}"; // end filters
		str += "}"; // end object
		return str;
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