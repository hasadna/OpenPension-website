var Tabletop = require("tabletop");
var db = require('../core/db.js');
var async = require('async');
var cloudflare = require('cloudflare').createClient({
    email: 'openpension.org.il@gmail.com',
    token: '93f093df1049fd91772193aff9faf618e69c3'
});

var sheet = require('../core/GoogleDocSpreadsheet');

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
	sheet.reader.getSpreadsheet("מונחי פנסיה", function(err, sheet){
		res.render('help',{
			pensionTerms : sheet
		});
	});
}

exports.refresh = function(req,res){
	
	async.parallel([
		function(callback){
			//reload Google Doc
			sheet.reader.init();
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




