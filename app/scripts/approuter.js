define([
	'backbone',
	'backbone.marionette'
],

function(Backbone, Marionette) {
  'use strict';
	var Router = Backbone.Marionette.AppRouter.extend({
	  appRoutes: {
	    "": "home",
	    "home": "home",
	    "about": "about",
	    "privacy": "privacy",
	    "portfolio?*queryString": "portfolio"
	  }
	});
  return Router;
});
