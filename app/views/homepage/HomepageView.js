define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var homepage = require('hbs!/templates/homepage');
  var HomepageHeaderView = require('../../views/homepage/HomepageHeaderView');
  var HomepageContentView = require('../../views/homepage/HomepageContentView');
  var InvestmentContentGroupsView = require('../../views/investment/InvestmentContentGroupsView');
  var Investment = require('/models/Investment.js');
  var TreeMap = require('TreeMap');
  var Sparkline = require('Sparkline');
  var ContentHeader = require('/models/ContentHeader.js');
  var DataNormalizer = require('DataNormalizer');
  var CommonContentHeaderView = require('../../views/common/ContentHeaderView');


  var contentHeader = new ContentHeader();
  var investment = new Investment();

  function treemapClick(event){
      var link = $(event.target).closest(".node").data("link");

      //clicked on others, open modal
      if (link == "others"){

        $.when(
          investment.fetch({ data: "report_year=2015&report_qurater=2&group_by=managing_body"}),
          contentHeader.fetch({data: "report_year=2015&report_qurater=2&group_by=managing_body"})
        )
        .then(function(groupsRes, contentHeaderRes){
            var group = groupsRes[0];

           _.map(group['results'], function(el,index){
                  var percentages = CommonContentHeaderView.calculatePercentages(el.fair_values, contentHeaderRes[0].totalFilteredValues);
                  var diff = (percentages[0] - percentages[3]).toFixed(2);
                  var trend = CommonContentHeaderView.getTrend(diff);
                  var fairValue = el.fair_values[0];
                  var amountWords = DataNormalizer.convertNumberToWords(el.fair_values[0]);


                  el['sparklineData'] = percentages.reverse().join(", ");
                  el['diff'] = Math.abs(diff);
                  el['trend'] = trend;
                  el['percentage'] = percentages[3];
                  el['barWidth'] = percentages[3] * 0.65;
                  el['amountWords'] = amountWords.number + ' ' + amountWords.scale;

                }, this);


          $('#myModal').modal({'backdrop':'static'});
//          $('#myModal').modal('show');
          var a =new InvestmentContentGroupsView(
                {//.modal-content
                  el: "#here",
                  group: group,
                  queryString :  "report_year=2015&report_qurater=2&group_by=managing_body" 
                }
            ).render();
            Sparkline.draw(); 

          });
        
      }
      else{
          //navigate to element link
          location.href = "#"+link;
      }
  }

  return Backbone.Marionette.LayoutView.extend({
    template: homepage,
    regions: {
  		header: '#homepage-header',
  		content: '#homepage-content',
  		footer: 'footer'
  	},
  	onBeforeShow: function() {
    		this.showChildView('header', new HomepageHeaderView());
    		this.showChildView('content', new HomepageContentView());
  	},
    onShow: function(){
      TreeMap.drawGraph("managing-bodies","/treemap/managing_bodies");
      TreeMap.drawGraph("issuers","/treemap/issuers");
    },
    events: {
      "click .node": treemapClick 
    }
  
  });

});