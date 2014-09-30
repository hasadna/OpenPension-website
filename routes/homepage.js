var _ = require('underscore');
var Filter = require('../core/filter.js');
var DAL = require('../core/dal.js');
var DataNormalizer = require('../core/data_normalizer.js');
var metaTable = require('../common/MetaTable').getMetaTable();
var Categories = require('../core/categories.js');
var translate = require('../core/dictionary.js').translate;
var config = require('../config')



var formatSizeDesc = function(sizeDesc) {
    return sizeDesc.number + " " + sizeDesc.scale + " שקל"
}

var asTreemapData = function(name, children) {
    return {
        'name' : name,
        'children' : children
    };
}

var sum = function(entities, property, decimals) {
    decimals = typeof decimals !== 'undefined' ? decimals : 2;
    property = typeof property !== 'undefined' ? property : 'fair_value';
    var total = _.reduce(entities, function(total, entity) { return total + Number(entity[property]); }, 0);
    return total.toFixed(decimals);
}


exports.managing_body_treemap = function(req,res){

    var filter = new Filter();
    filter.addConstraint("group_by","managing_body");

    filter.addConstraint("report_year", config.current_year);
    filter.addConstraint("report_qurater", config.current_quarter);


    DAL.groupBySummaries(filter,function(groups, select){

        var managing_bodies = groups[0].result;

        var children = _.map(managing_bodies, function(entity) {

            var fair_value = entity['fair_value'];
            var managing_body = entity['managing_body'];
            var sizeDesc = DataNormalizer.convertNumberToWords(fair_value);

            return {
               "name":managing_body,
               "size":fair_value,
               "translatedName":translate(managing_body),
               "sizeDescription" : formatSizeDesc(sizeDesc),
               "link": "/portfolio?managing_body=" + managing_body + "&report_year=" + config.current_year + "&report_qurater=" + config.current_quarter
            };
        });

        var totalSum = sum(managing_bodies);

        res.setHeader('Vary', 'Accept-Encoding');

        var oneWeek = 604800000;
        res.setHeader('Cache-Control', 'public, max-age='+oneWeek);        
        
        res.json(asTreemapData('managing_bodies', children));
    });


}


exports.issuers_treemap = function(req,res){

    var filter = new Filter();
    filter.addConstraint("group_by","issuer");

    filter.addConstraint("report_year", config.current_year);
    filter.addConstraint("report_qurater", config.current_quarter);


    DAL.groupBySummaries(filter,function(groups, select){

        var issuers = groups[0].result;

        var children = _.map(issuers, function(entity) {

            var fair_value = entity['fair_value'];
            var issuer = entity['issuer'];
            var sizeDesc = DataNormalizer.convertNumberToWords(fair_value);

            return {
                "name":issuer,
                "size":fair_value,
                "translatedName":translate(issuer),
                "sizeDescription" : formatSizeDesc(sizeDesc),
                //"link": "/portfolio?issuer=" + issuer + "&report_year=" + current_year + "&report_qurater=" + current_quarter
                "link": "#"
            };
        });

        var totalSum = sum(issuers);

        res.setHeader('Vary', 'Accept-Encoding');

        var oneWeek = 604800000;
        res.setHeader('Cache-Control', 'public, max-age='+oneWeek);        

        res.json(asTreemapData('issuers', children));
    });

}

exports.show = function(req, res){

    //create query by managing bodies
    var filter = new Filter();
    filter.addConstraint("group_by","managing_body");
    filter.addConstraint("report_year", config.current_year);
    filter.addConstraint("report_qurater", config.current_quarter);

    //perform query
    DAL.groupBySummaries(filter,function(groups, select){

        var managing_bodies = groups[0].result;

        var filterWithoutGroup = filter.clone();
        filterWithoutGroup.removeField("group_by");

        var totalSum = sum(managing_bodies);

        res.render('homepage',{
            market_size: DataNormalizer.convertNumberToWords(totalSum),
            title: "פנסיה פתוחה",
            filterWithoutGroup: filterWithoutGroup
        });

    });

};
