
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , entry = require('./routes/entry')
  , http = require('http')
  , path = require('path')
  , json = require('./routes/json');

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
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

app.get('/entry', entry.show);

app.post('/json', json.list);
app.get('/json', json.list);

app.post('/group',json.post);
app.get('/group',json.get);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
