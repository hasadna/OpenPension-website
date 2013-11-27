
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
                      'selection' : ['instrument_sub_type=מניות'],
                      'categories' :
                        [
                        'activity_industry',
                        'issuer',
                        'instrument_name'
                        ]
                      },
                      {
                      'selection' : ['instrument_sub_type=אג"ח%20ממשלתי'],    
                      'categories' : 
                        [
                        ]
                      },
                      {
                      'selection' : ['instrument_sub_type=אג"ח קונצרני'],    
                      'categories' : 
                        [
                        'rating', 
                        'activity_industry', 
                        'issuer',
                        'instrument_id'
                        ]
                      },
                      {
                      'selection' : ['instrument_sub_type=תעודות סל'],    
                      'categories' : 
                        [
                        'reference_index',
                        'issuer'
                        ]
                      },
                      {
                      'selection' : ['instrument_sub_type=חו"ל'],    
                      'categories' : 
                        [
                        'activity_industry'
                        ]
                      },
                      {
                      'selection' : ['instrument_sub_type=נגזרים'],    
                      'categories' : 
                        [
                        ]
                      },
                      {
                      'selection': ['instrument_sub_type=כתבי%20אופציה'],
                      'categories' : [
                        'currency', 
                        'industry', 
                        'instrument_id'
                        ]
                      },
                      {
                      'selection' : ['instrument_sub_type=תעודות%20התחייבות%20ממשלתיות'],
                      'categories' : [
                        'instrument_id',
                        'rating', 
                        'currency'
                        ]
                      }
                    ] ;

/* Get categories by filter */
Categories.getCategories = function(filter){
  
  var decodedURI = decodeURI(filter.toQueryString());

  var resArray = [];

  for(category_index in Categories.all_categories){

    var category = Categories.all_categories[category_index];
    
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

  var pos_of_max = resArray.indexOf(Math.max.apply(Math, resArray));
  return Categories.all_categories[pos_of_max]['categories'];
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
