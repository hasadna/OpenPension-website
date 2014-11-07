var _ = require('underscore');
var Filter = require('../core/filter.js');
var DAL = require('../core/dal.js');
var DataNormalizer = require('../core/data_normalizer.js');
var metaTable = require('../common/MetaTable').getMetaTable();
var translate = require('../core/dictionary.js').translate;
var config = require('../config')

exports.show = function(req, res){

    var searchTerm = req.query['q'];
    var page = req.query['p'];

    if (searchTerm == undefined){
        searchTerm = "";
    }
    
    DAL.search(searchTerm, page, function(result, query){

        res.render('search',{
            rows: result.rows,
            page: result.page,
            total_row_count : result.total_row_count,
            total_pages : result.total_pages,
            report_type: "search",
            report_title: searchTerm,
            results_per_page: result.results_per_page,
            searchTerm: searchTerm
        });

    });

};
