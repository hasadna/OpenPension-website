define([
  'backbone',
  'backbone.marionette',
  'hbs!/templates/homepage-content'
],

function (Backbone, Marionette, content) {
  'use strict';

  return Marionette.ItemView.extend({
    template: content
  });
});