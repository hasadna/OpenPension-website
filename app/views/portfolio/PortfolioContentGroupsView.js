define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var Filter = require('Filter');
  var Dictionary = require('Dictionary');
  var portfolio_groups_hbs = require('hbs!/templates/portfolio-content-groups');
  var Funds = require('collections/Funds.js');
  var Sparkline = require('Sparkline');

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
    onShow: function(){
      Sparkline.draw();
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