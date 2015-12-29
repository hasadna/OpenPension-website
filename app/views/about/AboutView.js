define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var about = require('hbs!/templates/about');

  return Backbone.Marionette.LayoutView.extend({
    template: about
  });

});