define(function(require) {
  'use strict';
  var Backbone = require('backbone');
  var PortfolioGroup = require('/models/PortfolioGroup.js');

  var PortfolioGroups = Backbone.Collection.extend({

    model: PortfolioGroup,
    url : '/api/portfolio'

  });

  return PortfolioGroups;

});
