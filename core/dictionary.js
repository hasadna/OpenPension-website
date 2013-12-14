var metaTable = require('../common/MetaTable').getMetaTable();

 //build column dictionary - TODO: refactor
var hebrewColumns = metaTable.hebrewColumns;
var englishColumns = metaTable.englishColumns;
var dictionary = {};


for(var index in englishColumns)
{
	dictionary[englishColumns[index]] = hebrewColumns[index];
}

dictionary['activity_industry'] = 'ענף פעילות';
dictionary['managing_body'] = 'גוף מוסדי';
dictionary['instrument_type'] = 'רמת נזילות';
dictionary['instrument_sub_type'] = 'סוג נכס';
dictionary['issuer'] = 'מנפיק';
dictionary['instrument_name'] = 'שם נכס';
dictionary['reference_index'] = 'מדד יחסי';

dictionary['Migdal'] = 'מגדל';


var translate = function(word){
	if (dictionary.hasOwnProperty(word)){
		return dictionary[word];
	}
	else{
		return word;
	}
}

exports.translate = translate;