define(function(require) {
  'use strict';
  var _ = require('underscore');
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var template = require('hbs!/templates/content-header');
  var Filter = require('Filter');
  var Dictionary = require('Dictionary');
  var DataNormalizer = require('DataNormalizer');
  var Sparkline = require('Sparkline');
  var config = require('json!config');

  var ContentHeaderView = Backbone.Marionette.LayoutView.extend({
    template: template,
    initialize : function (options){
      	console.log('ContentHeaderView.initialize');
        this.options = options;
        this.filter = Filter.fromQueryString(this.options.queryString);
    },
    serializeData: function(){
      
      var self = this;
      var amountWords = DataNormalizer.convertNumberToWords(this.options.data.totalFilteredValues[0]);
      var reportType = DataNormalizer.getReportType(this.filter);
      var percentages = ContentHeaderView.calculatePercentages(this.options.data.totalFilteredValues, this.options.data.totalPensionFundValues);
      var sparklineData = percentages.reverse().join(', ');
      var diff = (percentages[3] - percentages[0]).toFixed(1);
      var trend = ContentHeaderView.getTrend(diff);
      var months = DataNormalizer.getLastQuarters(config.current_year, config.current_quarter, 4);
      var selectedMonth = _.filter(months,
                            function(month){
                              return month.quarter == self.filter.getConstraintData("report_qurater")[0] &&
                                  month.year == self.filter.getConstraintData("report_year")[0]
                            }
                          );
      selectedMonth[0].selected = true;

      return {
      	months: months,
        funds: this.options.funds,
        queryString: this.options.queryString,
        sparklineData: sparklineData,
        diff: Math.abs(diff),
        direction: this.options.data.direction,
        percentageOfTotalFund: percentages[3],
        trend: trend,
        totalAmountWords: amountWords.number + ' ' + amountWords.scale,
        amountTitle: ContentHeaderView.getAmountTitle(reportType),
        percentageTitle: ContentHeaderView.getPercentageTitle(reportType),
        shouldShowPercentage: ContentHeaderView.shouldShowPercentage(this.filter)
      }      
    },
    onRender: function() {
    },
    onShow: function() {

          //initialize quarter select element
	    $('#select-quarter').selectpicker();

	    //handle quarter change
	    $('#select-quarter').on('change', function () {
	        
	        //generate filter from query string
	        var filter = Filter.fromQueryString(window.location.search);

	        var quarterData = this.value.split('_');

	        //add constraint from user
	        filter.setConstraint("report_year", quarterData[0]);
	        filter.setConstraint("report_qurater", quarterData[1]);


	        location.href = "#/portfolio"+filter.toQueryString();
	    
	    });

        Sparkline.draw();
    },
    onResponse: function(res) {
      console.log('ContentHeaderView.onResponse');

    }
  },
  {
    getAmountTitle: function(reportType){
      if (reportType == "managing_body"){
        return 'גודל התיק';
      }
      else if(reportType == "investment") {
        return 'גודל ההשקעה';
      }
    },
    getPercentageTitle: function(reportType){
      if (reportType == "managing_body"){
        return 'חלק משוק הפנסיה';
      }
      else if(reportType == "investment") {
        return 'חשיפה';
      }
    },
    shouldShowPercentage: function(filter){
      return filter.hasConstraint("managing_body") || filter.getDrillDownDepth() > 0;
    },
    calculatePercentages: function(quarterValues, totalPensionFundValues){
      var res = [];
      for (var i = 0; i < 4; i++){
        res.push( ((quarterValues[i] / totalPensionFundValues[i] * 100) || 0).toFixed(2) );
      }
      return res;
    },
    getTrend: function(diff){
        if (diff > 0){
            return "increase";
        }
        else if(diff==0) {
            return "no-change";
        }

        else{
            return "decrease";
        }
    }


  });

  return ContentHeaderView;
});
