var Filter = require('./filter.js');
var squel = require('squel');
var config = require('../config')

var allowed_filters={ 'managing_body':simple_filter,  'instrument_type':simple_filter, 'industry':simple_filter, 'currency' : simple_filter, 'rating':simple_filter,  'instrument_sub_type': simple_filter,  'report_year':simple_filter, 'report_qurater':simple_filter};
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

function prepareWheres(select, filter)
{
	var filters=filter['filters'];
	for (var filter in filters)
	{
		if (!filter in allowed_filters)
		{
			// Return error
		}
		allowed_filters[filter](select, filter, filters[filter])
	}
}

/*
 * Add select queries, group by every field which is in allowed_filters and not in filter
 *
 */
function prepareGroupBy(select, filter)
{
	var return_data=[];

	for (var group_field in allowed_filters)
	{
		if (group_field in filter.filters)
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
	return return_data;
}

// Debug
function parseFilter(filter)
{
	var select = squel.select().from(config.table);
	prepareWheres(select, filter);
	select=select.toString();
	return select;
}

function groupBySummaries(filter, callback)
{
	var select = squel.select().from(config.table);
	prepareWheres(select, filter);
	var groups=prepareGroupBy(select, filter);
	var wait=groups.length;

	var db = require('./db.js').open();
	for (var index in groups)
	{
		var group=groups[index];
		group.query=group.query.toString();
		
		db.multiple_queries(group.query, function(group, err,rows){
			group.result=rows;
			if(--wait<=0)
			{
				db.end();
				callback(groups);
			}
		}.bind(this, group));
	}
	
}
exports.groupBySummaries=groupBySummaries;
exports.parseFilter=parseFilter;



