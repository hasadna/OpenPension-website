define([
  'backbone',
  'backbone.marionette',
  'hbs!/templates/about'
],

function (Backbone, Marionette, about) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({
    template: about
  });

});