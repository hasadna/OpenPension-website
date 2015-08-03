define(function(require) {
  'use strict';
  var $ = require('jquery');
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var header = require('hbs!../templates/header');
  var search = require('../scripts/libs/search.js')

  return Marionette.ItemView.extend({
    template: header,
    onAttach: function(){
        search.init();
    }
  });
});