var Groups = require('../core/groups.js');
var Filter = require('./filter.js');
var squel = require('squel');
var config = require('../config')

var allowed_filters={ 
	'managing_body':simple_filter, 
	'currency' : simple_filter, 
	'rating':simple_filter, 
	'report_year':simple_filter, 
	'report_qurater':simple_filter, 
	'instrument_id':simple_filter,
	'issuer':simple_filter,
	'instrument_name':simple_filter,
	'activity_industry':simple_filter,
	'reference_index':simple_filter,
	'fund_name' : simple_filter,
	'liquidity' : simple_filter,
	'asset_type' : simple_filter
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
		}

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

/**
 * @param filter : Filter object
 * @param callback : function to handle result rows
 */
function groupBySummaries(filter, callback)
{
	var select = squel.select().from(config.table);

	//apply filter to select WHERE clause
	prepareWheres(select, filter);

	//create multiple queries for each group
	var groups=prepareGroupBy(select, filter);
	var wait=groups.length;
	if (wait == 0)
		return;

	var db = require('./db.js').open();
	for (var index in groups)
	{
		var group=groups[index];
		
		//add sum(market_cap+fair_value) AS group_sum
		group.query.field('sum('+(summary_columns.join('+')+')'), 'group_sum' );

		//ORDER BY group_sum DESC
		group.query.order('sum('+(summary_columns.join('+')+')'),false);

		group.query=group.query.toString();

		//perform multiple queries
		db.multiple_queries(group.query, function(group, err,rows){
			group.result=rows;
			if(--wait<=0)
			{
				db.end();
				callback(groups,group.query);
			}
		}.bind(this, group));
	}
}


/**
 * Group by managing body, if managing body is in the filter
 * and by last four quarters
 * @param filter : Filter object 
 * @param callback : function to handle result rows
 */
function groupByManagingBody(filter, callback){
	
  var mFilter = new Filter();

  if (filter.getConstraintData("managing_body") != "") {
	mFilter.addConstraint("managing_body", filter.getConstraintData("managing_body"));
  } 

  groupByQuarters(mFilter, callback);

}


/**
 * Query by filter constraint, group by last four quarters
 * pass result rows to callback function
 * @param filter : Filter object 
 * @param callback : function to handle result rows
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
	addLastQuartersToQuery(select,4);


	//sum by summary columns
	for (var idx in summary_columns)
	{
		col=summary_columns[idx];
		select.field('sum('+col+')','sum_'+col);
	}

	//sum by group_sum
	select.field('sum('+(summary_columns.join('+')+')'), 'group_sum' );
	select.order('sum('+(summary_columns.join('+')+')'),false);

	select=select.toString();

	//console.log(select);
	var db = require('./db.js').open();
	db.querys(select,function(err, rows){
			callback(rows,select);
	});

}

/**
 * Add previous quarters to Squel query
 * @param query : Squel select 
 * @param numOfQuarters : number of previous quarters to add to query 
 * @param callback : function to handle result rows
 */
function addLastQuartersToQuery(query, numOfQuarters){

	var expr=squel.expr();
	var quarters = 	getLastQuarters("2013","3", numOfQuarters);
	for (var i = 0; i < quarters.length; i++){
		expr.or_begin()
	 		.and("report_year = "+ quarters[i]['year'])
	 		.and("report_qurater = " + quarters[i]['quarter'])
	 	.end();
	}	

	query.where(expr);

	return query;
}


/**
 * Query DB, get info needed for portfolio view.
 * For each group in allowed_filters which is not in filter constraints,
 * get 5 top most rows, ordered by group_sum (=market_cap+fair_value) 
 * joined with last four quarters.
 * Query structure generated is : outerSelect FROM ( innerSelect JOIN joined)
 * @param filter : Filter object 
 * @param callback : function to handle result rows
 */
