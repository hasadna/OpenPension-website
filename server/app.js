'use strict';

var express = require('express');
var http = require('http');
var path = require('path');
var async = require('async');
var hbs = require('express-hbs');




// init express
var app = express();

app.configure(function(){
    app.set('port', process.env.PORT || 3000);

    app.set('view engine', 'handlebars');
    app.set('views', __dirname + '../app/scripts/views');
});

// set logging
app.use(function(req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});

// mount static
app.use(express.static( path.join( __dirname, '../app') ));
app.use(express.static( path.join( __dirname, '../.tmp') ));


// route index.html
app.get('/', function(req, res){
  res.sendfile( path.join( __dirname, '../app/index.html' ) );
});

// start server
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express App started!');
});


var portfolio = require('./routes/portfolio')
  , staticpages = require('./routes/staticpages')
  , homepage = require('./routes/homepage')
  , search = require('./routes/search')
  , http = require('http')
  , path = require('path')
  , FSUtil = require('./util/FSUtil')
  , csv = require('./routes/csv')
  , api = require('./routes/api')
  , test = require('./routes/test');

app.get('/treemap/managing_bodies', homepage.managing_body_treemap);
app.get('/treemap/issuers', homepage.issuers_treemap);
app.get('/api/portfolio',api.portfolio);
app.get('/api/funds',api.funds);
app.get('/api/quarters',api.quarters);
app.get('/api/managing_bodies',api.managing_bodies);
app.get('/api/query',api.query);
app.get('/api/fair_values',api.fair_values);
app.get('/api/search',api.search);
app.get('/api/queryNames',api.queryNames);
app.get('/api/config',api.config);
app.get('/csv',csv.download);
