define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var template = require('hbs!/templates/report-config');
  var Report = require('/models/Report.js');
  var Filter = require('Filter');
  
  var report = new Report();


  return Marionette.ItemView.extend({
      template: template,
      initialize : function (options){
        this.options = options;
        this.filter = Filter.fromQueryString(this.options.queryString);
      },
      events: { 
      },
      serializeData: function(){
        return this.options.config;
      }    
  });
});
