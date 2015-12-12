define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var template = require('hbs!/templates/reports');
  var ReportsHeaderView = require('../../views/reports/ReportsHeaderView');
  var ReportsContentView = require('../../views/reports/ReportsContentView');



  return Backbone.Marionette.LayoutView.extend({
    template: template,
    regions: {
  		header: '#reports-header',
  		content: '#reports-content',
  		footer: 'footer'
  	},
  	onBeforeShow: function() {
    		this.showChildView('header', new ReportsHeaderView());
    		this.showChildView('content', new ReportsContentView());
  	},
    onShow: function(){
    },
    events: {
    }
  
  });

});