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


dictionary['nis'] = 'שקל ישראלי';
dictionary['usd'] = 'דולר ארה"ב';
dictionary['eur'] = 'אירו';
dictionary['jpy'] = 'ין יפני';
dictionary['gbp'] = 'ליש"ט';
dictionary['aud'] = 'דולר אוסטרלי';
dictionary['chf'] = 'פרנק שוויצרי';
dictionary['nzd'] = 'דולר ניו-זילנד';
dictionary['cny'] = 'יואן סיני';

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
exports.dictionary = dictionary;