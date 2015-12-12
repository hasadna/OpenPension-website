define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var EditReportsTableRowView = require('../../views/edit_reports/EditReportsTableRowView');
  var template = require('hbs!/templates/reports-table');
  
  return Backbone.Marionette.CompositeView.extend({
    template: template,
    childView: EditReportsTableRowView,
    childViewContainer: "table",

    collectionEvents: {
        // 'reset': 'render',
        // 'change': 'render'
    },
    events: {
      "click .checkbox-cell-header" : function(event){
      var isChecked = $(event.currentTarget).find('input').prop('checked');
      this.$el.find('tbody tr .checkbox-cell input[type="checkbox"]')
        .each(function(index, elem){
          $(elem).prop('checked', isChecked );

          if (isChecked){
            $(elem).parents('tr').addClass('selected');
          }
          else{
            $(elem).parents('tr').removeClass('selected');  
          }

        });
      }
    },
    serializeData: function(){

      return {
        length: this.collection.length
      }      
    }
        
  });

});