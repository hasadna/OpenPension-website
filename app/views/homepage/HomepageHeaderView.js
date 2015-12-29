define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var header = require('hbs!/templates/homepage-header');

  return Marionette.ItemView.extend({
    template: header
  });
});