var Groups = require('../core/groups.js');
var getLastQuarters = require('../core/data_normalizer.js').getLastQuarters;
var Filter = require('./filter.js');
var squel = require('squel');
var config = require('../config')
var db = require('./db.js');
var async = require('async');
var Promise = require('bluebird');
var es = require('./elasticClient.js')

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

		if (constraintData['data'] == "null"){
			expr.or(constraintField + ' IS NULL');
		}
		else{
			expr.or(constraintField + '= ?');
		}


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
		if (constraintField in allowed_filters)
		{
			var constraintDataArr = filter.getConstraint(constraintField);
			simple_filter(select, constraintField, constraintDataArr);
		}
		else if (constraintField == 'q'){
				var constraintDataArr = filter.getConstraint(constraintField);
				select.where("LOWER(instrument_name) like LOWER('%"+constraintDataArr[0]['data']+"%') OR LOWER(instrument_id) like LOWER('%"+constraintDataArr[0]['data']+"%')")

		}

	}
}

/**
 * Create multiple select queries by groups
 * one query for each group.
 * if filter contains "group_by" field, then group by groups in filter.
 * else group by every field which is in allowed_filters and not in filter.
 *
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
	//add wheres to query
	var sqlQuery = parseFilter(filter);

	//perform query
	db.query(sqlQuery, function(err, rows){
			callback(err, rows);
	});
}



/**
 * Perform stream query and pass stream
 * to callback function
 * @param filter: Filter object with constraints
 * @returns Promise that resolves to stream
 */
