define(function(require) {
  'use strict';
  var _ = require('underscore');
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var template = require('hbs!/templates/issuer-content');
  var Filter = require('Filter');
  var IssuerTable = require('/collections/IssuerTable.js');
  var TableView = require('../../views/issuer/TableView');

  var IssuerContentView = Backbone.Marionette.LayoutView.extend({
    template: template,
    regions: {
      header: '#issuer-content-header',
      table: '#issuer-content-table',
      more: '#issuer-content-more'
    },
    initialize : function (options) {
      console.log('IssuerContentView.initialize');
      this.filter = Filter.fromQueryString(this.options.queryString);
    },
    onRender: function() {
      var issuerTable = new IssuerTable();
      $.when(issuerTable.fetch({data: this.options.queryString}))
          .then(_.bind(this.onResponse, this));
    },
    onResponse: function(res) {
      console.log('IssuerContentView.onResponse');
      // Render TableView using the response collection.
      this.showChildView('table', new TableView({
        collection: new IssuerTable(res)
      }));
    }
  });

  return IssuerContentView;
});
