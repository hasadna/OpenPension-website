var DAL = require('../core/dal.js');
var Filter = require('../core/filter.js');
var _ = require('underscore');
var dictionary = require('../core/dictionary.js');
var DataNormalizer = require('../core/data_normalizer.js');
var config = require('../config');
var Promise = require('bluebird');

exports.quarters = function(req,res){

    //create filter from request (search string)
    var filter = Filter.fromGetRequest(req);

    DAL.groupByQuarters(filter,
      function(err, quarters, resultQuery){

          var report_year = filter.getConstraintData("report_year")[0];
          var report_qurater = filter.getConstraintData("report_qurater")[0];

          var lastQuarters = DataNormalizer.getLastQuarters(report_year, report_qurater, 4);

          quarters = _.groupBy(quarters,
                    function(v2,k2,l2){
                      return v2['report_year']+"_"+v2['report_qurater'];
                    });
              

          //fill up missing quarters with sum 0
          if (Object.keys(quarters).length < 4 ){
            for(var q = 0; q < 4; q++){
            
              if (quarters[lastQuarters[q].str] == undefined){
                quarters[lastQuarters[q].str] = [{"fair_value":"0"}];
              }            
            }
          }
     
        res.json(quarters);

      });


};


exports.managing_bodies = function(req,res){
    DAL.getManagingBodies(function(err, bodies, bodiesQuery){
     
          res.json(bodies);

    });
}

exports.funds = function(req,res){

		//create filter from request (search string)
		var filter = Filter.fromGetRequest(req);

		var managing_body = filter.getConstraintData('managing_body')[0];  

    DAL.getFundsByManagingBody(managing_body,
      function(err, funds, fundsQuery){
   
  			res.json(funds);

		});

};

exports.portfolio = function(req, res){


		  //create filter from request (search string)
		  var filter = Filter.fromGetRequest(req);

      DAL.groupByPortfolio(filter,
                function(err, groups){

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

exports.query = function(req,res){

    //create filter from request (search string)
    var filter = Filter.fromGetRequest(req);

    if ( filter.getConstrainedFields().length == 0 ){
      res.json({'error':'Query is empty','return_code':'-7'})
    }

    DAL.singleQuery(filter, function(err, result){
      res.json(result);
    });

};

exports.fair_values = function(req,res){

    //create filter from request (search string)
    var filter = Filter.fromGetRequest(req);

    if ( filter.getConstrainedFields().length == 0 ){
      res.json({'error':'Query is empty','return_code':'-7'})
    }

    DAL.groupBySummaries(filter, function(err, result, query){
      res.json(result);
    });

}


exports.search = function(req,res){

    var searchTerm = req.query['q'];
    var page = req.query['p'];

    if ( searchTerm == undefined ){
      res.json({'error':'Query is empty','return_code':'-7'})
    }

    DAL.search(searchTerm, page, function(err, result, query){
      res.json(result);
    });

}



exports.queryNames = function(req, res, next){

    var term = req.query['q'];
    var field = req.query['f'];
    // var page = req.query['p'];

    if ( term == undefined ){
      res.json({'error':'Query is empty','return_code':'-7'})
    }

    exports.querySearchTerm(term)
    .then(function(result){
      res.json(result);
    })
    .catch(res.error);
}


var translatedManagingBodies=[];

DAL.getManagingBodies(function(err, rows){
  _.each(rows,function(row){
    translatedManagingBodies.push(
    {
      "translated_managing_body": dictionary.translate(row.managing_body),
      "managing_body":row.managing_body
    });
  })
});

function findInManagingBody(term){
  if (term == undefined || term == ''){
    return [];
  }

  var res = [];
  return _.filter(translatedManagingBodies, 
      function(managing_body){
        return managing_body.translated_managing_body.indexOf(term) > -1;
      });
}

exports.querySearchTerm = function(term, rowLimit){

  return new Promise(function(resolve, reject){
      DAL.searchInFields(term, rowLimit, function(err, result, query){
        if (err){
          reject(err);
        }

        result['managingBodies'] = findInManagingBody(term);

        resolve(result);
      });

  });
}



//get current system configuration
exports.config = function(req,res){

  res.json(
    {
      "current_year":config.current_year, 
      "current_quarter":config.current_quarter
    }
  );
}

