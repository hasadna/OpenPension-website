define([
  'backbone',
  'backbone.marionette',
  'Filter',
  'hbs!/templates/portfolio-content',
  '../../views/portfolio/PortfolioHeaderView',
  '../../views/portfolio/PortfolioContentMoreView',
 '/collections/Funds.js'
],

function (Backbone, Marionette, Filter, portfolio_content_hbs, PortfolioHeaderView, PortfolioContentMoreView, Funds) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({
    initialize : function (options){
        this.options = options;
        this.filter = Filter.fromQueryString(this.options.queryString);
    },
    template: portfolio_content_hbs,
    regions: {
      portfolio_content_header: '#portfolio-content-header',
      portfolio_content: '#portfolio-content',
      portfolio_content_more: '#portfolio-content-more'
    },
    onBeforeShow: function() {

        // this.showChildView('portfolio_header', new PortfolioHeaderView(this.options));
        // this.showChildView('content', new HomepageContentView());
        // this.showChildView('portfolio_content_more', new PortfolioContentMoreView());   
    },
    onRender: function(){

        var managing_body = this.filter.getConstraintData('managing_body')[0];
        var self = this;
        var fundsList = new Funds();

        fundsList.fetch({ data: $.param({ managing_body: managing_body}) })
        .then(function(funds){
            self.showChildView('portfolio_content_more', 
              new PortfolioContentMoreView(
                {
                  funds: funds,
                  queryString : self.options.queryString
                }
              ))   
        });

    }

  });

});