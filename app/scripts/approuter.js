define([
	'backbone',
	'backbone.marionette'
],


function( Backbone, Marionette) {
    'use strict';

var parseQS = function(url){
    
    var result = {};

    var sURLVariables = url.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {       
        var sParameterName = sURLVariables[i].split('=');
        if ( result[sParameterName[0]] == undefined){
            result[sParameterName[0]] = [];
        }      
        result[sParameterName[0]].push(  sParameterName[1]  );
    }
    return result;
}

	 var Router = Backbone.Marionette.AppRouter.extend({
         
	    appRoutes: {
	      "": "home",
	      "home" : "home",
	      "about" : "about",
  	      "privacy" : "privacy",
  	      "portfolio?*queryString" : "portfolio"
	    },
	    /* standard routes can be mixed with appRoutes/Controllers above */
	    routes : {
	      "hello/:username": "helloBuddy"
	    },
	    helloBuddy : function (buddy) {
	      // Without controller the routing functions live in Router object
	      alert("Hello " + buddy);
	    }
	  });
	 
	  return Router;
});
