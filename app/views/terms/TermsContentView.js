define(function(require) {
  'use strict';

  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var template = require('hbs!/templates/terms-content');
  var Dictionary = require('Dictionary');
  var Filter = require('Filter');
  var DataNormalizer = require('DataNormalizer');

  return Backbone.Marionette.LayoutView.extend({
    initialize : function (options){
      this.options = options;
      this.filter = Filter.fromQueryString(this.options.queryString);
    },
    template: template,
    regions: {
      portfolio_content_header: '#portfolio-content-header',
      portfolio_content_groups: '#portfolio-content-groups',
      portfolio_content_more: '#portfolio-content-more'
    },
    onBeforeShow: function() {
  
    },
    onRender: function(){

        var managing_body = this.filter.getConstraintData('managing_body')[0];
        var self = this;
         
    },
    onShow: function(){
    }

  });
});