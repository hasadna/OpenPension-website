var _ = require('underscore');
var Filter = require('../core/filter.js');
var DAL = require('../core/dal.js');
var DataNormalizer = require('../core/data_normalizer.js');

//Queries DB by filter and 
//returns filtered rows as csv file
exports.download = function(req, res){

  //create filter from request (search string)
  var filter = Filter.fromGetRequest(req);

  filter.removeField("group_by");
  filter.removeField("report_qurater");
  filter.removeField("report_year");

  DAL.singleQuery(filter,
    function(rows){
		
    	if (!_.isObject(rows)){
			res.end(); 
    	}

		//write column headers csv
		var cols = Object.keys(rows[0]); 
		var line = cols.join(",") + "\n";

		res.writeHead(200, {
			'Content-Type': 'text/csv; charset=utf8',
			'Content-Disposition' : 'attachment; filename="pension.csv"'
		});

		//write columns header line
		res.write(line);

		//write each row
		_.each(rows,function(v,k,l){res.write(_.values(v).join(",")+"\n")})

		res.end();
	}
	
  );
};