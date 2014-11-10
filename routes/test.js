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
	var filter=Filter.fromPostRequest(req);


	var start1 = new Date();
	DAL.groupBySummaries(filter,
							function(err, groups){ 
								var groupBySummariesTime = new Date() - start1;
								groups = DataNormalizer.normalizeData(groups);
								var dataNormalizerTime = new Date() - start1 - groupBySummariesTime;
								groups['groupBySummariesTime'] = groupBySummariesTime;
								groups['dataNormalizerTime'] = dataNormalizerTime;
								
								res.end(JSON.stringify(groups));
							});
}

exports.get = function(req, res){

	
	var filter = Filter.fromGetRequest(req);

	
	var start1 = new Date();
	res.contentType('json');
	DAL.groupBySummaries(filter,
							function(err, groups){ 
								var response = {};
								response['timing'] = {};

								var groupBySummariesTime = new Date() - start1;
								//groups = DataNormalizer.normalizeData(groups);
								var dataNormalizerTime = new Date() - start1 - groupBySummariesTime;
								response['timing']['groupBySummariesTime'] = groupBySummariesTime;
								response['timing']['dataNormalizerTime'] = dataNormalizerTime;
								response['groups'] = groups;
								res.json(response);
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