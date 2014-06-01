var _ = require('underscore');
var Filter = require('../core/filter.js');
var DAL = require('../core/dal.js');
var DataNormalizer = require('../core/data_normalizer.js');
var metaTable = require('../common/MetaTable').getMetaTable();
var Groups = require('../core/groups.js');
var translate = require('../core/dictionary.js').translate;
var removeQoutes = DataNormalizer.removeQoutes;


function createTitle(filter){

                                                
  var title = "";
  var onlyManagingBody = 0;
  var nothingIsChosen = 0;
  var addTheWordNechasim =0;
  
  // TBD add groups 
  var managing_body = translate(filter.getConstraintData('managing_body'));
  var liquidity = filter.getConstraintData('liquidity');
  var industry = filter.getConstraintData('industry');
  var currency = filter.getConstraintData('currency');
  var rating = filter.getConstraintData('rating');
  var asset_type = filter.getConstraintData('asset_type');
  var instrument_id = filter.getConstraintData('instrument_id');
  var issuer = filter.getConstraintData('issuer');
        
        
  // nothing is chosen by the user
  if (managing_body== "" && liquidity=="" && industry=="" && currency=="" && rating=="" && instrument_sub_type=="" && instrument_id==""  ) {
        nothingIsChosen = 1; 
  }  
  // only managing body is active 
  if (managing_body!= "" && liquidity=="" && industry=="" && currency=="" && rating=="" && asset_type=="" && instrument_id==""  ) {
        onlyManagingBody = 1; 
  }
  // If managing body or instrument is not chosen add the word 'instruments' (nechasim) to have a NOSSE 
  //if (managing_body== "" && liquidity=="" ) {
  if (liquidity=="" && asset_type =="" && !onlyManagingBody) {
        addTheWordNechasim = 1;  
  }
        
  title +=  (managing_body != "")?onlyManagingBody?"תיק ההשקעות של " + managing_body : "כמה כסף משקיעה " + managing_body:"כמה כסף מושקע";
  title +=  (liquidity != "")?" ב" + removeQoutes(liquidity) :"";
  title +=  (asset_type != "")?(liquidity != "")?" ו" + removeQoutes(asset_type):" ב" + removeQoutes(asset_type) :"";  
  title +=  (addTheWordNechasim)?" בנכסים" : "";  
  title +=  (addTheWordNechasim && issuer != "" )?" של " + issuer :( (liquidity != "" || asset_type != "") && issuer != "" )?" של " + issuer :(issuer != "" )?" ב" + issuer:"";  
  title +=  (industry != "")?" בענף ה" + industry :"";        
  title +=  (currency != "")?" שנקנו ב" + currency :"";
  title +=  (rating != "")?" בדירוג " + rating :"";
  return title;  
}

function getReportType(filter){
  if (filter.getDrillDownDepth() == 1){
    if (filter.hasConstraint("managing_body") || 
      filter.hasConstraint("fund_name")){
      return "תיק השקעות";
    }
  }
  else{
    return "השקעה";
  }

}


var plurals = {
  'managing_body': 'הגופים המוסדיים', 
  'currency' : 'סוגי המטבעות', 
  'rating':'הדירוגים', 
  'instrument_id':'מספרי הנכסים',
  'issuer':'המנפיקים',
  'instrument_name':'שמות הנכסים',
  'activity_industry':'ענפי הפעילות',
  'reference_index':'המדדים',
  'fund_name' : 'הקופות',
  'liquidity' : 'רמות הנזילות',
  'asset_type' : 'סוגי הנכסים'
}


