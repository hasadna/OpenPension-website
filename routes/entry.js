var Filter = require('../core/filter.js');
var DAL = require('../core/dal.js');
var DataNormalizer = require('../core/data_normalizer.js');
var metaTable = require('../common/MetaTable').getMetaTable();
var Categories = require('../core/categories.js');
var translate = require('../core/dictionary.js').translate;
var removeQoutes = DataNormalizer.removeQoutes;
var config = require('../config')


function createTitle(filter){

                                                
  var title = "";
  var onlyManagingBody = 0;
  var nothingIsChosen = 0;
  var addTheWordNechasim =0;
  
  // TBD add categories 
  var managing_body = translate(filter.getConstraintData('managing_body'));
  var liquidity = filter.getConstraintData('liquidity');
  var industry = filter.getConstraintData('industry');
  var currency = filter.getConstraintData('currency');
  var rating = filter.getConstraintData('rating');
  var asset_type = filter.getConstraintData('asset_type');
  var instrument_id = filter.getConstraintData('instrument_id');
  var issuer = filter.getConstraintData('issuer');
        
        
  // nothing is chosen by the user
  if (managing_body== "" && liquidity=="" && industry=="" && currency=="" && rating=="" && asset_type=="" && instrument_id==""  ) {
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
        
  title +=  (managing_body != "")?onlyManagingBody?"כמה כסף מנהלת " + managing_body : "כמה כסף משקיעה " + managing_body:"כמה כסף מושקע";
  title +=  (liquidity != "")?" ב" + removeQoutes(liquidity) :"";
  title +=  (asset_type != "")?(liquidity != "")?" ו" + removeQoutes(asset_type):" ב" + removeQoutes(asset_type) :"";  
  title +=  (addTheWordNechasim)?" בנכסים" : "";  
  title +=  (addTheWordNechasim && issuer != "" )?" של " + issuer :( (liquidity != "" || asset_type != "") && issuer != "" )?" של " + issuer :(issuer != "" )?" ב" + issuer:"";  
  title +=  (industry != "")?" בענף ה" + industry :"";        
  title +=  (currency != "")?" שנקנו ב" + currency :"";
  title +=  (rating != "")?" בדירוג " + rating :"";
  return title;  
}

exports.show = function(req, res){

  //create filter from request (search string)
  var filter = Filter.fromGetRequest(req);
  
  var group_by = filter.getConstraintData("group_by")[0];

  //check for debug flag  
  var debug = filter.getConstraintData("debug")[0];
  filter.removeField("debug");

  var asset_type = filter.getConstraintData("asset_type")[0];

  //get available categories, for selection menu
  var availableCategories = Categories.getAvailableCategories(filter);
  
  //group by is not set? group by default field
  if (group_by == undefined){
    //console.log("group_by is undefined");
    group_by = Categories.getNextGroupingCategory(filter);
    filter.setConstraint("group_by",group_by);
  }




  //show data only for last quarter
  //TODO: get last quarter from DB
  filter.addConstraint("report_year", config.current_year);
  filter.addConstraint("report_qurater", config.current_quarter);


  //special case for managing body page
  //where we want to show precentage of total market sum
  var gfilter = filter.clone();
  var drillDownDepth = filter.getDrillDownDepth();


  if (filter.hasConstraint("managing_body") && 
        drillDownDepth == 1){
      gfilter.removeField("managing_body");
  }
  
  DAL.groupBySummaries(filter,
    function(groups){
    DAL.groupByQuarters(filter,
      function(quarters, quarterSelect){
      DAL.groupByManagingBody(gfilter,
        function(groupByManagingBody){

        var sumByManagingBody = groupByManagingBody[0]['fair_value'];
        groups = DataNormalizer.normalizeData(groups);

 //       console.log(groups);  

        var total = DataNormalizer.convertNumberToWords(groups['total_sum']);
        var totalByManagingBody = DataNormalizer.convertNumberToWords(groupByManagingBody['0']['fair_value']);

        var qPercentage = [];
        
        //calculate quarter percentage (for graph)
        //and put dummy data in missing quarters
        for (var i = 0; i < 4 ; i++){
            if (quarters[i] != undefined){
              qPercentage[i] = Number(quarters[i]['fair_value'])/
                Number(groupByManagingBody[i]['fair_value']) * 100;
            }
            else{
              quarters[i] = {};
              quarters[i]['report_year'] = "0";
              quarters[i]['report_qurater'] = "0";
              qPercentage[i] = -1;
          
            }
        }


        res.render('entry',{
            title : createTitle(filter),
            filter: filter,
            quarters: quarters,
            total:total,      // total sum normalized (scaled)
            total_sum: groups['total_sum'], //total sum number
            sumByManagingBody : sumByManagingBody,
            groups: groups,
            group_by: group_by,
            availableCategories: availableCategories, 
            convertNumberToWords:DataNormalizer.convertNumberToWords,
            translate: translate,
            escapeSpecialChars: DataNormalizer.escapeSpecialChars,  
            rfc3986EncodeURIComponent: DataNormalizer.rfc3986EncodeURIComponent,  
            removeQoutes: DataNormalizer.removeQoutes,
            quarterSelect:quarterSelect,
            debug: debug == 'true',
            req: req,
            groupByManagingBody: groupByManagingBody,
            qPercentage: qPercentage,
            drillDownDepth: drillDownDepth
          });
        
      });
    

      });
  });
};
