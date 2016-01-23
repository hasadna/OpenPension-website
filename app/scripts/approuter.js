define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');

  var Router = Backbone.Marionette.AppRouter.extend({
    appRoutes: {
      "": "home",
      "home": "home",
      "about": "about",
      "privacy": "privacy",
      "portfolio?*queryString": "portfolio",
    "issuer?*queryString": "issuer",
    "investment?*queryString": "investment",
    "search?*queryString": "search"
    }
  });
  return Router;
});
