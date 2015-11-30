define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var content = require('hbs!/templates/homepage-content');
  var config = require('json!config');

  return Marionette.ItemView.extend({
    template: content,
    events: {
        "click #overall-view": function(event){
            event.preventDefault();
          location.href = "/#/portfolio?report_year="+config.current_year+"&report_qurater="+config.current_quarter;
        }
    },
    serializeData: function(){
      return {
        current_year: config.current_year,
        current_quarter: config.current_quarter
      };
    }

  });
});