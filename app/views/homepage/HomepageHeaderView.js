define([
  'backbone',
  'backbone.marionette',
  'hbs!/templates/homepage-header'
],

function (Backbone, Marionette, header) {
  'use strict';

  return Marionette.ItemView.extend({
    template: header

  });
});