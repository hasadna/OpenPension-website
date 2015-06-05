define(function(require) {
  'use strict';
  var _ = require('underscore');
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var template = require('hbs!/templates/content-header');
  var Filter = require('Filter');
  var Dictionary = require('Dictionary');

  var ContentHeaderView = Backbone.Marionette.LayoutView.extend({
    template: template,
    initialize : function (options){
      	console.log('ContentHeaderView.initialize');
        this.options = options;
        this.filter = Filter.fromQueryString(this.options.queryString);
    },
    serializeData: function(){
      return {
        managing_body : Dictionary.translate(this.filter.getConstraintData('managing_body')[0]),
        funds: this.options.funds
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
    },
    onResponse: function(res) {
      console.log('ContentHeaderView.onResponse');
      // console.log(JSON.stringify(res));
      // // Render TableView using the response collection.
      // this.showChildView('table', new TableView({
      //   collection: new IssuerTable(res)
      // }));
    }
  });

  return ContentHeaderView;
});
