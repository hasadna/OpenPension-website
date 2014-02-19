var Filter = require('./filter.js');
var squel = require('squel');
var config = require('../config')

var allowed_filters={ 
	'managing_body':simple_filter, 
	'instrument_type':simple_filter, 
	//'industry':simple_filter, 
	'currency' : simple_filter, 
	'rating':simple_filter, 
	'instrument_sub_type': simple_filter, 
	'report_year':simple_filter, 
	'report_qurater':simple_filter, 
	'instrument_id':simple_filter,
	//EXT FIELDS
	'issuer':simple_filter,
	'instrument_name':simple_filter,
	'activity_industry':simple_filter,
	//'industry':simple_filter,
	'reference_index':simple_filter,
	'fund_name' : simple_filter
};
var summary_columns=["market_cap","fair_value"];

/**
 * Escape single qoutes ' => ''
 * for SQL query
 * @param str: String to be escaped
 */
function escapeChars(str){
    return String(str).replace(/'/g, '\'\'');  
}

/**
 * Appends WHERE clause to squel select object
 * for specific field and data
 *
 * @param select: squel query
 * @param constraintField: a field in filter, 'managing_body'
 * @param constraintDataArr: the filter of constraintField,
 *         [ { data: 'migdal' }, { data: 'harel' } ]
 * 
 */
function simple_filter(select, constraintField, constraintDataArr)
{
	var expr=squel.expr();
	var values=[expr];

	// go over array of constratint data
	for (var i in constraintDataArr)
	{
		constraintData = constraintDataArr[i];
		
		expr.or(constraintField + '= ?');

		//escape string
		var escapedConstraintData = escapeChars(constraintData['data']);
		values=values.concat(escapedConstraintData);
	}
	select.where.apply(null,values);
}

/**
 * Appends the WHERE clause to squel select object
 * according to the constraints in the filter
 * @param select: squel query
 * @param filter: filter object
 *
 */
function prepareWheres(select, filter)
{
	var constrainedFields = filter.getConstrainedFields();
	for (var index in constrainedFields)
	{
		var constraintField = constrainedFields[index];
		if (!(constraintField in allowed_filters))
		{
			continue;
			// Return error? no, this skips group_by
			// which is not in allowed filters
		}

		var constraintDataArr = filter.getConstraint(constraintField);
		simple_filter(select, constraintField, constraintDataArr);
	}
}

/**
 * Create multiple select queries by groups
 * one query for each group.
 * if filter contains "group_by" field, then group by groups in filter.
 * else group by every field which is in allowed_filters and not in filter.
 *
 * adds sum queries by summary_columns
 * @param select: Squel select, is duplicated for each select group
 * @param filter: Filter object with constraints
 * @returns [Squel]: array of Squel select objects 
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
		// group_sum as sum of summary columns
		new_select.field('sum('+(summary_columns.join('+')+')'), 'group_sum' );

		return_data.push({"group_field":all_groups[group_index],"query":new_select})
	}
	return return_data;
}

/**
 * Convert Filter object to SQL Query
 * @param filter : Filter object
 * @return string : SQL query
 */
function parseFilter(filter)
{
	var select = squel.select().from(config.table);
	prepareWheres(select, filter);
	select=select.toString();
	return select;
}

/**
 * Perform query and pass result rows
 * to callback function
 * @param filter: Filter object with constraints
 * @param callback : function to handle result rows
 */
function singleQuery(filter, callback)
{
	var db = require('./db.js').open();
	var sqlQuery = parseFilter(filter);
	
	db.querys(sqlQuery,function(err, rows){
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


/*
 * group by managing body, if managing body is in the filter
 * and by last four quarters
 */

function groupByManagingBody(filter, callback){
	
  var mFilter = new Filter();

  if (filter.getConstraintData("managing_body") != "") {
	mFilter.addConstraint("managing_body", filter.getConstraintData("managing_body"));
  } 

  groupByQuarters(mFilter, callback);

}


/*
 * Query by filter constraint, group by last four quarters
 * pass result rows to callback function
 */
function groupByQuarters(filter, callback){

	var mFilter = filter.clone();
	
	mFilter.removeField("group_by");
	mFilter.removeField("report_year");
	mFilter.removeField("report_qurater");
	
	var select = squel.select().from(config.table);
	prepareWheres(select, mFilter);


	select.field("report_year");
	select.field("report_qurater");
	
	//group by year & quarter
	select.group("report_year");
	select.group("report_qurater");

	//sort by descending order
	select.order("report_year",false);
	select.order("report_qurater",false);

	//get last 4 quarters
	select.limit(4);


	for (var idx in summary_columns)
	{
		col=summary_columns[idx];
		select.field('sum('+col+')','sum_'+col);
	}

	select.field('sum('+(summary_columns.join('+')+')'), 'group_sum' );


	select=select.toString();

	//console.log(select);
	var db = require('./db.js').open();
	db.querys(select,function(err, rows){
			callback(rows,select);
	});

}

//exports
exports.groupBySummaries=groupBySummaries;
exports.parseFilter=parseFilter;
exports.allowed_filters=Object.keys(allowed_filters);
exports.singleQuery=singleQuery;
exports.groupByQuarters=groupByQuarters;
exports.groupByManagingBody=groupByManagingBody;


