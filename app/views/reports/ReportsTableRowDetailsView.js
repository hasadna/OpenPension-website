define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var template = require('hbs!/templates/report-table-row-details');

  var config = require('json!config');
  var moment = require('moment');
  var Filter = require('Filter');
  var _ = require('underscore');

  return Marionette.ItemView.extend({
    initialize : function (options){
      this.csvFile = options.csvFile;
      this.excelFile = options.excelFile;
    },
    className:'report-details',
    template: template,
    events: {
      "click #update-url" : function(event){  
        var url = this.$el.find('.url').val();
        this.model.set('url',url);
        this.model.save();
      },
      "click #refresh-db-sum" : function(event){

        var self = this;

        this.model.refreshDbSum()
          .then(function(data){
            self.model.set(data[0]);
          })
          .catch(function(data){
            alert(data.error);
          });
      },
      "click #refresh-csv-sum" : function(event){

        var self = this;

        this.model.refreshCsvSum()
          .then(function(data){
            self.model.set(data[0]);
          })
          .catch(function(data){
              alert(data.responseJSON.error.msg);
          })
      },
      "click .download-csv" : function(event){

        event.preventDefault();

        this.model.downloadCsv()
          .catch(function(data){
              alert(data.error);
          });
      },
      "click .download-excel" : function(event){
        //send excel file to client

        event.preventDefault();

        this.model.downloadExcel()
          .catch(function(data){
              alert(data.error.msg);
          });
      },
      "click #refresh-excel-file" : function(event){

        var self = this;

        this.model.refreshExcel()
          .then(function(data){
            self.excelFile = data[0].excel_file;
            self.render();
          })
          .catch(function(data){
              alert(data.responseJSON.error.msg);
          });
      },
      "click #upload-to-db" : function(event){
        this.model.uploadToDb()
          .catch(function(data){
              alert(data.statusText);
          });
      },
      "click #delete-from-db" : function(event){
        this.model.deleteFromDb()
          .catch(function(data){
              alert(data.statusText);
          });
      }
  	},
    // render: function(){
      // return $.when(this.model.checkCsv(), this.model.checkExcel())
      // .done(function(a,b){
      //   console.log(a[0]);
      //   onRender();
      // });
    // },
    onRender: function(){

      // $.when(this.model.checkCsv)

      $(this.el)
        .hide()
        .insertAfter($('tbody tr[data-id="'+ this.model.id +'"]'))
        .fadeIn(200, this.showToolTips);
    },
    showToolTips: function(){
      var options = {
                      delay: { 
                          "show": 1500,
                           "hide": 100 
                      }
                    };
      $(this).find('button').tooltip(options);
    },  

    modelEvents: {
        'change': 'render'
    },
    serializeData: function(){

      var csv_file = this.csvFile ? this.csvFile.file : "";
      var excel_file = this.excelFile ? this.excelFile.file : "";

      var extData =  {
        excel_file: excel_file,
        csv_file: csv_file,
      };
      
      var res = {}
      _.extend(res, this.model.attributes, extData);
      return res;

    },
    onBeforeRender: function() {
    }

  });
});