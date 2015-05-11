define([
  'backbone',
  'backbone.marionette',
  'hbs!../templates/footer'
],

function (Backbone, Marionette, footer) {
  'use strict';

  return Marionette.ItemView.extend({
    template: footer

  });
});