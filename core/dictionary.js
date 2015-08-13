var metaTable = require('../common/MetaTable').getMetaTable();
var spreadsheet = require('../core/GoogleDocSpreadsheet');

var hebrewColumns = metaTable.hebrewColumns;
var englishColumns = metaTable.englishColumns;
var dictionary = {};

for(var index in englishColumns)
{
	dictionary[englishColumns[index]] = hebrewColumns[index];
}

//append currencies to dictionary
spreadsheet.reader.getSpreadsheet('מטבעות',function(err, data){
	data.forEach(function(currency){
		dictionary[currency.currencyname.toLowerCase()] = currency.translation;
	});
})

dictionary['activity_industry'] = 'ענף פעילות';
dictionary['managing_body'] = 'גוף מוסדי';
dictionary['liquidity'] = 'רמת נזילות';
dictionary['asset_type'] = 'סוג נכס';
dictionary['issuer'] = 'מנפיק';
dictionary['instrument_name'] = 'שם נכס';
dictionary['fund_name'] = 'שם קופה';
dictionary['reference_index'] = 'מדד ייחוס';


dictionary['harel'] = 'הראל';
dictionary['migdal'] = 'מגדל';
dictionary['menora'] = 'מנורה';
dictionary['xnes'] = 'אקסלנס';
dictionary['amitim'] = 'עמיתים';
dictionary['clal'] = 'כלל';
dictionary['fenix'] = 'פניקס';
dictionary['psagot'] = 'פסגות';
dictionary['ayalon'] = 'איילון';
dictionary['ds'] = 'דש';
dictionary['yl'] = 'ירין לפידות';
dictionary['as'] = 'אלטשולר שחם';


dictionary['null'] = 'לא נמצא בקטגוריה';
dictionary['others'] = 'אחרים';




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


var plurals = {
  'managing_body': 'הגופים המוסדיים', 
  'currency' : 'סוגי המטבעות', 
  'rating':'הדירוגים', 
  'instrument_id':'מספרי הנכסים',
  'issuer':'המנפיקים',
  'instrument_name':'שמות הנכסים',
  'activity_industry':'ענפי הפעילות',
  'reference_index':'המדדים',
  'fund_name' : 'הקופות',
  'liquidity' : 'רמות הנזילות',
  'asset_type' : 'סוגי הנכסים'
}


if(typeof module != 'undefined'){
	module.exports.plurals = plurals;
	module.exports.translate = translate;
	module.exports.dictionary = dictionary;	
}

