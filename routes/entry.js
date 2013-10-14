var Filter = require('../core/filter.js');
var DAL = require('../core/dal.js');
var DataNormalizer = require('../core/data_normalizer.js');
var metaTable = require('../common/MetaTable').getMetaTable();




exports.show = function(req, res){

  
  var filter = Filter.fromGetRequest(req);

  
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
