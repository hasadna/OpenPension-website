var Filter = require('./filter.js');
var jsonJS = require('./json.js');
var metaTable = require('../common/MetaTable').getMetaTable();
/*
 * GET home page.
 */

 //build column dictionary - TODO: refactor
var hebrewColumns = metaTable.hebrewColumns;
var englishColumns = metaTable.englishColumns;
var columnDictionary = {};

for(var index in englishColumns)
{
	columnDictionary[englishColumns[index]] = hebrewColumns[index];
}

columnDictionary['managing_body'] = 'גוף מוסדי';
columnDictionary['instrument_type'] = 'סוג נכס';
	columnDictionary['instrument_sub_type'] = 'תת סוג נכס';

function normalizeData(groups, res){
	for(var i in groups) //index of groups
	{
		var groupField = groups[i]['group_field'];
		groups[i]['group_field_heb'] = columnDictionary[groupField];	//get hebrew name for column
		groups[i]['total_sum'] = 0;
		for (var j in groups[i]['result']){ //for j index of result, trim digits
			groups[i]['result'][j]['sum_market_cap'] = +parseFloat(groups[i]['result'][j]['sum_market_cap']).toFixed(1) || 0; //1 digits after dot
			groups[i]['total_sum'] += groups[i]['result'][j]['sum_market_cap'] 	// sum total results in group
		}
	}

	return groups;
}

exports.show = function(req, res){

  //var filterParams = new Array();
  
  var filter = Filter.fromRequest(req);
  
  //for(var key in filter) {
  //  var value = filterParams[key];
  //  qs += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
  // }

  
  jsonJS.groupBySummaries(filter,
    function(groups){
	
		groups = normalizeData(groups,res);
		//res.write(JSON.stringify(e));
	    // TBD : change to not 1. 	
		var total_sum_of_pension = groups[1]['total_sum']
		var render = true; //for debugging
		if (render)
		res.render('entry',{
	        entry: { title: "מופקדים בקופות הגמל", total_value: JSON.stringify(filter) },
	        groups: groups,
	        req: req	
      	});
		else res.end();
    }
  );
  
};
