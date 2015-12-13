define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var Q = require('q');
  var host = 'http://localhost:5000';

  host = '/api';
  
  function getBaseFilename(report){

  };

    // Creates a new Backbone Model class object
    var Report = Backbone.Model.extend({

        // Model Constructor
        initialize: function() {

        },

        // Default values for all of the Model attributes
        defaults: {
            managing_body: 'undefined',
            report_year: 'undefined'                              
        },

        // Gets called automatically by Backbone when the set and/or save methods are called (Add your own logic)
        validate: function(attrs) {

        },

        refreshDbSum: function(){
            var self = this;

            return Q($.get(host+'/reports/totalSumInDB?id='+ this.id))
                .then(function(data){
                  self.set('sum_in_db', data.sum_in_db);
                });
        },

        refreshCsvSum: function(){
            var self = this;

            return Q($.get(host+'/reports/totalSumInFile?id='+ this.id))
                .then(function(data){
                    self.set('sum_in_data_file', data[0].sum_in_data_file);
                });
        },

        downloadCsv: function(){

            window.location = host+'/reports/downloadCsvFile?id=' + this.id;
//                .then(function(data){
//                    window.location = data.url;
//                });
        },

        downloadExcel: function(){

            return Q($.get(host+'/reports/excelFile?id=' + this.id))
                .then(function(data){
                    window.location = data.url;
                });
        },

        refreshExcel: function(){

            return Q($.get(host+'/reports/refreshExcelFile?id=' + this.id))
        
        },

        checkCsv: function(){

            return Q($.get(host+'/reports/csvFile?id=' + this.id))

        },

        checkExcel: function(){

            return Q($.get(host+'/reports/excelFile?id=' + this.id))

        },

        uploadToDb: function(id){

            var attr = id || this.id;

            return Q($.get(host+'/reports/uploadToDb?id=' + attr))

        },

        deleteFromDb: function(){

            return Q($.get(host+'/reports/deleteFromDb?id=' + this.id))

        },

        getCsvFilename: function(){

            return [
                this.managing_body,
                this.report_year,
                this.report_quarter,
                this.fund
            ].join('_').concat('.csv');
            
        },

        countRows: function(){

            return Q($.get(host+'/reports/countRows?report_year=' + this.attributes.report_year +
                '&report_quarter=' + this.attributes.report_quarter +
                '&managing_body=' + this.attributes.managing_body +
                '&fund=' + this.attributes.fund));

        }
        // getCsvFileFullPath: function(){
        //     var fullFilename = Utils.filename('../tmp', fund, '.csv');
        //     var baseFilename = path.basename(fullFilename);
        // },

        // getCsvUrl: function(){

        //     var url = '/csv/' + baseFilename;
        //     return url
        // }

    });

    // Returns the Model class
    return Report;

});
