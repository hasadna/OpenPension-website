define([
  'backbone',
  'backbone.marionette',
  'Filter',
  'hbs!/templates/portfolio-content',
  '../../views/portfolio/PortfolioHeaderView',
  '../../views/portfolio/PortfolioContentMoreView',
  '../../views/portfolio/PortfolioContentGroupsView',
  '/collections/Funds.js',
  '/collections/PortfolioGroups.js',
  'Dictionary'
],

function (Backbone, Marionette, Filter, portfolio_content_hbs, PortfolioHeaderView, 
  PortfolioContentMoreView, PortfolioContentGroupsView, Funds, PortfolioGroups,
  Dictionary) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({
    initialize : function (options){
        this.options = options;
        this.filter = Filter.fromQueryString(this.options.queryString);
    },
    template: portfolio_content_hbs,
    regions: {
      portfolio_content_header: '#portfolio-content-header',
      portfolio_content_groups: '#portfolio-content-groups',
      portfolio_content_more: '#portfolio-content-more'
    },
    onBeforeShow: function() {
  
    },
    onRender: function(){

        var managing_body = this.filter.getConstraintData('managing_body')[0];
        var self = this;
        var fundsList = new Funds();

        
        var portfolioGroups = new PortfolioGroups();


        $.when(
          fundsList.fetch({ data: $.param({ managing_body: managing_body}) }),
          portfolioGroups.fetch({ data: this.options.queryString })
        )
        .then(function(fundsRes, groupsRes){
            var funds = fundsRes[0];
            var groups = groupsRes[0];

            _.map(groups, function(group){
                group.group_field_heb = Dictionary.translate(group.group_field);
                group.plural = Dictionary.plurals[group.group_field];

            });

            self.showChildView('portfolio_content_more', 
              new PortfolioContentMoreView(
                {
                  funds: funds,
                  queryString : self.options.queryString
                }
            ));

            self.showChildView('portfolio_content_groups', 
              new PortfolioContentGroupsView(
                {
                  groups: groups,
                  queryString : self.options.queryString
                }
            ));

        });
        
    }

  });

});