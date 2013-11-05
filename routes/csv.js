var Filter = require('../core/filter.js');
var DAL = require('../core/dal.js');
var DataNormalizer = require('../core/data_normalizer.js');

//Queries DB by filter and 
//returns filtered rows as csv file
exports.download = function(req, res){

  //create filter from request (search string)
  var filter = Filter.fromGetRequest(req);

  filter.removeField("group_by");

  DAL.singleQuery(filter,
    function(rows){
		
		//write column headers csv
		var cols = Object.keys(rows[0]); 
		cols.shift(); //discard 'id'
        var line = cols.join(",") + "\n";

		for (var i = 0; i < rows.length; i++){
			var j = 0; 
			for(; j < cols.length - 1; j++){	
				if (rows[i][cols[j]] != null)
					line += rows[i][cols[j]];

				line += ",";
			}
			line += rows[i][cols[j]] ;
			line += "\n";
		}

  		res.setHeader('Content-disposition', 'attachment; filename=op.csv');   
    	res.writeHead(200, {
        	'Content-Type': 'text/csv'
	    });
		res.write(line);
	
		res.end();    
	}
	
  ); 
};
