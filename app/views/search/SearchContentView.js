define(function(require) {
  'use strict';
  var $ = require('jquery');
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var template = require('hbs!/templates/search-content');
  var Filter = require('Filter');
  var _ = require('underscore');

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
    }
  });
});