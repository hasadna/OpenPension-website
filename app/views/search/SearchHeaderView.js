define(function(require) {
  'use strict';
  var $ = require('jquery');
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var template = require('hbs!/templates/search-header');
  var Filter = require('Filter');

  return Marionette.ItemView.extend({
    template: template,
   
    initialize : function (options){
        this.options = options;
        this.filter = Filter.fromQueryString(this.options.queryString);
    },
    serializeData: function(){
      return {
        searchTerm: this.options.searchTerm
      }      
    },
    regions: {
  	},
  	onBeforeShow: function() {
  	},
    onRender: function(){ 
    },
    onShow: function(){
    }
  });
});