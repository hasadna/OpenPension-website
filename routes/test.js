var Filter = require('../core/filter.js');
var DAL = require('../core/dal.js');
var DataNormalizer = require('../core/data_normalizer.js');


exports.post = function(req, res)
{
	if (! req.is('json'))
	{
		res.end(require('util').inspect(req.body));
		return;
	}
	var filter=req.body;

	//if received empty object init empty filter
	if (Object.keys(filter).length == 0){ 
		filter = new Filter();
	}

	DAL.groupBySummaries(filter,
							function(groups){ 
								groups = DataNormalizer.normalizeData(groups);
								res.end(JSON.stringify(groups));
							});
}

exports.get = function(req, res){

	var filter = Filter.fromRequest(req);

	res.contentType('json');
	DAL.groupBySummaries(filter,
							function(groups){ 
								groups = DataNormalizer.normalizeData(groups);
								res.end(JSON.stringify(groups));
							});

}


exports.list = function(req, res){
	var json=req.body;
	var db = require('../core/db.js').open();

	console.log(json);

	var query=DAL.parseFilter(json);
	db.querys(query,function(err, rows){
		for (var i = 0; i < rows.length; i++){
			res.write(JSON.stringify(rows[i]));
		}
		res.end();
	});

};