exports.investments = function(req, res){

  
  //create filter from request (search string)
  var filter = Filter.fromGetRequest(req);
  var group_by = filter.getConstraintData('group_by')[0];

  if (group_by == undefined){
    res.end("group_by is missing");
  }

  //check for debug flag  
  var debug = filter.getConstraintData("debug")[0];
  filter.removeField("debug");


  var lastQuarters = DAL.getLastQuarters("2013","3",4);

  //group filter by quarters
  DAL.groupByInvestments(filter,
      function(groups, select){

        // DEBUG
        // console.log("=====select==================");  
        // console.log(JSON.stringify(select));  
        // console.log("=====quarters==================");  
        // console.log(JSON.stringify(quarters));  
        // console.log("===============================");  



          //sum groups to quarters
          quartersSums = _.groupBy(groups,
                function(v2,k2,l2){
                  return v2['report_year']+"_"+v2['report_qurater'];
                });

          _.each(quartersSums,
            function(v,k,l){
                quartersSums[k] = _.reduce(quartersSums[k],function(memo, group){ return memo + Number(group['group_sum']); }, 0);
          });



          //group results by group_field (e.g. issuer)
          groups = _.groupBy(groups, group_by);


          // group result items by year and quarter
          _.each(groups,
            function(v,k,l){
                groups[k] = _.groupBy(groups[k],
                    function(v2,k2,l2){
                      return v2['report_year']+"_"+v2['report_qurater'];
                    }
            );
          });

        // DEBUG
        // res.json(quartersSums);

        res.render('investments',{
            filter: filter,
            query:select,
            translate: translate,
            convertNumberToWords:DataNormalizer.convertNumberToWords,
            escapeSpecialChars: DataNormalizer.escapeSpecialChars,  
            rfc3986EncodeURIComponent: DataNormalizer.rfc3986EncodeURIComponent,  
            removeQoutes: DataNormalizer.removeQoutes,
            debug: debug == 'true',
            req: req,
            group_by: group_by,
            plurals: plurals,
            groups: groups,
            lastQuarters: lastQuarters,
            quartersSums: quartersSums
          });

      } 
  );

}


exports.show = function(req, res){

  //create filter from request (search string)
  var filter = Filter.fromGetRequest(req);
  
  //check for debug flag  
  var debug = filter.getConstraintData("debug")[0];
  filter.removeField("debug");

  var asset_type = filter.getConstraintData("asset_type")[0];
  var report_year = filter.getConstraintData("report_year")[0];
  var report_qurater = filter.getConstraintData("report_qurater")[0];
  


  var lastQuarters = DAL.getLastQuarters("2013","3",4);
  //console.log(lastQuarters);

  //special case for managing body page
  //where we want to show precentage of total market sum
  var totalPensionFundFilter = filter.clone();
  var drillDownDepth = filter.getDrillDownDepth();


  if (totalPensionFundFilter.hasConstraint("managing_body") && 
        drillDownDepth == 1){
      totalPensionFundFilter.removeField("managing_body");
  }

//relative to total fund or current managing_body
DAL.groupByManagingBody(totalPensionFundFilter,
  function(totalPensionFundQuarters, totalPensionFundQuery){
  console.log("=====totalPensionFundQuarters==================");  
  console.log(JSON.stringify(totalPensionFundQuarters));  
  
  console.log("=====totalPensionFundQuery==================");  
  console.log(JSON.stringify(totalPensionFundQuery));  
  console.log("===============================");  


  //group filter by quarters
  DAL.groupByQuarters(filter,
      function(quarters, quartersQuery){
  console.log("=====QUARTERS==================");

  console.log(JSON.stringify(quarters));  
  console.log("=======quartersQuery=================");
  console.log(JSON.stringify(quartersQuery));  
  console.log("===============================");  

    DAL.groupByPortfolio(filter,
        function(groups){

      //console.log("managing_body="+filter.getConstraintData('managing_body'));

      DAL.getFundsByManagingBody(filter.getConstraintData('managing_body'),
        function(funds){

          //console.log(funds);
          

          var origGroups = JSON.parse(JSON.stringify(groups));

          //group results by group_field (e.g. issuer)
          _.each(groups, 
              function(value,key,list){
                  value['result'] = 
                      _.groupBy(value['result'],value['group_field'])
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
                )
              }
            );
          });



        //console.log(JSON.stringify(groups));  
          
        var total = DataNormalizer.convertNumberToWords(groups['total_sum']);
        

        res.render('portfolio',{
            title : createTitle(filter),
            filter: filter,
            total_sum_words:DataNormalizer.convertNumberToWords(quarters[0]['group_sum']),      // total sum normalized (scaled)
            groups: groups,
            convertNumberToWords:DataNormalizer.convertNumberToWords,
            translate: translate,
            escapeSpecialChars: DataNormalizer.escapeSpecialChars,  
            rfc3986EncodeURIComponent: DataNormalizer.rfc3986EncodeURIComponent,  
            removeQoutes: DataNormalizer.removeQoutes,
            debug: debug == 'true',
            req: req,
            lastQuarters: lastQuarters,
            report_qurater: report_qurater,
            report_year: report_year,
            totalPensionFundQuarters: totalPensionFundQuarters,
            plurals: plurals,
            totalPensionFundQuery:totalPensionFundQuery,
            quarters:quarters,
            funds:funds,
            origGroups:origGroups,
            report_type: getReportType(filter)
          });        
        });
      });
    });
  });
};
