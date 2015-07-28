define(function(require) {
  'use strict';
  var Backbone = require('backbone');

  var QueryNames = Backbone.Model.extend({

    url : '/api/queryNames',
    defaults: {
    }
  });
  return QueryNames;
});
