define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var App = require('application');
  var Communicator = require('communicator');
  var Router = require('approuter');
  var NavController = require('navcontroller');
  var SiteView = require('../views/SiteView');

    // initialize the app controller

	
	App.on("start", function(){

		Communicator.mediator.trigger("APP:START");
		var siteView = new SiteView();

		App.getRegion('body').show(siteView);

	    var controller = new NavController({region : siteView.getRegion("content")});

        var router = new Router({
          controller : controller
        });
 
		if(Backbone.history){
			Backbone.history.start();
		}
	});

    App.start({});

});
