define(function(require) {
  'use strict';
  var $ = require('jquery');
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var template = require('hbs!/templates/search');
  var SearchHeaderView = require('../../views/search/SearchHeaderView');
  var SearchContentView = require('../../views/search/SearchContentView');
  var QueryNames = require('/models/QueryNames.js');
  var Filter = require('Filter');


  return Backbone.Marionette.LayoutView.extend({
    template: template,
   
    initialize : function (options){
        this.options = options;
        this.filter = Filter.fromQueryString(this.options.queryString);
    },
    regions: {
  		search_header: '#page-header',
  		content: '#search-content'
  	},
  	onBeforeShow: function() {
  	},
  	onRender: function(){

        var self = this;
        var queryNames = new QueryNames();

        $.when(
          queryNames.fetch({ data: this.options.queryString })
        )
        .then(function(queryRes){

            self.showChildView('search_header',
                new SearchHeaderView(
                {
                  queryString : self.options.queryString,
                  data: queryRes,
                  searchTerm: self.filter.getConstraintData('q')[0]
                }
            ));

            self.showChildView('content',
                new SearchContentView(
                {
                  queryString : self.options.queryString,
                  data: queryRes
                }
            ));
        });
    },
    onShow: function(){
    }
  });
});