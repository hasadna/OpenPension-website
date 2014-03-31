var Filter = require('../core/filter.js');
var DAL = require('../core/dal.js');
var DataNormalizer = require('../core/data_normalizer.js');
var metaTable = require('../common/MetaTable').getMetaTable();
var Categories = require('../core/categories.js');
var translate = require('../core/dictionary.js').translate;
var removeQoutes = DataNormalizer.removeQoutes;


function createTitle(filter){

                                                
  var title = "";
  var onlyManagingBody = 0;
  var nothingIsChosen = 0;
  var addTheWordNechasim =0;
  
  // TBD add categories 
  var managing_body = translate(filter.getConstraintData('managing_body'));
  var instrument_type = filter.getConstraintData('instrument_type');
  var industry = filter.getConstraintData('industry');
  var currency = filter.getConstraintData('currency');
  var rating = filter.getConstraintData('rating');
  var instrument_sub_type = filter.getConstraintData('instrument_sub_type');
  var instrument_id = filter.getConstraintData('instrument_id');
  var issuer = filter.getConstraintData('issuer');
        
        
  // nothing is chosen by the user
  if (managing_body== "" && instrument_type=="" && industry=="" && currency=="" && rating=="" && instrument_sub_type=="" && instrument_id==""  ) {
        nothingIsChosen = 1; 
  }  
  // only managing body is active 
  if (managing_body!= "" && instrument_type=="" && industry=="" && currency=="" && rating=="" && instrument_sub_type=="" && instrument_id==""  ) {
        onlyManagingBody = 1; 
  }
  // If managing body or instrument is not chosen add the word 'instruments' (nechasim) to have a NOSSE 
  //if (managing_body== "" && instrument_type=="" ) {
  if (instrument_type=="" && instrument_sub_type =="" && !onlyManagingBody) {
        addTheWordNechasim = 1;  
  }
        
  title +=  (managing_body != "")?onlyManagingBody?"תיק ההשקעות של " + managing_body : "כמה כסף משקיעה " + managing_body:"כמה כסף מושקע";
  title +=  (instrument_type != "")?" ב" + removeQoutes(instrument_type) :"";
  title +=  (instrument_sub_type != "")?(instrument_type != "")?" ו" + removeQoutes(instrument_sub_type):" ב" + removeQoutes(instrument_sub_type) :"";  
  title +=  (addTheWordNechasim)?" בנכסים" : "";  
  title +=  (addTheWordNechasim && issuer != "" )?" של " + issuer :( (instrument_type != "" || instrument_sub_type != "") && issuer != "" )?" של " + issuer :(issuer != "" )?" ב" + issuer:"";  
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

  var instrument_sub_type = filter.getConstraintData("instrument_sub_type")[0];
  var report_year = filter.getConstraintData("report_year")[0];
  var report_qurater = filter.getConstraintData("report_qurater")[0];
  


  //get available categories, for selection menu
  var availableCategories = Categories.getAvailableCategories(filter);
  

  //group by is not set? group by default field
  if (group_by == undefined){
    //console.log("group_by is undefined");
    // group_by = Categories.getNextGroupingCategory(filter);
    // filter.setConstraint("group_by",group_by);
  }



  //show data only for last quarter
  //TODO: get last quarter from DB
//  filter.addConstraint("report_year","2013");
//  filter.addConstraint("report_qurater","3");

  var lastQuarters = DataNormalizer.getLastFourQuarters("2013","3");
  
  DAL.groupBySummariesLimited(filter,5,
    function(groups){

        // console.log(groupByManagingBody[0]['group_sum']);
        // var sumByManagingBody = groupByManagingBody[0]['group_sum'];
        groups = DataNormalizer.normalizeData(groups);

        console.log(groups);  

        var total = DataNormalizer.convertNumberToWords(groups['total_sum']);
        // var totalByManagingBody = DataNormalizer.convertNumberToWords(groupByManagingBody['0']['group_sum']);

        // res.write(JSON.stringify(groups));
        // res.end();


        res.render('portfolio',{
            title : createTitle(filter),
            filter: filter,
            // quarters: quarters,
            total:total,      // total sum normalized (scaled)
            total_sum: groups['total_sum'], //total sum number
            // sumByManagingBody : sumByManagingBody,
            groups: groups,
            group_by: group_by,
            availableCategories: availableCategories, 
            convertNumberToWords:DataNormalizer.convertNumberToWords,
            translate: translate,
            escapeSpecialChars: DataNormalizer.escapeSpecialChars,  
            rfc3986EncodeURIComponent: DataNormalizer.rfc3986EncodeURIComponent,  
            removeQoutes: DataNormalizer.removeQoutes,
            // quarterSelect:quarterSelect,
            debug: debug == 'true',
            req: req,
            lastQuarters: lastQuarters,
            report_qurater: report_qurater,
            report_year: report_year
          });
        
      });
    

};
