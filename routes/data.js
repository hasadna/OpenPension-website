
/*
 * GET data listing.
 */



exports.list = function(req, res){

	var str = "empty";

	var db = require('../db.js').open();

	db.querys("select * from data;",function(err, rows){
		for (var i = 0; i < rows.length; i++){
			console.log(rows[i]);
			res.write(JSON.stringify(rows[i]));
		}
		res.end();
	});

};