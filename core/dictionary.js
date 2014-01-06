var metaTable = require('../common/MetaTable').getMetaTable();

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
dictionary['fund_name'] = 'שם קופה';
dictionary['reference_index'] = 'מדד ייחוס';

dictionary['migdal'] = 'מגדל';

dictionary['null'] = 'לא נמצא בקטגוריה';

//dictionary holds lower case keys
var translate = function(word){
	var wordLC = String(word).toLowerCase();
	if (dictionary.hasOwnProperty(wordLC)){
		return dictionary[wordLC];
	}
	else{
		return word;
	}
}

exports.translate = translate;