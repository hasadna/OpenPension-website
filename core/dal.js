var Filter = require('./filter.js');
var squel = require('squel');
var config = require('../config')

var allowed_filters={ 'managing_body':simple_filter,  'instrument_type':simple_filter, 'industry':simple_filter, 'currency' : simple_filter, 'rating':simple_filter,  'instrument_sub_type': simple_filter,  'report_year':simple_filter, 'report_qurater':simple_filter,  'instrument_id':simple_filter};
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
	var constraints=filter['constraints'];
	for (var constraint in constraints)
	{
		if (!(constraint in allowed_filters))
		{
			continue;
			// Return error? this skips group_by
		}
		var data = constraints[constraint];
		simple_filter(select, constraint, data);
	}
}

/*
 * Creates select queries, 
 * if filter contains "group_by" field, then group by filter configuration.
 * else group by every field which is in allowed_filters and not in filter
 *
 * sum queries by summary_columns
 */
function prepareGroupBy(select, filter)
{
	var return_data=[];

	var all_groups;
	var groups_in_filter = filter.getConstraintData("group_by");

	if (groups_in_filter.length > 0){

		all_groups = groups_in_filter;
	}
	else{
		all_groups = Object.keys(allowed_filters);
	}


	for (var group_index in all_groups)
	{

		if (all_groups[group_index] in filter.constraints)
			continue;
		var new_select=select.clone(); //Deep copy
		
		new_select.group(all_groups[group_index]);
		new_select.field(all_groups[group_index]);
		for (var idx in summary_columns)
		{
			col=summary_columns[idx];
			new_select.field('sum('+col+')','sum_'+col);
		}
		return_data.push({"group_field":all_groups[group_index],"query":new_select})
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

function singleQuery(filter, callback)
{
	var db = require('./db.js').open();
	var query = parseFilter(filter);
	
	db.querys(query,function(err, rows){
			callback(rows);
	});
}


function groupBySummaries(filter, callback)
{
	var select = squel.select().from(config.table);
	prepareWheres(select, filter);
	var groups=prepareGroupBy(select, filter);
	var wait=groups.length;
	if (wait == 0)
		return;

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

//exports
exports.groupBySummaries=groupBySummaries;
exports.parseFilter=parseFilter;
exports.allowed_filters=Object.keys(allowed_filters);
exports.singleQuery=singleQuery;

