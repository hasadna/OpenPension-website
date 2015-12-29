define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var header = require('hbs!/templates/portfolio-header');
  var Filter = require('Filter');
  var Dictionary = require('Dictionary');
  var TitleGenerator = require('TitleGenerator');

  function getBreadcrumbs(filter){
    var drillDown = filter.getDrillDown();
    return _.map(drillDown, function(field){
        return {
           value_eng: filter.getConstraintData(field)[0],
           value: Dictionary.translate(filter.getConstraintData(field)[0]),
           field: Dictionary.translate(field)
        }
    })
  }

  function breadCrumbsClick(event) {

    var value = $(event.target).data('value');
    
    //generate filter from query string
    var filter = Filter.fromQueryString(window.location.search);
    
    var constraintFields = filter.getConstrainedFields();

    for ( var index = constraintFields.length - 1; index >= 0; index-- ) {

        var field = filter.getConstrainedFields()[index];

        // if bread crumb is equal to field, stop removing
        if (value == filter.getConstraintData(field)) {
            break;
        }
        
        //remove all fields other than quarter, year and group_by
        if (field == 'report_qurater' || 
            field == 'report_year' ){
            continue;
        }

        filter.removeField(field);

    }

    window.location.hash = '#/portfolio'+filter.toQueryString();
  }

  return Marionette.ItemView.extend({
    initialize : function (options){
        this.options = options;
        this.filter = Filter.fromQueryString(this.options.queryString);
    },
    serializeData: function(){
      var breadcrumbs = getBreadcrumbs(this.filter);
      var groupByField = this.filter.getConstraintData('group_by')[0];

      var lastCrumb;
      if (groupByField){ //add group by to bread crumbs
        lastCrumb = {
          value: 'כל ' + Dictionary.plurals[groupByField],
          field: ''
        }  
      }
      else{
        lastCrumb = breadcrumbs.pop();
      }

    	return {
  			report_type: TitleGenerator.getReportTypeHeb(this.filter),
  			report_title: TitleGenerator.createTitle(this.filter),
        breadcrumbs: breadcrumbs,
        last_crumb: lastCrumb
    	};
    },
    template: header,
  	templateHelpers: {
        title: function (name) {
            return Filter;
        }
    },
    events: {
      "click .breadcrumb": breadCrumbsClick 
    }
  });
});
