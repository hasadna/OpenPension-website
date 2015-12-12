define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var template = require('hbs!/templates/reports-actions');
  var Report = require('/models/Report.js');
  var report = new Report();

  return Marionette.ItemView.extend({
    template: template,
    events: {
      "click #batch-upload": function(event){
        var ids = _.map($('.selected'), function(item){return $(item).data('id')}).join('&id=');
        report.uploadToDb(ids);
      }
    }
  });
});