function groupByPortfolio(filter, callback){

	var mFilter = filter.clone();

	//remove group_by if present
	mFilter.removeField("group_by");
		
	var outerSelect;

	//inner select, with applied filter, for current quarter
	var innerSelect = squel.select().from(config.table);
	prepareWheres(innerSelect, mFilter);

	//add row_number to inner select, for getting top 5 
	innerSelect.field("ROW_NUMBER() OVER (ORDER BY sum(market_cap+fair_value) DESC) AS rownumber");
	
    //add group by fields for display
    var group_by_fields = Groups.getGroups(mFilter);

    for( i in group_by_fields){
      mFilter.addConstraint("group_by",group_by_fields[i]);
    }

	//create multiple queries, one for each group
	var groups=prepareGroupBy(innerSelect, mFilter);

	var wait=groups.length;
	if (wait == 0)
		return;

	var db = require('./db.js').open();
	for (var index in groups)
	{
		var group=groups[index];
		var groupField = group['group_field'];		
		group.query=group.query.toString();
		
		//joined select, for last four quarters
		var joined = squel.select().from(config.table);

		joined.field("report_year");
		joined.field("report_qurater");
		joined.field(groupField);
		joined.field('sum('+(summary_columns.join('+')+')'), 'group_sum' );

		mFilter.removeField("report_year");
		mFilter.removeField("report_qurater");

		//apply filter to joined WHERE clause
		prepareWheres(joined, mFilter);

		//add last quarters to joined 
		addLastQuartersToQuery(joined,4);

		joined.group("report_year");
		joined.group("report_qurater");
		joined.group(groupField);

		//outerSelect, wrapping inner and joined, get top 5 rows
		outerSelect = squel.select().from("("+group.query.toString()+") AS currentQuarter");
		outerSelect.where("rownumber <= 5");


		outerSelect.join("("+joined + ") AS previousQuarters ON currentQuarter." + groupField
			+"= previousQuarters."+groupField);	

		outerSelect.order("report_year",false);
		outerSelect.order("report_qurater",false);
		outerSelect.order("group_sum",false);


		// console.log(outerSelect.toString());

	 	group.query = outerSelect.toString();

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


/**
 * Query DB, get info needed for investments view.
 * Creates an SQL query of the following template: 
 *
 *   SELECT report_year, report_qurater, %GROUP_BY_FIELD%, 
 *   sum(market_cap+fair_value) AS "group_sum" 
 *   FROM pension_data_all WHERE %FILTER_CONSTRAINTS%
 *   AND %LAST_4_QUARTERS%
 *   GROUP BY report_year, report_qurater, %GROUP_BY_FIELD% 
 *   ORDER BY report_year DESC, report_qurater DESC, group_sum DESC
 *
 * @param filter : Filter object 
 * @param callback : function to handle result rows
 */
function groupByInvestments(filter, callback){

	var db = require('./db.js').open();


	//remove group_by if present
	var mFilter = filter.clone();

	var report_year = mFilter.getConstraintData("report_year")[0];
	var report_qurater = mFilter.getConstraintData("report_qurater")[0];
	var groupBy = mFilter.getConstraintData("group_by")[0];


	var select = squel.select().from(config.table);
		
	select.field("report_year");
	select.field("report_qurater");
	select.field(groupBy);
	select.field('sum('+(summary_columns.join('+')+')'), 'group_sum' );


	//dont need year and quarter in where's, add last 4 q's later
	mFilter.removeField("report_year");
	mFilter.removeField("report_qurater");
	
	//apply filter constraints to WHERE clause
	prepareWheres(select, mFilter);

	//add last quarters to constraints 
	addLastQuartersToQuery(select,4);

	select.group("report_year");
	select.group("report_qurater");
	select.group(groupBy);

	select.order("report_year",false);
	select.order("report_qurater",false);
	select.order("group_sum",false);

	select = select.toString();
	// console.log(select.toString());

	db.querys(select,function(err, rows){
		callback(rows,select);
	});

}



/**
 * Get previous quarters, including current, one based.
 * @param year : year to start counting back from 
 * @param quarter : quarter to start counting back from
 * @return Array : [{'quarter':'1','year:'2012'}, ...]
 */
function getLastQuarters(year, quarter, numOfQuarters){
	if (quarter > 4){
		throw "illegal quarter";
	}

	var res = [];
	var q = quarter;
	for (var i = 0; i < numOfQuarters; i++) {

		var obj = {
					'quarter': ''+q,
					'year': ''+year
				};

		obj.toString = function (){return this['year'] + '_' + this['quarter']}
		res.push(obj);

		if (q == 1){
			year--;
			q = 4;
		}
		else{
			q--;
		}

	};
	return res;
}

/**
 * Query the DB, get funds by managing_body
 * @param managing_body : string, name of managing body
 * @param callback : function to handle result rows.
 */
function getFundsByManagingBody(managing_body,callback){
	if (managing_body == undefined || managing_body == ""){
			callback([]);
			return;
	}

	var db = require('./db.js').open();

	var select = squel.select().from(config.table);
	select.field("fund_name");
	select.where("managing_body = '"+escape(managing_body) +"'")
	select.group("fund_name");
	select.order("fund_name",true);

	var sqlQuery = select.toString();

	db.querys(sqlQuery,function(err, rows){
			callback(rows);
	});

}

//exports
exports.groupBySummaries=groupBySummaries;
exports.parseFilter=parseFilter;
exports.allowed_filters=Object.keys(allowed_filters);
exports.singleQuery=singleQuery;
exports.groupByQuarters=groupByQuarters;
exports.groupByManagingBody=groupByManagingBody;
exports.groupByPortfolio=groupByPortfolio;
exports.getLastQuarters=getLastQuarters;
exports.getFundsByManagingBody=getFundsByManagingBody;
exports.groupByInvestments=groupByInvestments;