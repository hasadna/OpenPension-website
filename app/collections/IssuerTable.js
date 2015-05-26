define(function(require) {
  'use strict';
  var Backbone = require('backbone');
  var IssuerTableRow = require('/models/IssuerTableRow.js');

  var IssuerTable = Backbone.Collection.extend({
    model: IssuerTableRow,
    url : '/api/issuer'
  });
  return IssuerTable;
});
