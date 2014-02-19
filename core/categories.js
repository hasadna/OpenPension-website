
var Categories = function(){

}

Categories.all_categories = [
                              'managing_body', 
                              'instrument_type', 
                              'activity_industry', 
                              'currency', 
                              'rating',
                              'issuer',
                              'fund_name',
                              'reference_index',
                              'instrument_sub_type',
                              'instrument_name'
                            ];

/* Get categories by filter */
Categories.getCategories = function(filter){

  //clone all_categories
  var resArray = Categories.all_categories.slice(0); 
  
  var constrainedFields = filter.getConstrainedFields();
  var instrument_type = filter.getConstraintData('instrument_type')[0];
  var instrument_sub_type = filter.getConstraintData('instrument_sub_type')[0];
  var group_by = filter.getConstraintData('group_by')[0];

  //by filtered constriants

  //if managing body is not in constraints remove fund_name
  if (constrainedFields.indexOf("managing_body") == -1){
    delete resArray[resArray.indexOf("fund_name")];
  }

  //filter contains reference index
  if (constrainedFields.indexOf("reference_index") > -1){
    delete resArray[resArray.indexOf("activity_industry")];
    delete resArray[resArray.indexOf("rating")];
  }

  //filter contains rating
  if (constrainedFields.indexOf("rating") > -1){
    delete resArray[resArray.indexOf("activity_industry")];
    delete resArray[resArray.indexOf("issuer")];
    delete resArray[resArray.indexOf("reference_index")];
  }

  //by instrument type
  if (instrument_type == "מזומנים"){
    delete resArray[resArray.indexOf("activity_industry")];
    delete resArray[resArray.indexOf("reference_index")];
    delete resArray[resArray.indexOf("fund_name")];
  }    

  //filter contains instrument sub type
  if (constrainedFields.indexOf("instrument_sub_type") > -1){
    if (instrument_sub_type == "תעודות סל"){
      delete resArray[resArray.indexOf("fund_name")];
      delete resArray[resArray.indexOf("rating")];
    }
    else{
      delete resArray[resArray.indexOf("fund_name")];
      delete resArray[resArray.indexOf("reference_index")];
    }
  }


  return resArray;
}

/*
 * get all categories which are not in filter constraints
 */
Categories.getAvailableCategories = function(filter){

  var constrainedFields = filter.getConstrainedFields();
  var categoriesBySubType = this.getCategories(filter);
  var availableCategories = [];

 

  //iterate over categories by filter
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
 * Look for category which is not in filter constraints
 * (first available category)
 */ 
Categories.getNextGroupingCategory = function(filter){

    //TODO: check validity
    var availableCategories = this.getAvailableCategories(filter);
    return availableCategories.shift();
}

if(typeof module != 'undefined')
  module.exports = Categories;
