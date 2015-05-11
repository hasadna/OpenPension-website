// Funds.js
// -------------
define(["jquery","backbone","/models/Fund.js"],

  function($, Backbone, Fund) {

    var Funds = Backbone.Collection.extend({

      model: Fund,
      url : '/api/funds'

    });

    return Funds;

  }

);