define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var Communicator = require('communicator');
  var App = new Backbone.Marionette.Application();

  App.addRegions({
      body: 'body'
  });


  //vent events on ajax start/stop
  $( document ).ajaxStart(function() {
 	App.vent.trigger("ajax:start");
  })
  .ajaxStop(function() {
	App.vent.trigger("ajax:stop");
  });

  return App;
});
