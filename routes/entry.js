var Filter = require('./filter.js');
var jsonJS = require('./json.js');

/*
 * GET home page.
 */

exports.show = function(req, res){
  var filter = Filter.fromRequest(req);

  jsonJS.groupBySummaries(filter,
    function(data){
      data = JSON.parse(data);
      res.render('entry',{
        entry: { title: "השקעות של הפניקס",total_value: "5.87 מיליארד ₪" },
        elements: data
      });
    }
  );
};
