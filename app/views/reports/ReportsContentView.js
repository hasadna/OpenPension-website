define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var template = require('hbs!/templates/reports-content');
  var details = require('hbs!/templates/report-table-row-details');
  var config = require('json!config');
  var ReportsTableView = require('./ReportsTableView');
  var ReportsActionsView  = require('./ReportsActionsView');
  var ReportConfigView = require('./ReportConfigView');
  var SelectView = require('../common/SelectView');
  var Reports = require('/collections/Reports.js');
  var Funds = require('/collections/Funds.js');
  var ReportConfig = require('/models/ReportConfig.js');
  var ManagingBodies = require('/collections/ManagingBodies.js');
  var Filter = require('Filter');
  

  var reports = new Reports();
  var funds = new Funds();
  var managingBodies = new ManagingBodies();
  var reportConfig = new ReportConfig();
  
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
      fundSelect: "#table-filter-fund",
      reportConfig: "#report-config"
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

      $.when(
        reports.fetch({data: this.filter.toQueryString().substr(1)}),
        managingBodies.fetch(),
        funds.fetch({data: this.filter.toQueryString().substr(1)}),
        reportConfig.fetch()
      )
      .then(_.bind(this.onResponse, this));
    },
    onResponse: function(reportsRes, managingBodiesRes, fundsRes, reportConfigRes) {
      console.log('ReportsContentView.onResponse');
     
      //prepare values for select drop downs
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


      //Select dropdown views
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

      
      this.showChildView('reportConfig', new ReportConfigView({
        config : reportConfigRes[0]
      }));
      

      this.showChildView('tableActions', new ReportsActionsView());

      this.showChildView('table', new ReportsTableView({
        collection: new Reports(reportsRes[0])
      }));



    }

  });
});