var Filter = require('../core/filter.js');
var DAL = require('../core/dal.js');
var DataNormalizer = require('../core/data_normalizer.js');
var metaTable = require('../common/MetaTable').getMetaTable();
var Categories = require('../core/categories.js');
var translate = require('../core/dictionary.js').translate;

exports.show = function(req, res){

	  
    var filter = new Filter();
    filter.addConstraint("group_by","managing_body");

	filter.addConstraint("report_year","2013");
	filter.addConstraint("report_qurater","3");


	DAL.groupBySummaries(filter,function(groups, select){
	
		var managing_bodies = groups[0].result;

		var treemapData = new Object();
		
		var totalSum = 0;
		var treemapChildren = new Array();
		
		for (i in managing_bodies){
			totalSum += Number(managing_bodies[i]['group_sum']);			
			treemapChildren.push(
							{
								"name":managing_bodies[i]['managing_body'], 
								"size":managing_bodies[i]['group_sum'],
								"translatedName":translate(managing_bodies[i]['managing_body']),
							}
						);
		}

		totalSum = totalSum.toFixed(2);
		
		treemapData['name'] = "managing_bodies"
		treemapData['children'] = treemapChildren;


		//console.log(select);
		//console.log(treemapData);
		
	    res.render('homepage',{
	    	market_size: DataNormalizer.convertNumberToWords(totalSum),
	    	treemapData : treemapData,
	    	translate: translate,
			report_year : "2013",
			report_qurater : "3"

	    });
		
	});

};
