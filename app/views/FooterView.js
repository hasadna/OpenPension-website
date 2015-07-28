define(function(require) {
  'use strict';

  var $ = require('jquery');
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var footer = require('hbs!../templates/footer');

  return Marionette.ItemView.extend({
    template: footer,
    onShow: function(){
    }
  });
});


