define(function(require) {
  'use strict';
  var Backbone = require('backbone');

  var IssuerTableRow = Backbone.Model.extend({
    defaults: {
      key: '',
      values: []
    }
  });
  return IssuerTableRow;
});
