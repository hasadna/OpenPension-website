define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var Filter = require('Filter');
  var Dictionary = require('Dictionary');
  var investments = require('hbs!/templates/investment-group');
  var Sparkline = require('Sparkline');

  return Backbone.Marionette.ItemView.extend({
    initialize : function (options){
        this.options = options;
        this.filter = Filter.fromQueryString(this.options.queryString);
    },
    serializeData: function(){
      return {
        managing_body : Dictionary.translate(this.filter.getConstraintData('managing_body')[0]),
        group: this.options.group
      }      
    },
    onRender : function(){

    },
    onShow: function(){
      Sparkline.draw();
    },
    template: investments,
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