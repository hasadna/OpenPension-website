define([
  'backbone',
  'backbone.marionette',
  'hbs!/templates/portfolio-header',
  'Filter',
  'TitleGenerator',
  'Dictionary'
],

function (Backbone, Marionette, template, Filter, TitleGenerator, Dictionary) {
  'use strict';

  function getBreadcrumbs(filter){
    var drillDown = filter.getDrillDown();
    return _.map(drillDown, function(field){
        return {
           value: Dictionary.translate(filter.getConstraintData(field)[0]),
           field: Dictionary.translate(field)
        }
    })
  }

  return Marionette.ItemView.extend({
    initialize : function (options){
        this.options = options;
        this.filter = Filter.fromQueryString(this.options.queryString);
    },
    serializeData: function(){
      var breadcrumbs = getBreadcrumbs(this.filter);
      var lastCrumb = breadcrumbs.pop();

    	return {
  			report_type: TitleGenerator.getReportTypeHeb(this.filter),
  			report_title: TitleGenerator.createTitle(this.filter),
        breadcrumbs: breadcrumbs,
        last_crumb: lastCrumb
    	};
    },
    template: template,
  	templateHelpers: {
        title: function (name) {
            return Filter;
        }
    }
  });
});
