define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var Filter = require('Filter');
  var Dictionary = require('Dictionary');
  var portfolio_groups_hbs = require('hbs!/templates/portfolio-content-groups');
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
      "click .table-link": function(ev){
        var value = ev.currentTarget.dataset.value;
        var group = ev.currentTarget.dataset.group;
        this.filter.setConstraint(group, value);
        location.href = "#/portfolio" + this.filter.toQueryString();
      },
      "click .list-all" : function(ev){
        var group = ev.currentTarget.dataset.group;
        this.filter.setConstraint("group_by", group);
        location.href = "#/investment" + this.filter.toQueryString();
      }
    }
  });

});