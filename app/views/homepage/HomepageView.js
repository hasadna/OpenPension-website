define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var homepage = require('hbs!/templates/homepage');
  var HomepageHeaderView = require('../../views/homepage/HomepageHeaderView');
  var HomepageContentView = require('../../views/homepage/HomepageContentView');
  var TreeMap = require('TreeMap');
  var Sparkline = require('Sparkline');

  function treemapClick(event){
      var link = $(event.target).closest(".node").data("link");

      //clicked on others, open modal
      if (link == "others"){
          $('#myModal').modal('show');
          $.ajax($("#modal-anchor").data("remote"))
              .success(function(res){
                  $(".modal-content").html(res);
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