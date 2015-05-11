require([
	'backbone',
	'application',
	'communicator',
	'approuter',
	'navcontroller',
	'../views/SiteView'

],
function ( Backbone, App, Communicator, Router, NavController, SiteView ) {
    'use strict';
 
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
