define([
  'backbone',
  'backbone.marionette',
  'Filter',
  'Dictionary',
  'hbs!/templates/portfolio-content-more',
  'collections/Funds.js'
  ],

function (Backbone, Marionette, Filter, Dictionary, portfolio_more_hbs, Funds) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({
    initialize : function (options){
        this.options = options;
        this.filter = Filter.fromQueryString(this.options.queryString);
    },
    serializeData: function(){
      return {
        managing_body : Dictionary.translate(this.filter.getConstraintData('managing_body')[0]),
        funds: this.options.funds
      }      
    },
    onRender : function(){

    },
    template: portfolio_more_hbs,
    events:{
      "click .table-link": function(){
        var value = $(event.target).data("value");
        var group = $(event.target).data("group");

        var fundFilter = new Filter();

        fundFilter.setConstraint('managing_body', this.filter.getConstraintData('managing_body')[0]);
        fundFilter.setConstraint('report_qurater', this.filter.getConstraintData('report_qurater')[0]);
        fundFilter.setConstraint('report_year', this.filter.getConstraintData('report_year')[0]);
        fundFilter.setConstraint(group, value);
        location.href = "/#portfolio" + fundFilter.toQueryString();       
      }
    }
  });

});