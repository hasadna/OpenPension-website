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
  var firstInTitle ="";
 
  var onlyManagingBody = 0;
  var onlyFundName = 0;
  var nothingIsChosen = 0;
  var addTheWordNechasim =0;
  var instrumentNameIsChosen = 0;
  var onlyIssuer = 0;
  
  var numberOfChosenFilters = 0; 
  
  var managing_body = translate(filter.getConstraintData('managing_body'));
  var fund_name = filter.getConstraintData('fund_name');
  //
  var instrument_name = filter.getConstraintData('instrument_name');
  //
  var asset_type = filter.getConstraintData('asset_type');
  var liquidity = filter.getConstraintData('liquidity');
  var reference_index = filter.getConstraintData('reference_index');
  var issuer = filter.getConstraintData('issuer');
  var rating = filter.getConstraintData('rating');
  var activity_industry = filter.getConstraintData('activity_industry');
  var currency = filter.getConstraintData('currency');
  // unused 
  var instrument_id = filter.getConstraintData('instrument_id');
  var industry = filter.getConstraintData('industry');

 
  if (asset_type!="") {numberOfChosenFilters=numberOfChosenFilters+1; if (firstInTitle=="") {firstInTitle="asset_type";};};
  if (reference_index!="") {numberOfChosenFilters=numberOfChosenFilters+1; if (firstInTitle=="") {firstInTitle="reference_index";};};
  if (liquidity!="") {numberOfChosenFilters=numberOfChosenFilters+1; if (firstInTitle=="") {firstInTitle="liquidity";};};
  if (issuer!="") {numberOfChosenFilters=numberOfChosenFilters+1; if (firstInTitle=="") {firstInTitle="issuer";};};
  if (rating!="") {numberOfChosenFilters=numberOfChosenFilters+1; if (firstInTitle=="") {firstInTitle="rating";};};
  if (activity_industry!="") {numberOfChosenFilters=numberOfChosenFilters+1; if (firstInTitle=="") {firstInTitle="activity_industry";};};
  if (currency!="") {numberOfChosenFilters=numberOfChosenFilters+1; if (firstInTitle=="") {firstInTitle="currency";};};
  
  // nothing is chosen by the user
  if (managing_body== "" && liquidity=="" && industry=="" && currency=="" && rating=="" && instrument_id==""  ) {
        nothingIsChosen = 1; 
  }  
  // only managing body is active 
  if (managing_body!= "" && filter.getDrillDownDepth() == 1 ) {
        onlyManagingBody = 1; 
  }
  // only issuer is active 
  if (issuer!="" && liquidity=="" && industry=="" && activity_industry=="" && currency=="" && rating=="" && asset_type=="" && instrument_id=="" && fund_name=="" && instrument_name=="") {
        onlyIssuer = 1; 
  }  
  
  
  if (fund_name!= "" &&  filter.getDrillDownDepth() == 1 ||
      fund_name!= "" && managing_body!= "" &&
       filter.getDrillDownDepth() == 2 ) {
        onlyFundName = 1; 
  }
  
  // If managing body or instrument is not chosen add the word 'instruments' (nechasim) to have a NOSSE 
  //if (managing_body== "" && liquidity=="" ) {
  if (liquidity=="" && asset_type =="" && !onlyManagingBody) {
        addTheWordNechasim = 1;  
  }
  

  title +=  (managing_body != "")?onlyManagingBody? managing_body : managing_body + " > " : "";
  title +=  (instrument_name != "")? " " + instrument_name:"";

  if (instrument_name=="") {
	  title+= (asset_type != "")?((firstInTitle=="asset_type")?((numberOfChosenFilters==1)? " ב" : "") : ((numberOfChosenFilters==1)? "" : " ב")) + asset_type + " " + numberOfChosenFilters: "" ;
	  title+= (reference_index != "")?((firstInTitle=="reference_index")?((numberOfChosenFilters==1)? " ב" : "") : ((numberOfChosenFilters==1)? "" : " ב")) + "תעודות סל על מדד " + reference_index + " " : "" ;
	  title+= (liquidity != "")?((firstInTitle=="liquidity")?((numberOfChosenFilters==1)? " ב" : "") : ((numberOfChosenFilters==1)? "" : " ב")) + "רמת נזילות " + liquidity + " " : "" ;
	  title+= (issuer != "")?((firstInTitle=="issuer")?((numberOfChosenFilters==1)? "" : "") : ((numberOfChosenFilters==1)? "" : " של ")) + issuer + " " : "" ;
	  title+= (rating != "")?((firstInTitle=="rating")?((numberOfChosenFilters==1)? " ב" : "") : ((numberOfChosenFilters==1)? "" : " ב")) + "דירוג " + rating + " " : "" ;
	  title+= (activity_industry != "")?((firstInTitle=="activity_industry")?((numberOfChosenFilters==1)? " ב" : "") : ((numberOfChosenFilters==1)? "" : " ב")) + "ענף ה" + activity_industry + " " : "" ;
	  title+= (currency != "")?((firstInTitle=="currency")?((numberOfChosenFilters==1)? " ב" : "") : ((numberOfChosenFilters==1)? "" : " ב")) + translate(currency) + " " : "" ;
  }

  return title;  
}

function getReportType(filter){
  if ( (filter.getDrillDownDepth() == 1 && 
        filter.hasConstraint("managing_body")) ||
        (filter.getDrillDownDepth() == 1 && 
        filter.hasConstraint("fund_name")) ||
        (filter.getDrillDownDepth() == 2 && 
        filter.hasConstraint("managing_body") && 
        filter.hasConstraint("fund_name"))
        ){
      return "managing_body";
  }
  else{
    return "investment";
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


exports.portfolio = function(req, res){

  //create filter from request (search string)
  var filter = Filter.fromGetRequest(req);
  
  //check for debug flag  
  var debug = filter.getConstraintData("debug")[0];
  filter.removeField("debug");

  //TODO: get current year and quarter from DB
  if (!filter.hasConstraint("report_year")){
      filter.addConstraint("report_year","2013");
  }

  if (!filter.hasConstraint("report_qurater")){
      filter.addConstraint("report_qurater","3");
  }


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
  
  //console.log("=====totalPensionFundQuarters==================");  
  //console.log(JSON.stringify(totalPensionFundQuarters));  
  
  //console.log("=====totalPensionFundQuery==================");  
  //console.log(JSON.stringify(totalPensionFundQuery));  
  //console.log("===============================");  


  //group filter by quarters
  DAL.groupByQuarters(filter,
      function(quarters, quartersQuery){
 
  //console.log("=====QUARTERS==================");
  //console.log(JSON.stringify(quarters));  
  //console.log("=======quartersQuery=================");
  //console.log(JSON.stringify(quartersQuery));  
  //console.log("===============================");  


    //add group by fields for display
    var group_by_fields = Groups.getGroups(filter);

    for( i in group_by_fields){
      filter.addConstraint("group_by",group_by_fields[i]);
    }
    
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
            report_type: getReportType(filter),
            report_title : createTitle(filter),
            drillDown : filter.getDrillDown()
          });        
        });
      });
    });
  });
};
