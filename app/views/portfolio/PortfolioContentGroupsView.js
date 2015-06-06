define([
  'backbone',
  'backbone.marionette',
  'Filter',
  'Dictionary',
  'hbs!/templates/portfolio-content-groups',
  'collections/Funds.js'
  ],

function (Backbone, Marionette, Filter, Dictionary, portfolio_groups_hbs, Funds) {
  'use strict';


  return Backbone.Marionette.ItemView.extend({
    initialize : function (options){
        this.options = options;
        this.filter = Filter.fromQueryString(this.options.queryString);
    },
    serializeData: function(){
      return {
        managing_body : Dictionary.translate(this.filter.getConstraintData('managing_body')[0]),
        groups: this.options.groups
      }      
    },
    onRender : function(){

    },
    template: portfolio_groups_hbs,
    events:{
      "click .table-link": function(){
        var value = $(event.target).data("value");
        var group = $(event.target).data("group");
        this.filter.setConstraint(group, value);
        location.href = "/#portfolio" + this.filter.toQueryString();
          
       }
    }
  });

});