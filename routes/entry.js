var Filter = require('./filter.js');
var jsonJS = require('./json.js');
var metaTable = require('../common/MetaTable').getMetaTable();
/*
 * GET home page.
 */

 //build column dictionary
var hebrewColumns = metaTable.hebrewColumns;
var englishColumns = metaTable.englishColumns;
var columnDictionary = {};

for(var index in englishColumns)
{
	columnDictionary[englishColumns[index]] = hebrewColumns[index];
}

columnDictionary['managing_body'] = 'גוף מנהל';
columnDictionary['instrument_type'] = 'סוג נכס';
columnDictionary['instrument_sub_type'] = 'תת סוג נכס';

function normalizeData(data,res){
	for(var i in data) //index of data
	{
		var groupField = data[i]['group_field'];
		data[i]['group_field_heb'] = columnDictionary[groupField];	//get hebrew name for column
		for (var j in data[i]['result']){ //index of result
			data[i]['result'][j]['sum_market_cap'] = parseFloat(data[i]['result'][j]['sum_market_cap']).toFixed(2); //2 digits after dot
		}
	}

	return data;
}

exports.show = function(req, res){
	
	
  var filter = Filter.fromRequest(req);

  jsonJS.groupBySummaries(filter,
    function(data){
	
		data = normalizeData(data,res);
	//res.write(JSON.stringify(e));
		

		var render = true;
		if (render)
		res.render('entry',{
	        entry: { title: "השקעות של הפניקס",total_value: "5.87 מיליארד ₪" },
	        elements: data
      	});
	else res.end();
    }
  );
  
};