function streamQuery(filter, callback)
{
	//add wheres to query
	var sqlQuery = parseFilter(filter);

	//perform query
	return db.streamQuery(sqlQuery);
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

	for (var index in groups)
	{
		var group=groups[index];

		//add sum(fair_value) AS fair_value
		group.query.field('sum(fair_value)', 'fair_value' );

		//ORDER BY fair_value DESC
		group.query.order('sum(fair_value)',false);

		group.query=group.query.toString();

		//perform multiple queries
		db.query(group.query, function(group, err,rows){
			group.result=rows;
			if(--wait<=0)
			{
				callback(err, groups,group.query);
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

  if (filter.hasConstraint("managing_body")) {
	mFilter.addConstraint("managing_body", filter.getConstraintData("managing_body"));
  }

  //add year and quarter to new fiter
  mFilter.addConstraint("report_year", filter.getConstraintData("report_year"));
  mFilter.addConstraint("report_qurater", filter.getConstraintData("report_qurater"));

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

	//report year and quarter
	var report_year = mFilter.getConstraintData("report_year")[0];
	var report_quarter = mFilter.getConstraintData("report_qurater")[0];

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
	addLastQuartersToQuery(select, report_year, report_quarter, 4);


	//sum by fair_value
	select.field('sum(fair_value)', 'fair_value' );
	select.order('sum(fair_value)',false);

	select=select.toString();

	db.query(select, function(err, rows){
			callback(err, rows,select);
	});

}

/**
 * Add previous quarters to Squel query
 * @param query    : Squel select
 * @param year     : starting year
 * @param quarter  : starting quarter
 * @param numOfQuarters : number of previous quarters to add to query
 * @param callback : function to handle result rows
 */
function addLastQuartersToQuery(query, year, quarter, numOfQuarters){

	var expr=squel.expr();
	var quarters = 	getLastQuarters(year, quarter, numOfQuarters);
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
 * get 5 top most rows, ordered by fair_value
 * joined with last four quarters.
 * Query structure generated is : outerSelect FROM ( innerSelect JOIN joined)

	query example:

     	SELECT * FROM
     	(
	     	SELECT ROW_NUMBER() OVER (ORDER BY sum(fair_value) DESC)
	     	AS rownumber, managing_body
	     	FROM pension_data_all
	     	WHERE (report_year= '2014') AND (report_qurater= '3')
	     	GROUP BY managing_body
     	) AS currentQuarter
     	INNER JOIN (
     		SELECT report_year, report_qurater, managing_body, sum(fair_value) AS "fair_value"
     		FROM pension_data_all
     		WHERE (
     			(report_year = 2014 AND report_qurater = 3) OR
     			(report_year = 2014 AND report_qurater = 2) OR
     			(report_year = 2014 AND report_qurater = 1) OR
     			(report_year = 2013 AND report_qurater = 4)
 			)
			GROUP BY report_year, report_qurater, managing_body) AS previousQuarters
		ON currentQuarter.managing_body= previousQuarters.managing_body
			OR (currentQuarter.managing_body IS NULL AND previousQuarters.managing_body IS NULL)
		WHERE (rownumber <= 5)
		ORDER BY report_year DESC, report_qurater DESC, fair_value DESC


 * @param filter : Filter object
 * @param callback : function to handle result rows
 */
function groupByPortfolio(filter, callback){

	var mFilter = filter.clone();

	//report year and quarter
	var report_year = mFilter.getConstraintData("report_year")[0];
	var report_quarter = mFilter.getConstraintData("report_qurater")[0];

	var outerSelect;

	//inner select, with applied filter, for current quarter
	var innerSelect = squel.select().from(config.table);
	prepareWheres(innerSelect, mFilter);

	//add row_number to inner select, for getting top 5
	innerSelect.field("ROW_NUMBER() OVER (ORDER BY sum(fair_value) DESC) AS rownumber");

	var group_by_fields;

	var groupByData = mFilter.getConstraintData("group_by");
	mFilter.removeField("group_by");

	if (groupByData.length > 0){
		//got group by fields from user
		group_by_fields = groupByData;
	}
	else{
	    //add group by fields for display
		group_by_fields = Groups.getGroups(mFilter);
	}

    for( i in group_by_fields){
      mFilter.addConstraint("group_by",group_by_fields[i]);
    }

	//create multiple queries, one for each group
	var groups=prepareGroupBy(innerSelect, mFilter);

	var wait=groups.length;
	if (wait == 0)
		return;

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
		joined.field('sum(fair_value)', 'fair_value' );

		mFilter.removeField("report_year");
		mFilter.removeField("report_qurater");

		//apply filter to joined WHERE clause
		prepareWheres(joined, mFilter);

		//add last quarters to joined
		addLastQuartersToQuery(joined, report_year, report_quarter, 4);

		joined.group("report_year");
		joined.group("report_qurater");
		joined.group(groupField);

		//outerSelect, wrapping inner and joined, get top 5 rows
		outerSelect = squel.select().from("("+group.query.toString()+") AS currentQuarter");
		outerSelect.where("rownumber <= 5");


		outerSelect.join("("+joined + ") AS previousQuarters ON currentQuarter." + groupField
			+"= previousQuarters."+groupField
			+ " OR (currentQuarter." + groupField + " IS NULL AND"
			+ " previousQuarters."+groupField + " IS NULL)");

		outerSelect.order("report_year",false);
		outerSelect.order("report_qurater",false);
		outerSelect.order("fair_value",false);


	 	group.query = outerSelect.toString();

	 	//run query for group in groups
		db.query(group.query, function(group, err,rows){
			group.result=rows; //put result in group (groups[index])
			if(--wait<=0)
			{
				callback(err, groups);
			}
		}.bind(this, group));

	}
}


/**
 * Query DB, get info needed for investments view.
 * Creates an SQL query of the following template:
 *
 *   SELECT report_year, report_qurater, %GROUP_BY_FIELD%,
 *   sum(fair_value) AS fair_value
 *   FROM pension_data_all WHERE %FILTER_CONSTRAINTS%
 *   AND %LAST_4_QUARTERS%
 *   GROUP BY report_year, report_qurater, %GROUP_BY_FIELD%
 *   ORDER BY report_year DESC, report_qurater DESC, fair_value DESC
 *
 * @param filter : Filter object
 * @param callback : function to handle result rows
 */
function groupByInvestments(filter, callback){

	//remove group_by if present
	var mFilter = filter.clone();

	var report_year = mFilter.getConstraintData("report_year")[0];
	var report_quarter = mFilter.getConstraintData("report_qurater")[0];
	var groupBy = mFilter.getConstraintData("group_by")[0];


	var select = squel.select().from(config.table);

	select.field("report_year");
	select.field("report_qurater");
	select.field(groupBy +" AS name");
	select.field('sum(fair_value)', 'fair_value');


	//dont need year and quarter in where's, add last 4 q's later
	mFilter.removeField("report_year");
	mFilter.removeField("report_qurater");

	//apply filter constraints to WHERE clause
	prepareWheres(select, mFilter);

	//add last quarters to constraints
	addLastQuartersToQuery(select, report_year, report_quarter, 4);

	select.group("report_year");
	select.group("report_qurater");
	select.group(groupBy);

	select.order("report_year",false);
	select.order("report_qurater",false);
	select.order("fair_value",false);

	select = select.toString();

	db.query(select, function(err, rows){
		callback(err, rows, select);
	});

}

/**
 * Query the DB, get list of managing bodies
 */
function getManagingBodies(callback){

	var select = squel.select().from(config.table);

	select.field("managing_body").distinct();

	var sqlQuery = select.toString();

	db.query(sqlQuery, function(err, rows){
			callback(err, rows, sqlQuery);
	});

}


/**
 * Query the DB, get funds by managing_body
 * @param managing_body : string, name of managing body
 * @param callback : function to handle result rows.
 */
function getFundsByManagingBody(managing_body,callback){
	if (managing_body == undefined || managing_body == ""){
			callback(null,[]);
			return;
	}

	var select = squel.select().from(config.table);
	select.field("fund");
	select.field("fund_name");
	select.where("managing_body = '"+escapeChars(managing_body) +"'")
	select.group("fund_name");
	select.group("fund");
	select.order("fund",true);

	var sqlQuery = select.toString();

	db.query(sqlQuery, function(err, rows){
			callback(err, rows, sqlQuery);
	});

}

function searchInFields(term, limit, callback){

	async.parallel([
	      function(callback){
			searchByField(term, "instrument_name", limit, callback);
	      },
	      function(callback){
			searchByField(term, "instrument_id", limit, callback);
	      },
	      function(callback){
			searchByField(term, "fund_name", limit, callback);
		  },
	      function(callback){
			searchByField(term, "issuer", limit, callback);
		  }

	    ],
	    function(err,results){


	      var s = {};

	      if (err){
	        console.log("Error:"+err);
	        res.end("Err: "+err);
	        return;
	      }

      	  s.assets = results[0][0].rows;
      	  s.instruments = results[1][0].rows;
      	  s.funds = results[2][0].rows;
      	  s.issuers = results[3][0].rows;

      	  callback(err,s);

      });
}


function searchInFieldsEs(term, size){

	return Promise.all(
		[
			es.searchInIndex('instrument_name', term, size),
			es.searchInIndex('instrument_id', term, size),
			es.searchInIndex('fund_name', term, size)

		]
	)
		.then(function(results){

			var res = {};
			 	  res.assets = results[0]  ? results[0]: [];
			 	  res.instruments = results[1] ? results[1] : [];
			 	  res.funds = results[2] ? results[2] : [];
			 	  res.issuers = results[3] ? results[3]: [];

			return res;

		});

}


/**
 * Query the DB, find lines containing term in field
 * @param term : string, name/id to look for
 * @param field : string, field to look in
 * @param callback(obj) : function to handle result rows.
 * obj = {rows:[...], total_row_count:int, page: int,
 * 			results_per_page: int, total_pages: int}
 */
function searchByField(term, field, limit, callback){
	var RESULTS_PER_PAGE = 50;


	if (term == undefined || term == "" ) {
		var res = [{"rows":[], "total_row_count" : 0, "page":0, "results_per_page" : RESULTS_PER_PAGE, "total_pages": 0}];
		// callback("term is empty", res)
		callback(undefined, res)
		return
	}

	//query limited & offset
	var select = squel.select().from(config.table);
	select.distinct();
	select.field(field);
	select.where("LOWER("+field+") like LOWER('%"+escapeChars(term) +"%')");

	if (limit != undefined && limit != -1)
		select.limit(limit);


	db.query(select.toString(), function(err, rows){
		var res = {"rows":rows};
		callback(err, res, select.toString());
	});

}


/**
 * Query the DB, find lines containing term in
 * instrument_id or instrument_name
 * @param term : string, name/id to look for
 * @param callback(obj) : function to handle result rows.
 * obj = {rows:[...], total_row_count:int, page: int,
 * 			results_per_page: int, total_pages: int}
 */
function search(term, pageNum, callback){
	var RESULTS_PER_PAGE = 50;

	if (pageNum == undefined)
		pageNum = 1;

	if (term == undefined || term == "" ) {
		var res = {"rows":[], "total_row_count" : 0, "page":0, "results_per_page" : RESULTS_PER_PAGE, "total_pages": 0};
		callback("term is empty", res)
		return
	}

	//query limited & offset
	var select = squel.select().from(config.table);
	select.distinct();
	select.field("instrument_name");
	select.field("instrument_id");
	select.where("LOWER(instrument_name) like LOWER('%"+escapeChars(term) +"%')" +
		" OR LOWER(instrument_id) like LOWER('%"+escapeChars(term) +"%')");
	select.limit(RESULTS_PER_PAGE);
	select.offset( RESULTS_PER_PAGE * (pageNum - 1));


	var countSelect =
		"select count(count_a) from ("
			+"SELECT count(*) as count_a,instrument_name, instrument_id FROM pension_data_all WHERE (LOWER(instrument_name) like LOWER('%"+escapeChars(term)+"%') OR LOWER(instrument_id) like LOWER('%"+escapeChars(term)+"%')) group by instrument_name, instrument_id"
		+")  as c";


	//console.log(select.toString())

	db.query(select.toString(), function(err, rows){
		db.query(countSelect, function(err, count){
				var res = {"rows":rows, "total_row_count" : count[0].count, "page":pageNum, "results_per_page" : RESULTS_PER_PAGE, "total_pages": Math.ceil(count[0].count/RESULTS_PER_PAGE)};
				callback(err, res, select.toString());
		});
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
exports.getFundsByManagingBody=getFundsByManagingBody;
exports.groupByInvestments=groupByInvestments;
exports.getManagingBodies=getManagingBodies;
exports.search=search;
exports.streamQuery=streamQuery;
exports.searchInFields=searchInFields;
exports.searchInFieldsEs=searchInFieldsEs;
exports.searchByField=searchByField;
exports.addLastQuartersToQuery=addLastQuartersToQuery;
