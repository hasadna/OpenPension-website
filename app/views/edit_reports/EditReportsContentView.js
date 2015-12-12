define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var template = require('hbs!/templates/reports-content');
  var details = require('hbs!/templates/report-table-row-details');
  var config = require('json!config');
  var ReportsTableView = require('./EditReportsTableView');
  var ReportsActionsView  = require('./EditReportsActionsView');
  var SelectView = require('../common/SelectView');
  var Reports = require('/collections/Reports.js');
  var Funds = require('/collections/Funds.js');
  var ManagingBodies = require('/collections/ManagingBodies.js');
  var reports = new Reports();
  var funds = new Funds();
  var managingBodies = new ManagingBodies();
  var Filter = require('Filter');

  
  return Backbone.Marionette.LayoutView.extend({
    initialize : function (options){
        this.filter = Filter.fromQueryString(location.hash);
    },
    template: template,
    regions: {
      table: '#reports-table',
      tableActions : '#reports-actions',
      managingBodySelect: '#table-filter-managing-body',
      yearSelect: '#table-filter-year',
      quarterSelect: '#table-filter-quarter',
      fundSelect: "#table-filter-fund"
    },
    onBeforeShow: function() {
    },
    events: {
      "change #table-filter-managing-body select" :function(event){
        var selectedIndex = $(event.currentTarget).find("option:selected").index();

        if (selectedIndex == 0){
          this.filter.removeField('managing_body');
        }
        else{
          var selectedValue = $(event.currentTarget).val();
          this.filter.setConstraint('managing_body', selectedValue);        
        }

        this.filter.removeField('fund');
        location.hash = "reports" + this.filter.toQueryString();
      },

      "change #table-filter-year select" :function(event){

        var selectedIndex = $(event.currentTarget).find("option:selected").index();

        if (selectedIndex == 0){
          this.filter.removeField('report_year');
        }
        else{
          var selectedValue = $(event.currentTarget).val();
          this.filter.setConstraint('report_year', selectedValue);        
        }

        location.hash = "reports" + this.filter.toQueryString();
      },
      "change #table-filter-quarter select" :function(event){
        var selectedIndex = $(event.currentTarget).find("option:selected").index();

        if (selectedIndex == 0){
          this.filter.removeField('report_quarter');
        }
        else{
          var selectedValue = $(event.currentTarget).val();
          this.filter.setConstraint('report_quarter', selectedValue);        
        }

        location.hash = "reports" + this.filter.toQueryString();
      },
      "change #table-filter-fund select" :function(event){
        var selectedIndex = $(event.currentTarget).find("option:selected").index();

        if (selectedIndex == 0){
          this.filter.removeField('fund');
        }
        else{
          var selectedValue = $(event.currentTarget).val();
          this.filter.setConstraint('fund', selectedValue);        
        }

        location.hash = "reports" + this.filter.toQueryString();
      },
      "click #upload-report": function(event){
        $("#file-select").click();
      },
      "click #upload-report-submit" : function(event){
        // var formData = new FormData($(this)[0]);
        var formData = new FormData($("#upload-report-form")[0]);

        $.ajax({
            url : '/reports/excelFile',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
                // contentType: 'multipart/form-data',
            success: function (msg) {
               console.log(msg);
            }
        });
      }
    },
    onRender: function() {

      // var filter = this.filter.clone();

      // filter.removeField('report_year');
      // filter.removeField('report_quarter');


      $.when(
        reports.fetch({data: this.filter.toQueryString().substr(1)}),
        managingBodies.fetch(),
        funds.fetch({data: this.filter.toQueryString().substr(1)})
      )
      .then(_.bind(this.onResponse, this));
    },
    onResponse: function(reportsRes, managingBodiesRes, fundsRes) {
      console.log('ReportsContentView.onResponse');
     
     
      var managingBodyOptions = _.map(managingBodiesRes[0],function(body){
        return {
          text: body.managing_body,
          value: body.managing_body
        }
      });

      var yearOptions = _.map([2011,2012,2013,2014,2015],function(year){
        return {
          text: year,
          value: year
        }
      });

      var quarterOptions = _.map([1,2,3,4],function(quarter){
        return {
          text: quarter,
          value: quarter
        }
      });

      var fundsOptions = _.map(fundsRes[0],function(fund){
        return {
          value: fund.fund,
          text: fund.fund_name + " (" +fund.fund+ ")"
        }
      });


      this.showChildView('managingBodySelect', new SelectView({
        collection: managingBodyOptions,
        selectedValue: this.filter.getConstraintData('managing_body')[0],
        addFirst:true,
        firstTitle:'הכל'
      }));

      this.showChildView('yearSelect', new SelectView({
        collection: yearOptions,
        selectedValue: this.filter.getConstraintData('report_year')[0],
        addFirst:true,
        firstTitle:'הכל'
      }));

      this.showChildView('quarterSelect', new SelectView({
        collection: quarterOptions,
        selectedValue: this.filter.getConstraintData('report_quarter')[0],
        addFirst:true,
        firstTitle:'הכל'
      }));

      this.showChildView('fundSelect', new SelectView({
        collection: fundsOptions,
        selectedValue: this.filter.getConstraintData('fund')[0],
        addFirst:true,
        firstTitle:'הכל'
      }));

      this.showChildView('tableActions', new ReportsActionsView());

      var reports = reportsRes[0];

      var self = this;

      _.each(reports, function(report){
        report.report_year = self.filter.getConstraintData('report_year')[0];
        report.report_quarter = self.filter.getConstraintData('report_quarter')[0];
        
      });

      this.showChildView('table', new ReportsTableView({
        collection: new Reports(reportsRes[0])
      }));

    }

  });
});