define([
  'backbone',
  'backbone.marionette',
  'hbs!../templates/site',
  '../views/HeaderView',
  '../views/FooterView'
],

function (Backbone, Marionette, site, HeaderView, FooterView) {
  'use strict';

  return Backbone.Marionette.LayoutView.extend({
    template: site,
    regions: {
  		header: '#header',
  		content: '#content',
  		footer: 'footer'
  	},
  	onBeforeShow: function() {
    		this.showChildView('header', new HeaderView());
    		this.showChildView('footer', new FooterView());
  	}
  });

});