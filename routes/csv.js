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

  DAL.streamQuery(filter,
    function(err, stream){
		
    	if (err != undefined || !_.isObject(stream)){
			res.end(); 
    	}


		res.writeHead(200, {
			'Content-Type': 'text/csv; charset=utf8',
			'Content-Disposition' : 'attachment; filename="pension.csv"'
		});


		var isFirstLine = true; 
		stream.on('data',function(data){

			if (isFirstLine){
				isFirstLine = false;

				//write column headers csv
				var cols = Object.keys(data); 
				var line = cols.join(",") + "\n";
				res.write(line);
			}

			//write columns header line
			res.write(_.values(data).join(",")+"\n")
			// console.log(_.values(data).join(",")+"\n")
		});

		stream.on('end',function(){

			res.end();
		});

	
	}
	
  );
};