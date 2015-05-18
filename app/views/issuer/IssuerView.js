define([
  'backbone',
  'backbone.marionette',
  'hbs!/templates/issuer',
],
function (Backbone, Marionette, template) {
  'use strict';
  return Backbone.Marionette.LayoutView.extend({
    initialize : function (options){
      this.options = options;
      console.log('issuerView.initialize');
    },
    template: template
  });
});
