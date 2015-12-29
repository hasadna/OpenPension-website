define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var TableItemView = require('../../views/issuer/TableItemView.js');
  var Sparkline = require('Sparkline');
  var template = require('hbs!/templates/issuer-table-view');

  var TableView = Backbone.Marionette.CompositeView.extend({
    tagName: 'div',
    template: template,
    childView: TableItemView,
    childViewContainer: "tbody",
    initialize: function() {
      console.log('TableView.initialize');
    },
    onShow: function() {
      Sparkline.draw();
    }
  });
  return TableView;
});
