define(function(require) {
  'use strict';
  var Backbone = require('backbone');
  var Report = require('/models/Report.js');
  var host = 'http://localhost:5000';

  host = '/api';
  
  var Reports = Backbone.Collection.extend({

    model: Report,
    url : host+'/reports'

  });

  return Reports;

});
