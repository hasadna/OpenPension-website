define(function(require) {

  'use strict';

  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var HomepageView = require('../views/homepage/HomepageView');
  var AboutView = require('../views/about/AboutView');
  var PrivacyView = require('../views/privacy/PrivacyView');
  var PortfolioView = require('../views/portfolio/PortfolioView');
  var IssuerView = require('../views/issuer/IssuerView');
  var InvestmentView = require('../views/investment/InvestmentView');
  var SearchView = require('../views/search/SearchView');
  var TermsView = require('../views/terms/TermsView');

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
        },

        issuer: function(queryString) {
          var obj = {
            queryString: queryString
          };
          this.region.show(new IssuerView(obj));
        },

        investment: function(queryString) {
          var obj = {
            queryString: queryString
          };
          this.region.show(new InvestmentView(obj));
        },

        search: function(queryString) {
          var obj = {
            queryString: queryString
          };
          this.region.show(new SearchView(obj));
        },

        terms: function(queryString){
          var obj = {
            queryString: queryString
          };
          this.region.show(new TermsView(obj));          
        }
    });

    return Controller;
});
