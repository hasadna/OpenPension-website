var config = require('../config')
var api = require('./api.js');

exports.results = function(req, res){

    var searchTerm = req.query['q'];
    var page = req.query['p'];

    if (searchTerm == undefined){
        searchTerm = "";
    }

    api.querySearchTerm(searchTerm, -1)
    .then(function(results){
        results['searchTerm'] = searchTerm;
        res.render('search-results',results);
    })
    .catch(function(err){
        res.statusCode = 400;
        res.send(err);
    });

};
