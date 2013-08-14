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

columnDictionary['managing_body'] = 'גוף מנהל';
columnDictionary['instrument_type'] = 'סוג נכס';
columnDictionary['instrument_sub_type'] = 'תת סוג נכס';

function normalizeData(groups, res){
	for(var i in groups) //index of groups
	{
		var groupField = groups[i]['group_field'];
		groups[i]['group_field_heb'] = columnDictionary[groupField];	//get hebrew name for column
		groups[i]['total_sum'] = 0;
		for (var j in groups[i]['result']){ //for j index of result, trim digits
			groups[i]['result'][j]['sum_market_cap'] = +parseFloat(groups[i]['result'][j]['sum_market_cap']).toFixed(2) || 0; //2 digits after dot
			groups[i]['total_sum'] += groups[i]['result'][j]['sum_market_cap'] 	// sum total results in group
		}
	}

	return groups;
}

exports.show = function(req, res){
	
  var filter = Filter.fromRequest(req);

  jsonJS.groupBySummaries(filter,
    function(groups){
	
		groups = normalizeData(groups,res);
		//res.write(JSON.stringify(e));
		

		var render = true; //for debugging
		if (render)
		res.render('entry',{
	        entry: { title: "השקעות של הפניקס",total_value: "5.87 מיליארד ₪" },
	        groups: groups,
	        req: req
      	});
		else res.end();
    }
  );
  
};
