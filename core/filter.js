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

	this.setConstraint = function (field, value){

		this.constraints[field] = [{"data": value }] ;    
		   
	}

	this.hasConstraint = function(field){
		return this.constraints.hasOwnProperty(field);
	}

	this.removeConstraint = function (field, value){
	    if (!this.constraints.hasOwnProperty(field)){
	    	return;
	    }

	    for (var fieldIndex in this.constraints[field]){
	    	if(this.constraints[field][fieldIndex]["data"] == value){
	       		this.constraints[field].splice(fieldIndex,1);
	    	}
	    	if(this.constraints[field][fieldIndex] == undefined ){
	    		
	    		delete this.constraints[field];

	    	}
	    }
	  
	}
    

    this.removeField = function (field){
	    if (!this.constraints.hasOwnProperty(field)){
	    	return;
	    }

   		delete this.constraints[field];
	  
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

	this.clone = function(){
		var res = Filter.fromQueryString(this.toQueryString());
		return res;
	}

	this.toQueryString = function(){

		var str = ""; 
		var constraint_index = 0;		
		for (constraint in this.constraints){ // each constraint in constraints
			

			for(data_index in this.constraints[constraint]){ // data_index of data array
			
				if (constraint_index == 0){
					str += "?";
				}
				else{
					str += "&";
				}

				str +=  constraint ;
				str += "=";
				str += encodeURIComponent(this.constraints[constraint][data_index]['data']);

				constraint_index++;
			}


		}
		return str;
	}



	this.toJSON = function(){

		var str = "{\"constraints\":{"; //begin object, begin constraints
		var constraint_index = 0;		
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
			if (constraint_index < Object.keys(this.constraints).length-1){ //dont add after last
					str += ",";
			}
			constraint_index++;

		}
		str += "}"; // end filters
		str += "}"; // end object
		return str;
	}


	this.getDrillDown = function(){

		var constrainedFields = this.getConstrainedFields();
		var drillDown = constrainedFields.filter(
							function(val){
									return (val !="group_by" &&
										val !="report_year" &&
										val !="report_qurater"
								)
							});

		return drillDown;
	}

	this.getDrillDownDepth = function(){

		var constrainedFields = this.getConstrainedFields();
		var drillDown = constrainedFields.filter(
							function(val){
									return (val !="group_by" &&
										val !="report_year" &&
										val !="report_qurater"
								)
							});

		return drillDown.length;				
	}

	this.toString = function(){

		return this.toJSON();
	}


}

var parseQueryString = function(url){
	
    var result = {};
	var searchIndex = url.indexOf("?");

	if (searchIndex == -1 ) return result;

    var sPageURL = url.substring(searchIndex +1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {    	
        var sParameterName = sURLVariables[i].split('=');
        if ( result[sParameterName[0]] == undefined){
        	result[sParameterName[0]] = [];
        }      
        result[sParameterName[0]].push(  sParameterName[1]  );
    }
    return result;
}

Filter.fromJSON = function(json){
	var filter = new Filter();

	json = JSON.parse(json);
	if (json.constraints != null)
		filter.constraints = json.constraints;
	
	return filter;

}


Filter.fromQueryString = function(query){	
	var filter = new Filter();

	if ( query == undefined ){
		query = window.location.search;
	}

	var parsed = parseQueryString(query);
	return Filter.fromParsedQueryString(parsed);

}

Filter.fromParsedQueryString = function(query){
	var filter = new Filter();

	//build filter from query string
	for( var field in query){
		query[field] = [].concat( query[field] );
		for (var index in query[field]){
			
			var decoded;
			try{
				decoded = decodeURIComponent( query[field][index]);
			}
			catch(e){
				decoded = query[field][index];
			}
			filter.addConstraint(field, decoded );
		}
	}

	return filter;

}

Filter.fromPostRequest = function(req){

	var filter = new Filter();

	if (req.body.constraints != null)
		filter = this.fromJSON(req.body);
	
	return filter;
};

Filter.fromGetRequest = function(req){

	var filter = new Filter();
	
	if (req.query != null)
		filter = this.fromParsedQueryString(req.query);
	
	return filter;
};

if(typeof module != 'undefined')
	module.exports = Filter;