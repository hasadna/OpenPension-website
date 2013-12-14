
var Categories = function(){

}

Categories.all_categories = 
                    [
                      {
                      'selection' : [],
                      'categories' : [
                        'managing_body', 
                        'instrument_type', 
                        'activity_industry', 
                        'currency', 
                        'rating', 
                        'issuer',
                        'reference_index',
                        'instrument_sub_type' ,  
                        'instrument_id'
                        ]
                      },
                      {
                      'selection' : ['instrument_type=מזומנים'],
                      'categories' :
                        [
                        'managing_body',
                        'rating',
                        'issuer',
                        'currency',
                        'instrument_id'
                        ]
                      },
                      {
                      'selection' : ['instrument_type=פקדונות'],
                      'categories' :
                        [
                        'managing_body',
                        'rating',
                        'issuer',
                        'currency',
                        'instrument_id'
                        ]
                      },
                      {
                      'selection' : ['managing_body='],
                      'categories' : [
                        'managing_body',
                        'instrument_type', 
                        'activity_industry', 
                        'currency', 
                        'rating', 
                        'issuer',
                        'reference_index',
                        'instrument_sub_type' ,  
                        'instrument_id'
                        ]
                      },
                      {
                      'selection' : ['instrument_type='],
                      'categories' : [
                        'instrument_type',
                        'activity_industry', 
                        'currency', 
                        'rating', 
                        'issuer',
                        'reference_index',
                        'instrument_sub_type' ,  
                        'instrument_id'
                        ]
                      },
                      {
                      'selection' : ['activity_industry='],
                      'categories' : [
                        'activity_industry',
                        'currency', 
                        'rating', 
                        'issuer',
                        'reference_index',
                        'instrument_sub_type' ,  
                        'instrument_id',
                        'instrument_type'
                        ]
                      },
                      {
                      'selection' : ['currency='],
                      'categories' : [
                        'currency',
                        'instrument_type',
                        'activity_industry',
                        'rating', 
                        'issuer',
                        'reference_index',
                        'instrument_sub_type' ,  
                        'instrument_id'
                        ]
                      },
                      {
                      'selection' : ['rating='],
                      'categories' : [
                        'rating',
                        'issuer',
                        'reference_index',
                        'instrument_sub_type',
                        'instrument_id',
                        'instrument_type', 
                        'activity_industry',
                        'reference_index',
                        'instrument_sub_type' ,  
                        'instrument_id'
                        ]
                      },
                      {
                      'selection' : ['issuer='],
                      'categories' : [
                        'issuer',
                        'instrument_type',
                        'currency',
                        'instrument_sub_type',
                        'instrument_id',
                        'managing_body'
                        ]
                      },
                      {
                      'selection' : ['reference_index='],
                      'categories' : [
                        'reference_index',
                        'managing_body',
                        'instrument_type',
                        'currency',
                        'issuer',
                        'instrument_sub_type',
                        'instrument_id'
                        ]
                      },
                      {
                      'selection' : ['instrument_sub_type='],
                      'categories' : [
                        'instrument_sub_type',
                        'managing_body',
                        'instrument_type',
                        'activity_industry',
                        'currency',
                        'rating',
                        'issuer',
                        'reference_index',
                        'instrument_sub_type',
                        'instrument_id'
                        ]
                      },
                      {
                      'selection' : ['instrument_id='],
                      'categories' : [
                        'instrument_id',
                        'managing_body',
                        'instrument_sub_type',
                        'currency',
                        'rating',
                        'issuer',
                        'reference_index',
                        'instrument_sub_type'
                        ]
                      }
                    ] ;

/* Get categories by filter */
Categories.getCategories = function(filter){
  
  var decodedURI = decodeURI(filter.toQueryString());

  var resArray = [];

  for(category_index in Categories.all_categories){

    var category = Categories.all_categories[category_index];
  
    console.log(JSON.stringify(category));

    if( category['selection'].length == 0 ){
        resArray[category_index] = 0;        
    }
    for(selection_index in category['selection']){
      var selection = category['selection'][selection_index];
      if (decodedURI.indexOf(selection) == -1){
        resArray[category_index] = 0;
        continue;
      }
      else{
        resArray[category_index] == undefined ? resArray[category_index] = 1 : resArray[category_index]++;
      }
    }
  }

  console.log(JSON.stringify(resArray));

  var pos_of_max = resArray.indexOf(Math.max.apply(Math, resArray));
  console.log(JSON.stringify(pos_of_max));

  return Categories.all_categories[pos_of_max]['categories'];
}

/*
 * get all categories which are not in filter constraints
 */
Categories.getAvailableCategories = function(filter){

  var constrainedFields = filter.getConstrainedFields();
  var categoriesBySubType = this.getCategories(filter);
  var availableCategories = [];

  console.log("getCategories "+JSON.stringify(categoriesBySubType));


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
