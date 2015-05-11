// PortfolioGroups.js
// -------------
define(["jquery","backbone","/models/PortfolioGroup.js"],

  function($, Backbone, PortfolioGroup) {

    var PortfolioGroups = Backbone.Collection.extend({

      model: PortfolioGroup,
      url : '/api/portfolio'

    });

    return PortfolioGroups;

  }

);