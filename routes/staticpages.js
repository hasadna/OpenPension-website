var Tabletop = require("tabletop");
var db = require('../core/db.js');

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
function initTableTop(){
	Tabletop.init(tableTopOptions);
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
	
	//reload Google Doc
	initTableTop();

	//flush memcache
	db.memcache.flush();

	//refresh materialized view
	db.query("REFRESH MATERIALIZED VIEW pension_data_all", function(){
		res.end("Finished refreshing");
	}, false);

}