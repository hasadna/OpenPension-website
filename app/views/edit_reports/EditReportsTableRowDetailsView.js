define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var template = require('hbs!/templates/report-table-row-details');

  var config = require('json!config');
  var moment = require('moment');
  var Filter = require('Filter');

  return Marionette.ItemView.extend({
    className:'report-details',
    template: template,
    events: {
      "click #update-url" : function(event){  
        var url = this.$el.find('.url').val();
        this.model.set('url',url);
        this.model.save();
      },
      "click #refresh-db-sum" : function(event){

        this.model.refreshDbSum()
          .catch(function(data){
            alert(data.error);
          });
      },
      "click #refresh-csv-sum" : function(event){

        this.model.refreshCsvSum()
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
            self.model.set(data[0]);
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
    //   return $.when(this.model.checkCsv())
    //   .done(function(a){
    //     console.log(a[0]);
    //   });
    // },
    onRender: function(){

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
    hideToolTips: function(){
      $(this).find('button').tooltip('hide');
    },
    modelEvents: {
        'change': 'render'
    },
    attributes: function () {
    },
    onBeforeRender: function() {
    }

  });
});