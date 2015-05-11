define([
  'backbone',
  'backbone.marionette',
  'hbs!/templates/privacy'
],

function (Backbone, Marionette, privacy) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({
    template: privacy
  });

});