define(function(require) {
  'use strict';
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var template = require('hbs!/templates/issuer-content');

  var IssuerContentView = Backbone.Marionette.LayoutView.extend({
    initialize : function (options) {
      console.log('IssuerContentView.initialize');
    },
    template: template
  });

  return IssuerContentView;
});
