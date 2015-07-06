define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var homepage = require('hbs!/templates/portfolio');
  var PortfolioHeaderView = require('../../views/portfolio/PortfolioHeaderView');
  var PortfolioContentView = require('../../views/portfolio/PortfolioContentView');
  var Sparkline = require('Sparkline');

  return Backbone.Marionette.LayoutView.extend({
    initialize : function (options){
        this.options = options;
    },
    template: homepage,
    regions: {
  		portfolio_header: '#page-header',
  		content: '#portfolio-content',
  		footer: 'footer'
  	},
  	onBeforeShow: function() {
    		this.showChildView('portfolio_header', new PortfolioHeaderView(this.options));
    		this.showChildView('content', new PortfolioContentView(this.options));
  	},
    onAttach: function(){
    }
  });

});