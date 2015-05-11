define([
  'backbone',
  'backbone.marionette',
  '../views/homepage/HomepageView',
  '../views/about/AboutView',
  '../views/privacy/PrivacyView',
  '../views/portfolio/PortfolioView'
],

function (Backbone, Marionette, HomepageView, AboutView, PrivacyView, PortfolioView) {
  'use strict';

  var Controller = Backbone.Marionette.Controller.extend({

    		region: undefined,

        initialize : function(options) {
        	console.log("init");
			
          this.region = options.region;
       	},
        
        start: function() {
        	console.log("start");
            //TODO: code to start
        },
 
        /**
         * Initialized on start, without hash
         * @method
         */
       	home :  function () {
     			this.region.show(new HomepageView());
        },

        about: function(){
          this.region.show(new AboutView());
        },

        privacy: function(){
          this.region.show(new PrivacyView());
        },

        portfolio: function(queryString){
          var obj = {};
          obj.queryString = queryString;
          this.region.show(new PortfolioView(obj));
        }

    });
 
    return Controller;
});