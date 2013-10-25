var Filter = require('../core/filter.js');
var DAL = require('../core/dal.js');
var DataNormalizer = require('../core/data_normalizer.js');
var metaTable = require('../common/MetaTable').getMetaTable();
var Categories = require('../core/categories.js');

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


  DAL.groupBySummaries(filter,
    function(groups){

    groups = DataNormalizer.normalizeData(groups);
    total = DataNormalizer.convertNumberToWords(groups['total_sum']);

    res.render('entry',{
          entry: { title: "מופקדים בקופות הגמל", total_value: JSON.stringify(filter) },
          filter: filter,
          total: total,
          groups: groups,
          group_by: group_by,
          availableCategories: availableCategories, 
          convertNumberToWords:DataNormalizer.convertNumberToWords,
          columnDictionary: DataNormalizer.columnDictionary,
          req: req	
        });
    }
  );
  
};
