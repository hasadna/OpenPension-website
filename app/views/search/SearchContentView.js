define(function(require) {
  'use strict';
  var $ = require('jquery');
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var template = require('hbs!/templates/search-content');
  var Filter = require('Filter');
  var _ = require('underscore');
  var config = require('json!config');

  return Marionette.ItemView.extend({
    template: template,
   
    initialize : function (options){
        this.options = options;
        this.filter = Filter.fromQueryString(this.options.queryString);
    },
    serializeData: function(){
      return {
        totalResults: _.reduce(this.options.data, function(memo, item){ return memo + item.length;},0),
        data: this.options.data
      }      
    },
    regions: {
    },
    onBeforeShow: function() {
    },
   
    onShow: function(){
    },
    events:{
      "click .table-link": function(ev){
        ev.preventDefault();
        var value = ev.currentTarget.dataset.value;
        var group = ev.currentTarget.dataset.group;
        
        this.filter.setConstraint(group, value);
        this.filter.removeField('q');
        this.filter.addConstraint('report_year',config.current_year);
        this.filter.addConstraint('report_qurater',config.current_quarter);
        location.href = "#/portfolio" + this.filter.toQueryString();
      }
    }
  });
});