var squel = require('squel');

function simple_filter(select, field, params)
{
	var expr=squel.expr();
	var data=[expr];
	
	for (var i in params)
	{
		filter_instance=params[i];
		if ( 'data' in filter_instance)
		{
			//return error
		}
		expr.or(field + '= ?');
		data=data.concat(filter_instance['data']);
	}
	select.where.apply(null,data);
}

function parseJson(json)
{
	var select = squel.select().from('data');
	prepareWheres(select, json);
	select=select.toString();
	console.log(select);
	return select;
}

function prepareWheres(select, json)
{
	var allowed_filters={'rating':simple_filter, 'managing_body':simple_filter, 'instrument_type':simple_filter};
	var filters=json['filters'];
	for (var filter in filters)
	{
		if (!filter in allowed_filters)
		{
			// Return error
		}
		allowed_filters[filter](select, filter, filters[filter])
	}
}

function prepareGroupBy()
{
}

exports.list = function(req, res){
	var json=req.body;
	var db = require('../db.js').open();

	console.log(json);

	var query=parseJson(json);
	db.querys(query,function(err, rows){
		for (var i = 0; i < rows.length; i++){
			//console.log(rows[i]);
			res.write(JSON.stringify(rows[i]));
		}
		res.end();
	});

};
