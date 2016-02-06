var _ = require('underscore');
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
	host: 'localhost:9200',
	log: 'trace',
	apiVersion: '2.1'
});

module.exports.searchInIndex = function(type, term, size){

	size = size ? size : 1000;

	return client.search({
			size: size,
			index: 'production',
			type: type,
			body:
			{
				"query": {
					"query_string": {
						"query": "*"+term+"*",
					}
				}
			}
		})
		.then(function(result){
			var result = result.hits.hits;
			result = _.map(result, function(r){return r._source});
			return result;
		});

}
