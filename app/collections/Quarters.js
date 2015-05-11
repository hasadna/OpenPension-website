// Quarters.js
// -------------
define(["jquery","backbone","/models/Quarter.js"],

  function($, Backbone, Quarter) {

    var Quarters = Backbone.Collection.extend({

      model: Quarter,
      url : '/api/quarters'

    });

    return Quarters;

  }

);