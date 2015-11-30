
/**
 * Module dependencies.
 */


var express = require('express')
  , portfolio = require('./routes/portfolio')
  , staticpages = require('./routes/staticpages')
  , homepage = require('./routes/homepage')
  , search = require('./routes/search')
  , http = require('http')
  , path = require('path')
  , FSUtil = require('./util/FSUtil')
  , csv = require('./routes/csv')
  , api = require('./routes/api')
  , apiV1 = require('./routes/api_v1')
  , test = require('./routes/test');
 
var templatizer = require('templatizer');
templatizer(__dirname + '/views/partials', __dirname + '/public/js/portfolio_templates.js');

//enable use of data_normalizer in client
FSUtil.copyFile('./core/data_normalizer.js', './public/js/data_normalizer.js',
      function(err){ 
        console.log(err);
        process.exit(1);
      }
    );
//enable use of Filter in client
FSUtil.copyFile('./core/filter.js', './public/js/filter.js',
			function(err){ 
				console.log(err);
				process.exit(1);
			}
		);

var app = express();


// all environments
app.set('port', process.env.PORT || 4000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

//browser caching, sets Cache-Control HTTP header
var oneWeek = 604800000;
app.use(express.static(path.join(__dirname, 'public'), { maxAge: oneWeek }));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

app.get('/managing_bodies_treemap.json', homepage.managing_body_treemap);
app.get('/issuers_treemap.json', homepage.issuers_treemap);
app.get('/', homepage.show);

app.get('/portfolio', portfolio.portfolio);
app.get('/investments', portfolio.investments);
app.get('/search-results', search.results)

app.get('/about', staticpages.about);
app.get('/privacy', staticpages.privacy);
app.get('/help', staticpages.help);
app.get('/refresh', staticpages.refresh);


app.post('/list', test.list);
app.get('/list', test.list);

app.post('/group',test.post);
app.get('/group',test.get);
  
app.get('/api/portfolio',api.portfolio);
app.get('/api/funds',api.funds);
app.get('/api/quarters',api.quarters);
app.get('/api/managing_bodies',api.managing_bodies);
app.get('/api/query',api.query);
app.get('/api/fair_values',api.fair_values);
app.get('/api/search',api.search);
app.get('/api/queryNames',api.queryNames);
app.get('/api/config',api.config);

app.get('/api/v1/list',apiV1.getDistinctValues);
app.get('/api/v1/portfolio',apiV1.portfolio);
app.get('/api/v1/funds',apiV1.funds);
app.get('/api/v1/quarters',apiV1.quarters);
app.get('/api/v1/managing_bodies',apiV1.managing_bodies);
app.get('/api/v1/query',apiV1.query);
app.get('/api/v1/fair_values',apiV1.fair_values);
app.get('/api/v1/search',apiV1.search);
app.get('/api/v1/queryNames',apiV1.queryNames);
app.get('/api/v1/config',apiV1.config);


app.get('/csv',csv.download);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
