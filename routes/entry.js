var Filter = require('../core/filter.js');
var DAL = require('../core/dal.js');
var DataNormalizer = require('../core/data_normalizer.js');
var metaTable = require('../common/MetaTable').getMetaTable();




exports.show = function(req, res){

  //var filterParams = new Array();
  
  var filter = Filter.fromGetRequest(req);
  
  //for(var key in filter) {
  //  var value = filterParams[key];
  //  qs += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
  // }

  
  DAL.groupBySummaries(filter,
    function(groups){
	
		groups = DataNormalizer.normalizeData(groups);
		total = DataNormalizer.convertNumberToWords(groups['total_sum']);
		//res.write(JSON.stringify(e));
	    // TBD : change to not 1. 	
		var render = true; //for debugging
		if (render)
		res.render('entry',{
	        entry: { title: "מופקדים בקופות הגמל", total_value: JSON.stringify(filter) },
	        filter: filter,
	        total: total,
	        groups: groups,
	        req: req	
      	});
		else res.end();
    }
  );
  
};
