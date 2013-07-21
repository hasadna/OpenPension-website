var squel = require('squel');

var allowed_filters={'rating':simple_filter, 'managing_body':simple_filter, 'instrument_type':simple_filter, 'instrument_sub_type': simple_filter};
var all_columns={"market_cap":"Market Cap","rating":"Rating","managing_body":"Managing Body","instrument_type":"Instrument Type", "instrument_sub_type": "instrument sub type"};
var summary_columns=["market_cap","fair_value"];

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

function prepareWheres(select, json)
{
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

function prepareGroupBy(select, json)
{
	var return_data=[];

	for (var group_field in all_columns)
	{
		if (group_field in json.filters)
			continue;
		var new_select=select.clone(); //Deep copy
		new_select.group(group_field);
		new_select.field(group_field);
		for (var idx in summary_columns)
		{
			col=summary_columns[idx];
			new_select.field('sum('+col+')','sum_'+col);
		}
		return_data.push({"group_field":group_field,"query":new_select})
	}
	return return_data
}

// Debug
function parseJson(json)
{
	var select = squel.select().from('data');
	prepareWheres(select, json);
	select=select.toString();
	return select;
}

function groupBySummaries(filter_spec,callback)
{
	var select = squel.select().from('data');
	prepareWheres(select, filter_spec);
	var groups=prepareGroupBy(select, filter_spec);
	var wait=groups.length;

	var db = require('../db.js').open();
		
	for (var index in groups)
	{
		var group=groups[index];
		group.query=group.query.toString();
		
		db.multiple_queries(group.query, function(group, err,rows){
			group.result=rows;
			if(--wait<=0)
			{
				db.end();
				callback(JSON.stringify(groups));
			}
		}.bind(this, group));
	}
	
}
exports.groupBySummaries=groupBySummaries;
exports.post = function(req, res)
{
	if (! req.is('json'))
	{
		res.end(require('util').inspect(req.body));
		return;
	}
	var json=req.body;
	groupBySummaries(json,res.end);
}

exports.list = function(req, res){
	var json=req.body;
	var db = require('../db.js').open();

	console.log(json);

	var query=parseJson(json);
	db.querys(query,function(err, rows){
		for (var i = 0; i < rows.length; i++){
			res.write(JSON.stringify(rows[i]));
		}
		res.end();
	});

};

