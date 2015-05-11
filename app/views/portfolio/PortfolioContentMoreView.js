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
    template: portfolio_more_hbs
  });

});