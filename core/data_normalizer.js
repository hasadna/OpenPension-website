var metaTable = require('../common/MetaTable').getMetaTable();

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


exports.normalizeData = function(groups){


	//set nulls to zeros and sort 
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
