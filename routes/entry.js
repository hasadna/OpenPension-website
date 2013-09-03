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


	//set nulls as zeros and sort again
	for(var i in groups){ //go over index of groups
		for (var j in groups[i]['result']){ //for j index of result
			if (groups[i]['result'][j]['sum_market_cap'] == null){
				groups[i]['result'][j]['sum_market_cap'] = 0;
			}
		}
		groups[i]['result'].sort(function(a,b) { return parseFloat(b['sum_market_cap']) - parseFloat(a['sum_market_cap']) } );
	}


	//sum each group, translate
	for(var i in groups){ //index of groups
	
		var groupTitle = groups[i]['group_field'];
		groups[i]['group_field_heb'] = columnDictionary[groupTitle];	//get hebrew name for column

		//sum values per group, used for calculating bars precentage
		groups[i]['group_sum'] = 0; //init group_sum
		for (var j in groups[i]['result']){ //for j index of result, trim digits 
			
			//verify that sum_market_cap is not NaN or undefined
			//trim digits
			groups[i]['result'][j]['sum_market_cap'] = Number(groups[i]['result'][j]['sum_market_cap']).toFixed(1);	
			//summarize per group
			groups[i]['group_sum'] += Number(groups[i]['result'][j]['sum_market_cap']);				
		}
	}

	//set total sum to be group sum of group 0, all group sums assumed to be the same
	groups['total_sum'] = groups[0]['group_sum'];

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
