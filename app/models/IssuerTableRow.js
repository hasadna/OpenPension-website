define(function(require) {
  'use strict';
  var Backbone = require('backbone');

  var IssuerTableRow = Backbone.Model.extend({
    defaults: {
      key: '',
      values: []
    },
    initialize: function() {
      this.set('percentOfIssued', this.getPercentOfIssued());
      this.set('exposure', this.getExposure());
      this.set('totalFairValue', this.getTotalFairValue());
      var sparkline = this.getSparkline();
      this.set('sparklineData', sparkline.data);
      this.set('sparklineDiff', sparkline.diff);
      this.set('sparklineDirection', sparkline.direction);
    },
    getPercentOfIssued: function() {
      return (this.get('values')[0] * 100 ).toFixed(2);
    },
    getSparkline: function() {
      var sparkline = [
        (this.get('values')[0] * 100 ).toFixed(2),
        (this.get('values')[1] * 100 ).toFixed(2),
        (this.get('values')[2] * 100 ).toFixed(2),
        (this.get('values')[3] * 100 ).toFixed(2)
      ];

      var diff, direction;
      diff = (sparkline[0] - sparkline[sparkline.length - 1]).toFixed(2);
      if (diff > 0){
        direction = "increase";
      } else if(diff==0) {
        direction = "no-change";
      } else {
        direction = "decrease";
      }

      return {
        diff: Math.abs(diff),
        direction: direction,
        data: sparkline.reverse().join(', ')
      };
    },
    getExposure: function() {
      return (this.get('values')[4] * 100 ).toFixed(2);
    },
    getTotalFairValue: function() {
      return (this.get('values')[5] * 100 ).toFixed(2);
    }
  });
  return IssuerTableRow;
});
