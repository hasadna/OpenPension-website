define(function(require) {
  'use strict';
  var Backbone = require('backbone');

  var ContentHeader = Backbone.Model.extend({

    url : '/api/contentHeader',
    defaults: {
      totalFilteredValues: '',
      totalPensionFundValues: '' 
    }
  });
  return ContentHeader;
});
