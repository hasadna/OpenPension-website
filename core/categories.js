
var Categories = function(){

}

Categories.all_categories = [
                              'managing_body', 
                              'activity_industry', 
                              'currency', 
                              'rating',
                              'issuer',
                              'fund_name',
                              'reference_index',
                              'liquidity',
                              'asset_type',
                              'instrument_name'
                            ];

/* Get categories by filter */
Categories.getCategories = function(filter){

  //clone all_categories
  var resArray = Categories.all_categories.slice(0); 
  
  var liquidity = filter.getConstraintData('liquidity')[0];
  var asset_type = filter.getConstraintData('asset_type')[0];
  var group_by = filter.getConstraintData('group_by')[0];

  //decode uri component 
  liquidity = decodeURIComponent(liquidity);
  asset_type = decodeURIComponent(asset_type);
  group_by = decodeURIComponent(group_by);

  //if managing body is not in constraints remove fund_name
  if (!filter.hasConstraint("managing_body")){
    delete resArray[resArray.indexOf("fund_name")];
  }

  //filter contains reference index
  if (filter.hasConstraint("reference_index")){
    delete resArray[resArray.indexOf("activity_industry")];
    delete resArray[resArray.indexOf("rating")];
  }

  //filter contains rating
  if (filter.hasConstraint("rating")){
    delete resArray[resArray.indexOf("activity_industry")];
    delete resArray[resArray.indexOf("issuer")];
    delete resArray[resArray.indexOf("reference_index")];
  }


  //by liquidity
  if (liquidity == "מזומנים"){
    delete resArray[resArray.indexOf("activity_industry")];
    delete resArray[resArray.indexOf("reference_index")];
    delete resArray[resArray.indexOf("fund_name")];
    delete resArray[resArray.indexOf("asset_type")];
  }    

  //filter contains asset type
  if (filter.hasConstraint("asset_type")){
    if (asset_type == "תעודות סל"){
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
 * get categories by filter which are not in filter constraints
 */
Categories.getAvailableCategories = function(filter){

  var categoriesBySubType = this.getCategories(filter);
  var availableCategories = [];

  //iterate over categories by filter
  for(categoryIndex in categoriesBySubType ){
    var category = categoriesBySubType[categoryIndex];
    //category is already in filter constraints, continue   
    if(filter.hasConstraint(category)){ 
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
