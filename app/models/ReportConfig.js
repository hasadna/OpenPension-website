define(function(require) {
  'use strict';
  var Backbone = require('backbone');
  var host = 'http://localhost:5000';
  host = '/api';

  var ReportConfig = Backbone.Model.extend({

    url : host+'/reports/config',
    defaults: {
      totalFilteredValues: '',
      totalPensionFundValues: '' 
    }
  });
  return ReportConfig;
});

