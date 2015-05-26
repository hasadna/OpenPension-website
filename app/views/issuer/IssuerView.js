define(function(require) {
  'use strict';
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var template = require('hbs!/templates/issuer');
  var IssuerHeaderView = require('../../views/issuer/IssuerHeaderView');
  var IssuerContentView = require('../../views/issuer/IssuerContentView');

  var IssuerView = Backbone.Marionette.LayoutView.extend({
    initialize : function (options) {
      console.log('issuerView.initialize');
    },
    template: template,
    regions: {
      header: '#page-header',
      content: '#issuer-content',
      footer: 'footer'
    },
    onBeforeShow: function() {
  		this.showChildView('header', new IssuerHeaderView(this.options));
  		this.showChildView('content', new IssuerContentView(this.options));
  	}
  });

  return IssuerView;
});
