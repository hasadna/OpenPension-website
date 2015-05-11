define([
  'backbone',
  'backbone.marionette',
  'hbs!/templates/portfolio',
  '../../views/portfolio/PortfolioHeaderView',
  '../../views/portfolio/PortfolioContentView'
],

function (Backbone, Marionette, homepage, PortfolioHeaderView, PortfolioContentView) {
  'use strict';

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
      alert("done");
    }
  });

});