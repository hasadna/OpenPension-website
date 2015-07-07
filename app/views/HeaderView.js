define(function(require) {
  'use strict';
  var $ = require('jquery');
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var header = require('hbs!../templates/header');

  return Marionette.ItemView.extend({
    template: header,
    onShow: function(){
    }
  });
});