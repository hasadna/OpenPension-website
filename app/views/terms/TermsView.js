define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var template = require('hbs!/templates/terms');
  var PortfolioHeaderView = require('../../views/portfolio/PortfolioHeaderView');
  var TermsContentView = require('../../views/terms/TermsContentView');

  return Backbone.Marionette.LayoutView.extend({
    initialize : function (options){
        this.options = options;
    },
    template: template,
    regions: {
  		portfolio_header: '#page-header',
  		content: '#portfolio-content'
  	},
  	onBeforeShow: function() {
    		this.showChildView('portfolio_header', new PortfolioHeaderView(this.options));
    		this.showChildView('content', new TermsContentView(this.options));
  	},
    onAttach: function(){
    }
  });

});