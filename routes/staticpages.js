var Tabletop = require("tabletop");
var db = require('../core/db.js');
var async = require('async');
var cloudflare = require('cloudflare').createClient({
    email: 'openpension.org.il@gmail.com',
    token: '93f093df1049fd91772193aff9faf618e69c3'
});

var sheetURL = 'https://docs.google.com/spreadsheets/d/1tm2xjPUYUFPk3BeHSLXec3sSckGMlFROcoH2zZYQC20/pubhtml?hl=en_US&hl=en_US';

var pensionTerms;
var monTerms;

var tableTopOptions = {
  key: sheetURL,
  callback: onLoad,
  simpleSheet: false
};

//callback function for tabletop initialization
function onLoad(data, tabletop) {
	pensionTerms = tabletop.sheets("מונחי פנסיה").all();
	monTerms = tabletop.sheets("מונחים כלכליים").all();
};

//load google spreadsheet using tabletop
function initTableTop(callback){
	//override callback
	if (callback != undefined){
		Tabletop.init(
			{
				key: tableTopOptions.key, 
				simpleSheet: tableTopOptions.simpleSheet,
				callback: callback
			}
		);
	}
	else{
		Tabletop.init(tableTopOptions);
	}
}

initTableTop();

exports.about = function(req, res)
{
	res.render('about',{});
}

exports.privacy = function(req, res)
{
	res.render('privacy',{});
}

exports.help = function(req, res)
{
	res.render('help',{
			pensionTerms : pensionTerms
		});
}

exports.refresh = function(req,res){
	
	async.parallel([
		function(callback){
			//reload Google Doc
			initTableTop();
			callback();
		},
		function(callback){
			//flush memcache
			db.memcache.flush(callback);
		},
		function(callback){
			//refresh materialized view
			db.query("REFRESH MATERIALIZED VIEW pension_data_all", callback, true);
		},
		function(callback){
			cloudflare.clearCache ("openpension.org.il", callback);
		}
	],
	function(err,results){
		if (err){
			res.end("Error: " + JSON.stringify(err));
		}

		res.end("Finished refreshing");
	});

}




