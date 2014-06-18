var Filter = require('../core/filter.js');
var DAL = require('../core/dal.js');
var DataNormalizer = require('../core/data_normalizer.js');
var metaTable = require('../common/MetaTable').getMetaTable();
var Categories = require('../core/categories.js');



exports.show = function(req, res){

		var market_size = 1200000000000;
  
        res.render('homepage',{
        	market_size: DataNormalizer.convertNumberToWords(market_size)

        });

};
