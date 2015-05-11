// Funds.js
// -------------
define(["jquery","backbone","models/Quarter"],

  function($, Backbone, Quarter) {

    var Quarters = Backbone.Collection.extend({

      model: Quarter,
      url : '/api/quarters'

    });

    return Quarters;

  }

);