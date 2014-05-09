    
var Groups = function(){

}

Groups.common_groups = [
                              'issuer',
                              'activity_industry', 
                              'currency', 
                              'liquidity',
                              'asset_type',
                              'fund_name',
                              'instrument_name'
                            ];

/* Get Groups by filter */
Groups.getGroups = function(filter){

  //clone all_categories
  var resArray = Groups.common_groups.slice(0); 
  
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


  //filter contains issuer
  if (filter.hasConstraint("issuer")){
    delete resArray[resArray.indexOf("activity_industry")];
  }

  //by instrument type
  if (liquidity == "מזומנים"){
    delete resArray[resArray.indexOf("activity_industry")];
    delete resArray[resArray.indexOf("reference_index")];
    delete resArray[resArray.indexOf("fund_name")];
    delete resArray[resArray.indexOf("asset_type")];
  }    

  //filter contains 
  if (filter.hasConstraint("asset_type")){
    if (asset_type == "תעודות סל"){
      delete resArray[resArray.indexOf("fund_name")];
      delete resArray[resArray.indexOf("rating")];
      resArray.push("reference_index");
    }
    else{
      delete resArray[resArray.indexOf("fund_name")];
      delete resArray[resArray.indexOf("reference_index")];
      resArray.push("rating");
    }
  }


  return resArray;

}

/*
 * get groups by filter which are not in filter constraints
 */
Groups.getAvailableGroups = function(filter){

  var categoriesBySubType = this.getGroups(filter);
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
Groups.getNextGroupingCategory = function(filter){

    //TODO: check validity
    var availableCategories = this.getAvailableCategories(filter);
    return availableCategories.shift();
}

if(typeof module != 'undefined')
  module.exports = Groups;
