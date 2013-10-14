var Filter = require('../core/filter.js');
var DAL = require('../core/dal.js');
var DataNormalizer = require('../core/data_normalizer.js');
var metaTable = require('../common/MetaTable').getMetaTable();





var all_categories = {
                      'default' : 
                        [
                        'managing_body', 
                        'instrument_type', 
                        'industry', 
                        'currency', 
                        'rating', 
                        'instrument_sub_type' , 
                        'report_year', 
                        'report_qurater',  
                        'instrument_id'
                        ]
                      };



/*
 * Look for a category which is not in filter constraints
 */
function getGroupingCategory(instrument_id, filter){

  var constrainedFields = filter.getConstrainedFields();

  //iterate over categories
  for(categoryIndex in all_categories[instrument_id]){
    var category = all_categories[instrument_id][categoryIndex];
    //if category equals constrained fields
    //OR 
    //constrained fields is array AND
    //constrained fileds contains category    
    if( category == constrainedFields ||  
      Object.prototype.toString.call( constrainedFields ) === '[object Array]' && 
      constrainedFields.indexOf(category) != -1){ 
      continue;
    }
    else{
      return all_categories[instrument_id][categoryIndex];
    }
  }

}


exports.show = function(req, res){

  
  var filter = Filter.fromGetRequest(req);

  var group_by = getGroupingCategory("default",filter);

  if(typeof group_by == "undefined"){
    filter.removeField("group_by");
  }
  else{
    filter.setConstraint("group_by",group_by);
  }

  DAL.groupBySummaries(filter,
    function(groups){
	
		groups = DataNormalizer.normalizeData(groups);
		total = DataNormalizer.convertNumberToWords(groups['total_sum']);

		res.render('entry',{
	        entry: { title: "מופקדים בקופות הגמל", total_value: JSON.stringify(filter) },
	        filter: filter,
	        total: total,
	        groups: groups,
	        req: req	
      	});
    }
  );
  
};
