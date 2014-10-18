
/**
 * Module dependencies.
 */


var express = require('express')
  , routes = require('./routes')
  , index = require('./routes/index')
  , portfolio = require('./routes/portfolio')
  , staticpages = require('./routes/staticpages')
  , entry = require('./routes/entry')
  , homepage = require('./routes/homepage')
  , http = require('http')
  , path = require('path')
  , FSUtil = require('./util/FSUtil')
  , csv = require('./routes/csv')
  , api = require('./routes/api')
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
//enable use of Categories in client
FSUtil.copyFile('./core/categories.js', './public/js/categories.js',
      function(err){ 
        console.log(err);
        process.exit(1);
      }
    );

var app = express();


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

//browser caching, sets Cache-Control HTTP header
var oneWeek = 604800000;
app.use(express.static(path.join(__dirname, 'public'), { maxAge: oneWeek }));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/managing_bodies_treemap.json', homepage.managing_body_treemap);
app.get('/issuers_treemap.json', homepage.issuers_treemap);
app.get('/', homepage.show);
app.get('/ver1', entry.show);

app.get('/portfolio', portfolio.portfolio);
app.get('/investments', portfolio.investments);

app.get('/entry', entry.show);

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


app.get('/csv',csv.download);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
