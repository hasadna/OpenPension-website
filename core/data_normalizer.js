
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

exports.normalizeData = function(groups){

	//set nulls to zeros and sort 
	for(var i in groups){ //go over index of groups
		var sum_null = 0;
		var j = groups[i]['result'].length
		while (j--) {

			if (groups[i]['result'][j]['sum_market_cap'] == null){
				groups[i]['result'][j]['sum_market_cap'] = 0;
			}

			var group_field = groups[i]['group_field'];
			if (groups[i]['result'][j][group_field] == null ||
				groups[i]['result'][j][group_field] == ''){
				sum_null +=  Number(groups[i]['result'][j]['sum_market_cap']) + Number(groups[i]['result'][j]['sum_fair_value']);
				groups[i]['result'].splice(j,1);

			}
			else{
				groups[i]['result'][j]['group_sum'] = Number(groups[i]['result'][j]['sum_market_cap']) + Number(groups[i]['result'][j]['sum_fair_value']);
			}


		}
		groups[i]['result'].sort(function(a,b) { return parseFloat(b['group_sum']) - parseFloat(a['group_sum']) } );

		var nullGroup = {};
		nullGroup[group_field] = "NULL";		
		nullGroup['group_sum'] = sum_null;		

		groups[i]['result'].push(nullGroup);
	}


	//calculate total_sum of groups
	//sum values of groups[0], all group sums assumed to be the same
	//used for calculating bar size precentage

	groups['total_sum'] = 0; //init 
	for (var j in groups[0]['result']){ //for j index of result
			//summarize 
			groups['total_sum'] += Number(groups[0]['result'][j]['group_sum']);
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
	else if (number > 10000){
		return{
			number: (number / 1000).toFixed(1),
			scale: "אלף"
		}
	}
	else{
		return{
			number: numberWithCommas(number.toFixed(0)),
			scale:""
		}
	}
}


//get last 4 quarters, including current, zero based
//returns array
// [
//		{'quarter':'1','year:'2012'},
//      ...
// ]
//
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
