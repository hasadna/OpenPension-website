
var Categories = function(){

}

Categories.all_categories = {
                      'default' : 
                        [
                        'managing_body', 
                        'instrument_type', 
                        'industry', 
                        'currency', 
                        'rating', 
                        'instrument_sub_type' ,  
                        'instrument_id'
                        ],    
                      'מניות' : 
                        [
                        'currency', 
                        'industry', 
                        'instrument_id'
                        //'instrument_name'
                        ],
                      'תעודות%20סל' : 
                        [
                        'currency', 
                        'instrument_id',
                        //'instrument_name'
                        //'issuer',
                        //'related madad' 
                        ],
                      'כתבי%20אופציה' :
                        [
                        'currency', 
                        'industry', 
                        'instrument_id'
                        //'instrument_name'
                        //'issuer',
                        ],
                      'תעודות%20התחייבות%20ממשלתיות':
                        [
                        //'instrument_name'
                        'instrument_id',
                        'rating', 
                        'currency'
                        //'issuer',
                        ]
                      };

/* Get categories by filter */

Categories.getCategories = function(instrument_sub_type){
	if (this.all_categories.hasOwnProperty(instrument_sub_type)){
    	return this.all_categories[instrument_sub_type];
    }
    else{
    	return this.all_categories['default'];
    }
}

/*
 * get all categories which are not in filter constraints
 */
Categories.getAvailableCategories = function(instrument_sub_type, filter){

  var constrainedFields = filter.getConstrainedFields();
  var categoriesBySubType = this.getCategories(instrument_sub_type);
  var availableCategories = [];

  //iterate over categories by instrument_sub_type
  for(categoryIndex in categoriesBySubType ){
    var category = categoriesBySubType[categoryIndex];
    //constrained fileds contains category, continue   
    if(constrainedFields.indexOf(category) != -1){ 
      continue;
    }
    else{
      availableCategories.push(category);
    }
  }
  return availableCategories;
}

/*
 * Look for next category which is not in filter constraints
 * (first available category)
 */	
Categories.getGroupingCategory = function(instrument_sub_type, filter){

		//TODO: check validity
  	var availableCategories = this.getAvailableCategories(instrument_sub_type, filter);
		return availableCategories.shift();
}

if(typeof module != 'undefined')
	module.exports = Categories;