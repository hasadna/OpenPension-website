define(function(require) {
  'use strict';
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var TableItemView = require('../../views/issuer/TableItemView.js');

  var TableView = Backbone.Marionette.CollectionView.extend({
    tagName: 'table',
    childView: TableItemView,
    initialize: function() {
      console.log('TableView.initialize');
    }
  });
  return TableView;
});
