var metaTable = require('../common/MetaTable').getMetaTable();

 //build column dictionary - TODO: refactor
var hebrewColumns = metaTable.hebrewColumns;
var englishColumns = metaTable.englishColumns;
var dictionary = {};


for(var index in englishColumns)
{
	dictionary[englishColumns[index]] = hebrewColumns[index];
}

dictionary['managing_body'] = 'גוף מוסדי';
dictionary['instrument_type'] = 'סוג נכס';
dictionary['instrument_sub_type'] = 'תת סוג נכס';

var translate = function(word){
	if (dictionary.hasOwnProperty(word)){
		return dictionary[word];
	}
	else{
		return word;
	}
}

exports.translate = translate;