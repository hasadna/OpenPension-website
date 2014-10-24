var DAL = require('../core/dal.js');
var Filter = require('../core/filter.js');
var _ = require('underscore');

exports.quarters = function(req,res){

    //create filter from request (search string)
    var filter = Filter.fromGetRequest(req);

    DAL.groupByQuarters(filter,
      function(resultQuarters, resultQuery){

        //fill up missing quarters with sum 0
        for(var q = 0; q < 4; q++){
        
          if (resultQuarters[q] == undefined){
            resultQuarters[q] = {"fair_value":"0"};
          }
        
        }
     
        res.json(resultQuarters);

      });


};


exports.managing_bodies = function(req,res){
    DAL.getManagingBodies(function(bodies, bodiesQuery){
     
          res.json(bodies);

    });
}

exports.funds = function(req,res){

		//create filter from request (search string)
		var filter = Filter.fromGetRequest(req);

		var managing_body = filter.getConstraintData('managing_body')[0];  

    DAL.getFundsByManagingBody(managing_body,
      function(funds, fundsQuery){
   
  			res.json(funds);

		});

};

exports.portfolio = function(req, res){


		  //create filter from request (search string)
		  var filter = Filter.fromGetRequest(req);

	      DAL.groupByPortfolio(filter,
	                function(groups){

          //group results by group_field (e.g. issuer)
          _.each(groups, 
              function(value,key,list){
                  value['result'] = 
                      _.groupBy(value['result'],value['group_field']);
                  delete value['query'];
              }
          );


          //group result items by year and quarter
          _.each(groups,
            function(v,k,l){
            _.each(v['result'],
              function(v1,k1,l1){ 
                l1[k1] = _.groupBy(l1[k1],
                    function(v2,k2,l2){
                      return v2['report_year']+"_"+v2['report_qurater'];
                    }
                );
              }
            );
          });


	          res.json(groups);

        });

};