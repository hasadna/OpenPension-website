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


	for(var i in groups){ //index of groups

		for (var j in groups[i]['result']){ //for j index of result
			
			//trim digits
			groups[i]['result'][j]['sum_market_cap'] = Number(groups[i]['result'][j]['sum_market_cap']).toFixed(1);	
					
		}
	
	}

	//sum values of groups[0], all group sums assumed to be the same
	//used for calculating bar size precentage

	groups['total_sum'] = 0; //init 
	for (var j in groups[0]['result']){ //for j index of result
			
			//summarize 
			groups['total_sum'] += Number(groups[0]['result'][j]['sum_market_cap']);				
	}

	return groups;
}


exports.convertNumberToWords = function(numberToConvert){
	var number = Number(numberToConvert);
	if (number > 1000000000){
		return {
			number: (number / 1000000000).toFixed(1),
			scale: "מיליארד"
		}
	}
	else if (number > 1000000){
		return {
			number: (number / 1000000).toFixed(1),
			scale: "מיליון"
		}
	}
	else if (number > 1000){
		return{
			number: (number / 1000).toFixed(1),
			scale: "אלפים"
		}
	}
	else{
		return{
			number: number,
			scale:""
		}
	}
}

//get last 4 quarters, including current, zero based
exports.getLastFourQuarters = function(year,quarter){
	if (quarter > 3){
		throw "illegal quarter";
	}

	var res = [];
	var q = quarter;
	for (var i = 0; i < 4; i++) {

		res.push({'quarter':q--,'year':year});

		if (q == 0){
			year--;
			q = 3;
		} 
			
	};
	return res;
}


exports.columnDictionary = columnDictionary;



