function drawSparklines(){

    var start = +new Date(),
        $tds = $("div[data-sparkline]"),
        fullLen = $tds.length,
        n = 0;

    // Creating sparkline charts is quite fast in modern browsers, but IE8 and mobile
    // can take some seconds, so we split the input into chunks and apply them in timeouts
    // in order avoid locking up the browser process and allow interaction.
    function doChunk(){
        var time = +new Date(),
            i,
            len = $tds.length;

        for (i = 0; i < len; i++) {
            var $td = $($tds[i]),
                stringdata = $td.data('sparkline'),
                arr = stringdata.split('; '),
                data = $.map(arr[0].split(', '), parseFloat),
                chart = {};

            if (arr[1]) {
                chart.type = arr[1];
            }

            var color;
            var dataDif = data[3] - data[0];
  
            if (dataDif < 0){
                color = '#FFBE4C'; //yellow
            }
            else if(dataDif == 0){
                color = '#999999'; //gray
            }
            else{
                color = '#7FB2FF'; //blue
            }

            $td.highcharts('SparkLine', {
                series: [{
                    color: color,
                    data: data,
                    pointStart: 1
                }],
                tooltip: {
                    //headerFormat: '<span style="font-size: 10px">' + $td.parent().find('th').html() + ', Q{point.x}:</span><br/>',
                    headerFormat :'',
                    pointFormat: '<b>% {point.y}</b>'
                },
                chart: chart
            });

            n++;
            
            // If the process takes too much time, run a timeout to allow interaction with the browser
            if (new Date() - time > 1500) {
                $tds.splice(0, i + 1);
                setTimeout(doChunk, 0);
                break;
            }

        }
    }
    doChunk();
    
};

define(function(require) {
  'use strict';
  var _ = require('underscore');
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var template = require('hbs!/templates/content-header');
  var Filter = require('Filter');
  var Dictionary = require('Dictionary');
  var DataNormalizer = require('DataNormalizer');

  var ContentHeaderView = Backbone.Marionette.LayoutView.extend({
    template: template,
    initialize : function (options){
      	console.log('ContentHeaderView.initialize');
        this.options = options;
        this.filter = Filter.fromQueryString(this.options.queryString);
    },
    serializeData: function(){
      
      var amountWords = DataNormalizer.convertNumberToWords(this.options.data.totalFilteredValues[0]);
      var reportType = DataNormalizer.getReportType(this.filter);
      var percentages = ContentHeaderView.calculatePercentages(this.options.data.totalFilteredValues, this.options.data.totalPensionFundValues);
      var sparklineData = percentages.reverse().join(', ');
      var diff = (percentages[3] - percentages[0]).toFixed(1);
      var trend = ContentHeaderView.getTrend(diff);

      return {
      	months: DataNormalizer.getLastQuarters(2014,3,4),
        funds: this.options.funds,
        queryString: this.options.queryString,
        sparklineData: sparklineData,
        diff: Math.abs(diff),
        direction: this.options.data.direction,
        percentageOfTotalFund: percentages[0],
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
      // var issuer = this.filter.getConstraintData('issuer')[0];
      // var issuerTable = new IssuerTable();
      // var data = $.param({ issuer: issuer});
      // $.when(issuerTable.fetch({data: data}))
      //     .then(_.bind(this.onResponse, this));

          //initialize quarter select element
	    $('#select-quarter').selectpicker();

	    //handle quarter change
	    $('#select-quarter').on('change', function () {
	        
	        //generate filter from query string
	        var filter = Filter.fromQueryString(window.location.search);

	        var quarterData = JSON.parse(this.value);

	        //add constraint from user
	        filter.setConstraint("report_year", quarterData.year);
	        filter.setConstraint("report_qurater", quarterData.quarter);


	        navigate(filter.toQueryString());
	    
	    });

        /**
     * Create a constructor for sparklines that takes some sensible defaults and merges in the individual 
     * chart options. This function is also available from the jQuery plugin as $(element).highcharts('SparkLine').
     */
        Highcharts.SparkLine = function (options, callback) {
            var defaultOptions = {
                chart: {
                    renderTo: (options.chart && options.chart.renderTo) || this,
                    backgroundColor: null,
                    borderWidth: 0,
                    type: 'line',
                    margin: [2, 0, 2, 0],
                    width: 80,
                    height: 20,
                    style: {
                        overflow: 'visible'
                    },
                    skipClone: true
                },
                title: {
                    text: ''
                },
                credits: {
                    enabled: false
                },
                xAxis: {
                    labels: {
                        enabled: false
                    },
                    title: {
                        text: null
                    },
                    startOnTick: false,
                    endOnTick: false,
                    tickPositions: []
                },
                yAxis: {
                    endOnTick: false,
                    startOnTick: false,
                    labels: {
                        enabled: false
                    },
                    title: {
                        text: null
                    },
                    tickPositions: [0]
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    backgroundColor: null,
                    borderWidth: 0,
                    shadow: false,
                    useHTML: true,
                    hideDelay: 0,
                    shared: true,
                    padding: 0,
                    positioner: function (w, h, point) {
                        return { x: point.plotX - w / 2, y: point.plotY - h};
                    }
                },
                plotOptions: {
                    series: {
                        animation: false,
                        lineWidth: 3, //width of graph
                        shadow: false,
                        states: {
                            hover: {
                                lineWidth: 3 //width of graph line
                            }
                        },
                        marker: {
                            radius: 1,
                            states: {
                                hover: {
                                    radius: 2
                                }
                            }
                        },
                        fillOpacity: 0.25
                    },
                    column: {
                        negativeColor: '#910000',
                        borderColor: 'silver'
                    }
                }
            };
            options = Highcharts.merge(defaultOptions, options);

            return new Highcharts.Chart(options, callback);
        };


      drawSparklines();
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
