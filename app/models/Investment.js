define(function(require) {
  'use strict';
  var Backbone = require('backbone');

  var Investment = Backbone.Model.extend({

    url : '/api/investment',
    defaults: {
      totalFilteredValues: '',
      totalPensionFundValues: '' 
    }
  });
  return Investment;
});
