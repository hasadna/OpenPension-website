var Filter = require('../core/filter.js');
var DAL = require('../core/dal.js');
var DataNormalizer = require('../core/data_normalizer.js');
var metaTable = require('../common/MetaTable').getMetaTable();
var Categories = require('../core/categories.js');



exports.show = function(req, res){

  
  var filter = new Filter();

  //for index page, group by is not set,
  //group by default field
  var group_by = Categories.getNextGroupingCategory(filter);
  filter.setConstraint("group_by",group_by);


  //show data only for last quarter
  //TODO: get last quarter from DB
  filter.addConstraint("report_year","2013");
  filter.addConstraint("report_qurater","2");


  DAL.groupBySummaries(filter,


    function(groups){	

        groups = DataNormalizer.normalizeData(groups);
        var total = DataNormalizer.convertNumberToWords(groups['total_sum']);

        res.render('index',{
          entry: { total_value: total },
          groups: groups,
          req: req,
          total: total
        });

    }
  );
  
};
