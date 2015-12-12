define([
  'backbone',
  'backbone.marionette',
  'hbs!/templates/reports-header'
],

function (Backbone, Marionette, template) {
  'use strict';

  return Marionette.ItemView.extend({
    template: template

  });
});