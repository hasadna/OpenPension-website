define(function(require) {
  'use strict';
  var Backbone = require('backbone');
  var ManagingBody = require('/models/ManagingBody.js');
  var ManagingBodies = Backbone.Collection.extend({

    model: ManagingBody,
    url : '/api/managing_bodies'

  });

  return ManagingBodies;

});