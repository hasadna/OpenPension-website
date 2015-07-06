define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var Filter = require('Filter');
  var Dictionary = require('Dictionary');
  var portfolio_more_hbs = require('hbs!/templates/portfolio-content-more');
  var Funds = require('collections/Funds.js');

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