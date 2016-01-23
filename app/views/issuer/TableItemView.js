define(function(require) {
  'use strict';
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var template = require('hbs!/templates/issuer-table-item-view');

  var TableItemView = Backbone.Marionette.ItemView.extend({
    tagName: 'tr',
    template: template
  });
  return TableItemView;
});
