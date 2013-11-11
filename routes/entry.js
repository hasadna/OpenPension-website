var Filter = require('../core/filter.js');
var DAL = require('../core/dal.js');
var DataNormalizer = require('../core/data_normalizer.js');
var metaTable = require('../common/MetaTable').getMetaTable();
var Categories = require('../core/categories.js');
var translate = require('../core/dictionary.js').translate;


//hello hello
exports.show = function(req, res){

  //create filter from request (search string)
  var filter = Filter.fromGetRequest(req);
  var group_by = filter.getConstraintData("group_by")[0];
  var instrument_sub_type = filter.getConstraintData("instrument_sub_type")[0];
  

  //get available categories, for selection menu
  //(by instrument_sub_type, if defined)  
  var availableCategories = Categories.getAvailableCategories(instrument_sub_type,filter);


  //group by is empty? set to default
  if (group_by == undefined){
    group_by = Categories.getGroupingCategory(instrument_sub_type, filter);
    filter.setConstraint("group_by",group_by);
  }



					
  //show data only for last quarter
  //TODO: get last quarter from DB
  filter.addConstraint("report_year","2013");
  filter.addConstraint("report_qurater","2");

						
  var title = "";
  var onlyManagingBody = 0;
  var nothingIsChosen = 0;
  var addTheWordNechasim =0;
  
  // TBD add categories 
  var managing_body = filter.getConstraintData('managing_body');
  var instrument_type = filter.getConstraintData('instrument_type');
  var industry = filter.getConstraintData('industry');
  var currency = filter.getConstraintData('currency');
  var rating = filter.getConstraintData('rating');
  var instrument_sub_type = filter.getConstraintData('instrument_sub_type');
  var instrument_id = filter.getConstraintData('instrument_id');

  // nothing is chosen by the user
  if (managing_body== "" && instrument_type=="" && industry=="" && currency=="" && rating=="" && instrument_sub_type=="" && instrument_id==""  ) {
	nothingIsChosen = 1; 
  }  
  // only managing body is active 
  if (managing_body!= "" && instrument_type=="" && industry=="" && currency=="" && rating=="" && instrument_sub_type=="" && instrument_id==""  ) {
	onlyManagingBody = 1; 
  }
  // If managing body or instrument is not chosen add the word 'instruments' (nechasim) to have a NOSSE 
  if (managing_body== "" && instrument_type=="" ) {
	addTheWordNechasim = 1; 
  }
  
  title +=  (managing_body != "")?onlyManagingBody?"כמה כסף מנהלת " + managing_body : "כמה כסף משקיעה " + managing_body:"כמה כסף מושקע";
  title +=  (instrument_type != "")?" ב" + instrument_type :"";
  title +=  (addTheWordNechasim)?" בנכסים" : "";
  title +=  (industry != "")?" בענף ה" + industry :"";	
  title +=  (currency != "")?" שנקנו ב" + currency :"";
  title +=  (rating != "")?" בדירוג " + rating :"";
  
  
  
  DAL.groupBySummaries(filter,
    function(groups){
    DAL.groupByQuarters(filter,
      function(quarters, select){
        groups = DataNormalizer.normalizeData(groups);
        total = DataNormalizer.convertNumberToWords(groups['total_sum']);

        res.render('entry',{
			  title : title,
              filter: filter,
              quarters: quarters,
              total: total,
              groups: groups,
              group_by: group_by,
              availableCategories: availableCategories, 
              convertNumberToWords:DataNormalizer.convertNumberToWords,
              translate: translate,
              select:select,
              req: req
            });
      });
  });
  
};
