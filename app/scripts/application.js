define([
	'backbone',
	'communicator',
	'hbs!../templates/site'

],

function( Backbone, Communicator, site) {
    'use strict';

	var App = new Backbone.Marionette.Application();

	App.addRegions({
		body: 'body'
	})

	
	return App;
});
