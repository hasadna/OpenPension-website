
function numberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function normalizeData(groups){

	//set nulls to zeros and sort 
	for(var i in groups){ //go over index of groups
		var sum_null = 0;
		var j = groups[i]['result'].length
		while (j--) {

			//create the null group
			var group_field = groups[i]['group_field'];
			if (groups[i]['result'][j][group_field] == null ||
				groups[i]['result'][j][group_field] == ''){
				sum_null +=  Number(groups[i]['result'][j]['fair_value']) ;
				groups[i]['result'].splice(j,1);
			}

		}

		//sort by group sum in descending order
		groups[i]['result'].sort(function(a,b) { return parseFloat(b['fair_value']) - parseFloat(a['fair_value']) } );

		var nullGroup = {};
		nullGroup[group_field] = "NULL";		
		nullGroup['fair_value'] = sum_null;

		groups[i]['result'].push(nullGroup);
	}


	//calculate total_sum of groups
	//sum values of groups[0], all group sums assumed to be the same
	//used for calculating bar size precentage

	groups['total_sum'] = 0; //init 
	for (var j in groups[0]['result']){ //for j index of result
			//summarize 
			groups['total_sum'] += Number(groups[0]['result'][j]['fair_value']);
	}

	return groups;
}


function convertNumberToWords(numberToConvert){
	var number = Number(numberToConvert);
	if (Math.abs(number) > 1000000000000){
		return {
			number: (number / 1000000000000).toFixed(1),
			scale: "טריליון"
		}
	}
	else if (Math.abs(number) > 1000000000){
		return {
			number: (number / 1000000000).toFixed(1),
			scale: "מיליארד"
		}
	}
	else if (Math.abs(number) > 1000000){
		return {
			number: (number / 1000000).toFixed(1),
			scale: "מיליון"
		}
	}
	else if (Math.abs(number) > 10000){
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



//escape special chars
//duplicate single qoutes ' => ''
 function escapeSpecialChars(s) {  
    return String(s).replace(/'/g, '\'\'');  
 }

//escape JS function attribute 
//escape single qoutes ' => \'
 function escapeJSLink(s) {  
    return String(s).replace(/'/g, '\\\'')  
 }

//encodes string, including special chars !'()*
 function rfc3986EncodeURIComponent(s) {  
    return encodeURIComponent(s).replace(/[!'()*]/g, escape);  
 }

//remove duplicate double qoutes 
//and enclosing (start - end) double qoutes 
function removeQoutes(s){ 
 	return String(s).replace(/""/g, '"').replace(/^\"/, "").replace(/"$/, "");
 }





/**
 * Get previous quarters, including current, one based.
 * @param year : year to start counting back from 
 * @param quarter : quarter to start counting back from
 * @return Array : [{'quarter':'1','year:'2012'}, ...]
 */
function getLastQuarters (year, quarter, numOfQuarters){
	if (quarter > 4){
		throw "illegal quarter";
	}

	var res = [];
	var q = quarter;
	for (var i = 0; i < numOfQuarters; i++) {

		var obj = {
					'quarter': ''+q,
					'year': ''+year,
					'str' : ''+ year + '_' + q
				};

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



if(typeof module != 'undefined'){
	module.exports.numberWithCommas = numberWithCommas;
	module.exports.normalizeData = normalizeData;
	module.exports.convertNumberToWords = convertNumberToWords;
	module.exports.escapeSpecialChars = escapeSpecialChars;
	module.exports.rfc3986EncodeURIComponent = rfc3986EncodeURIComponent;
	module.exports.removeQoutes = removeQoutes;
	module.exports.getLastQuarters = getLastQuarters;
	module.exports.escapeJSLink = escapeJSLink;
}
