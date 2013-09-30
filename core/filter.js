/*
 * A Data Structure that describes the query to the database:
 *  example:
 *  { 
 *    "constraints":
 *      {
 *       "report_year": [ {"data":"2012"}, {"data":"2013"}],
 *       "managing_body": [{"data":"migdal"}, {"data":"fenix"}]
 *      }
 *  }
 *
 *
 */

var Filter = function(){
    this.constraints = {};


	this.addConstraint = function (field, value){
	    if (!this.constraints.hasOwnProperty(field)){
	      this.constraints[field] = [];       
	    }

		this.constraints[field].push({"data": value }) ;    
	   
	}


	this.removeConstraint = function (field, value){
	    if (!this.constraints.hasOwnProperty(field)){
	    	return;
	    }

	    for (var fieldIndex in this.constraints[field]){
	    	if(this.constraints[field][fieldIndex]["data"] == value){
	       		this.constraints[field].splice(fieldIndex,1);
	    	}
	    }
	  
	}
    
    //returns an array of the fields applied in filter
    //example : filter.getConstrainedFields();
    //returns : [ 'report_year', 'managing_body' ]
	this.getConstrainedFields = function(){
		return Object.keys(this.constraints);
	}	

	//returns array of the constraint data applied to field
	//example : filter.getConstraint("report_year");
	//returns : [ { data: '2012' }, { data: '2013' } ]
	this.getConstraint = function(field){
	    if (this.constraints.hasOwnProperty(field)){
			return this.constraints[field];
		}
		
		return [];
	}

	//returns array of data applied to filter
	//example : filter.getConstraintData("report_year");
	//returns : [ '2012', '2013' ]
	this.getConstraintData = function(field){

		var values = [];

	    if (this.constraints.hasOwnProperty(field)){
			values = Object.keys(this.constraints[field]).map(function (key) {
   		 				return this.constraints[field][key]['data'];
					},this);
	    }
	
		return values;
	}

	this.toString = function(){

		var str = "{\"constraints\":{"; //begin object, begin constraints
		var filter_index = 0;		
		for (constraint in this.constraints){ // each constraint in constraints
			str += "\"" + constraint + "\"";
			str += ":["; //begin data array
			for(data_index in this.constraints[constraint]){ // data_index of data array
				str += "{\"data\":";
				str += "\"" + this.constraints[constraint][data_index]['data'] + "\"";
				str += "}";
				if (data_index < this.constraints[constraint].length-1){ // dont add after last
					str += ",";
				}
			}

			str += "]"; //end data array
			if (filter_index < Object.keys(this.constraints).length-1){ //dont add after last
					str += ",";
			}
			filter_index++;

		}
		str += "}"; // end filters
		str += "}"; // end object
		return str;
	}
}


Filter.fromPostRequest = function(req){

	var filter = new Filter();

	if (req.body.constraints != null)
		filter.constraints = req.body.constraints;
	
	return filter;
};

Filter.fromGetRequest = function(req){

	var filter = new Filter();
	var query = req.query;

	//build filter from query string
	for( var field in query){
		query[field] = [].concat( query[field] );
		for (var index in query[field]){
			filter.addConstraint(field, query[field][index]);
		}
	}

	return filter;
};

module.exports = Filter;