define(function(require) {
  'use strict';

  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var template = require('hbs!/templates/portfolio-content');
  var PortfolioHeaderView = require('../../views/portfolio/PortfolioHeaderView');
  var PortfolioContentMoreView = require('../../views/portfolio/PortfolioContentMoreView');
  var InvestmentContentGroupsView = require('../../views/investment/InvestmentContentGroupsView');
  var CommonContentHeaderView = require('../../views/common/ContentHeaderView');
  var Funds = require('/collections/Funds.js');
  var Investment = require('/models/Investment.js');
  var ContentHeader = require('/models/ContentHeader.js');
  var Dictionary = require('Dictionary');
  var Filter = require('Filter');
  var DataNormalizer = require('DataNormalizer');
  var Sparkline = require('Sparkline');

  return Backbone.Marionette.LayoutView.extend({
    initialize : function (options){
      this.options = options;
      this.filter = Filter.fromQueryString(this.options.queryString);
    },
    template: template,
    regions: {
      portfolio_content_header: '#portfolio-content-header',
      portfolio_content_groups: '#portfolio-content-groups',
      portfolio_content_more: '#portfolio-content-more'
    },
    onBeforeShow: function() {

    },
    onRender: function(){

        var managing_body = this.filter.getConstraintData('managing_body')[0];
        var self = this;
        var fundsList = new Funds();
        var investment = new Investment();
        var contentHeader = new ContentHeader();


        $.when(
          fundsList.fetch({ data: $.param({ managing_body: managing_body}) }),
          investment.fetch({ data: this.options.queryString }),
          contentHeader.fetch({data: this.options.queryString})
        )
        .then(function(fundsRes, groupsRes, contentHeaderRes){
            var funds = fundsRes[0];
            var group = groupsRes[0];

                group.group_field_translated = Dictionary.translate(group.group_field);
                group.plural = Dictionary.plurals[group.group_field];

                _.map(group['results'], function(el,index){
                  var percentages = CommonContentHeaderView.calculatePercentages(el.fair_values, contentHeaderRes[0].totalFilteredValues);
                  var diff = (percentages[0] - percentages[3]).toFixed(2);
                  var trend = CommonContentHeaderView.getTrend(diff);
                  var fairValue = el.fair_values[0];
                  var amountWords = DataNormalizer.convertNumberToWords(el.fair_values[0]);

  				  if (_.isEmpty(el['name'])){ //result name is null
					el['name_translated'] = "לא נמצא בקטגוריה";
					el['name'] = 'null';
				  }
				  else{
					el['name_translated'] = Dictionary.translate(el['name']);
				  }

                  el['sparklineData'] = percentages.reverse().join(", ");
                  el['diff'] = Math.abs(diff);
                  el['trend'] = trend;
                  el['percentage'] = percentages[3];
                  el['barWidth'] = percentages[3] * 0.65;
                  el['amountWords'] = amountWords.number + ' ' + amountWords.scale;

                }, this);



            self.showChildView('portfolio_content_header',
                new CommonContentHeaderView(
                {
                  queryString : self.options.queryString,
                  data: contentHeaderRes[0]
                }
            ));

            self.showChildView('portfolio_content_groups',
              new InvestmentContentGroupsView(
                {
                  group: group,
                  queryString : self.options.queryString
                }
            ));

            self.showChildView('portfolio_content_more',
              new PortfolioContentMoreView(
                {
                  funds: funds,
                  queryString : self.options.queryString
                }
            ));

        });
    },
    onShow: function(){
      Sparkline.draw();
    }

  });
});
