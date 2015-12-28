define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var Communicator = require('communicator');
  var App = new Backbone.Marionette.Application();

  App.addRegions({
      body: 'body'
  });

  
  return App;
});
