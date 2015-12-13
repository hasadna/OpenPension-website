define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var template = require('hbs!/templates/report-table-row');
  var details = require('hbs!/templates/report-table-row-details');
  var ReportsTableRowDetailsView = require('../../views/reports/ReportsTableRowDetailsView');

  var config = require('json!config');
  var moment = require('moment');
  var Reports = require('/collections/Reports.js');
  var reports = new Reports();
  var Q = require('q');

  function removeRow(tr) {
      // $(tr).find(">td div").remove();

      // , function() {
         $(tr).remove(); 
      // });
  }


  return Marionette.ItemView.extend({
    tagName: 'tr',
    className:'report-row',
    template: template,
    events: {
      "click .checkbox-cell input" : function(event){ //toggle select row 

        var selected = $(event.currentTarget).prop('checked');

        if (selected){
          $(event.currentTarget).parents('tr').addClass('selected');
        }
        else{
          $(event.currentTarget).parents('tr').removeClass('selected');
        }

      },
      "click .data-cell" : function(event){ //show details   
        var model = this.model;
        var row = $(event.currentTarget).parents('tr')[0];
        
         if ( $(row).hasClass('showing-details')){ 
            //uncheck checkbox
            $(row).find('input[type="checkbox"]').prop('checked', false);
            
            //details showing, hide any other (might be) details
            $(".report-details").each(function(){

              $(this).prev("tr").removeClass('showing-details');
              $(this).prev("tr").removeClass('selected');
              removeRow(this);
              
            });
            return;
          } 
          else { //show this row details
          
            //collapse other rows details
            $(".report-details").each(function(){
              $(this).prev("tr").removeClass('showing-details');
              $(this).prev("tr").removeClass('selected');

              //uncheck other checkboxes
              $(this).prev("tr").find('input[type="checkbox"]').prop('checked', false);
              removeRow(this);
            });

            //clear all selected
            $(".selected").each(function(){
              $(this).removeClass('selected');
              $(this).find('input[type="checkbox"]').prop('checked', false);
            });

            $(row).addClass('showing-details'); 
            $(row).addClass('selected'); //mark row selected
            $(row).find('input[type="checkbox"]').prop('checked', true);

            Q.all([model.checkCsv(), model.checkExcel(), model.countRows()])
              .then(function(values){
                var detailRow = new ReportsTableRowDetailsView({
                  model:model, 
                  csvFile: values[0], 
                  excelFile: values[1],
                  rowCount: values[2].count
                });
                detailRow.render();
              });

          }
      }  
  	},
    attributes: function () {
      return {
       "data-id": this.model.id
      }
    },
    onBeforeRender: function() {
      var dateFormat = "MMM DD YY HH:mm";
      if (this.model.attributes.createdAt)
        this.model.attributes.createdAtFormatted = moment(this.model.attributes.createdAt).format(dateFormat);
  
      if (this.model.attributes.updatedAt)
        this.model.attributes.updatedAtFormatted = moment(this.model.attributes.updatedAt).format(dateFormat);
      
      if (this.model.attributes.dbLoadDate)
        this.model.attributes.dbLoadDateFormatted = moment(this.model.attributes.dbLoadDate).format(dateFormat);
      
      if (this.model.attributes.convertDate)
        this.model.attributes.convertDateFormatted = moment(this.model.attributes.convertDate).format(dateFormat);
    }

  });
});