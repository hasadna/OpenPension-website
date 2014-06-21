var Filter = require('../core/filter.js');
var DAL = require('../core/dal.js');
var DataNormalizer = require('../core/data_normalizer.js');
var metaTable = require('../common/MetaTable').getMetaTable();
var Categories = require('../core/categories.js');
var translate = require('../core/dictionary.js').translate;


var current_year = "2013";
var current_quarter = "3";

var managingBodiesTreemapData = new Object();

exports.managing_body_treemap = function(req,res){

    var filter = new Filter();
    filter.addConstraint("group_by","managing_body");

	filter.addConstraint("report_year", current_year);
	filter.addConstraint("report_qurater", current_quarter);


	DAL.groupBySummaries(filter,function(groups, select){
	
		var managing_bodies = groups[0].result;

		var treemapData = new Object();
		var treemapChildren = new Array();
		var totalSum = 0;

		for (i in managing_bodies){
			totalSum += Number(managing_bodies[i]['group_sum']);			
			treemapChildren.push(
							{
								"name":managing_bodies[i]['managing_body'], 
								"size":managing_bodies[i]['group_sum'],
								"translatedName":translate(managing_bodies[i]['managing_body']),
								"link": "/portfolio?managing_body="+managing_bodies[i]['managing_body']+"&report_year="+current_year+"&report_qurater="+current_quarter
							}
						);
		}

		totalSum = totalSum.toFixed(2);
		
		treemapData['name'] = "managing_bodies"
		treemapData['children'] = treemapChildren;

		//console.log(select);
		//console.log(treemapData);
		
		res.end(JSON.stringify(treemapData));		
	});


}


exports.issuers_treemap = function(req,res){

    var filter = new Filter();
    filter.addConstraint("group_by","issuer");

	filter.addConstraint("report_year", current_year);
	filter.addConstraint("report_qurater", current_quarter);


	DAL.groupBySummaries(filter,function(groups, select){
	
		var issuers = groups[0].result;

		var treemapData = new Object();
		var treemapChildren = new Array();
		var totalSum = 0;
		
		for (i in issuers){
			totalSum += Number(issuers[i]['group_sum']);			
			treemapChildren.push(
							{
								"name":issuers[i]['issuer'], 
								"size":issuers[i]['group_sum'],
								"translatedName":translate(issuers[i]['issuer']),
								//"link": "/portfolio?issuer="+issuers[i]['issuer']+"&report_year="+current_year+"&report_qurater="+current_quarter
								"link": "#"
							}
						);
		}

		totalSum = totalSum.toFixed(2);
		
		treemapData['name'] = "issuers"
		treemapData['children'] = treemapChildren;

		//console.log(select);
		//console.log(treemapData);
		
		res.end(JSON.stringify(treemapData));		
	});

}

exports.show = function(req, res){

	  
    var filter = new Filter();
    filter.addConstraint("group_by","managing_body");

	filter.addConstraint("report_year",current_year);
	filter.addConstraint("report_qurater",current_quarter);


	DAL.groupBySummaries(filter,function(groups, select){
	
		var managing_bodies = groups[0].result;
		var totalSum = 0;

		for (i in managing_bodies){
			totalSum += Number(managing_bodies[i]['group_sum']);			
		}

		totalSum = totalSum.toFixed(2);
		

		//console.log(select);
		//console.log(treemapData);
		
	    res.render('homepage',{
	    	market_size: DataNormalizer.convertNumberToWords(totalSum)
		
	    });
		
	});

};
