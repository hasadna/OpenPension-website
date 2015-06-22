define([
  'backbone',
  'backbone.marionette',
  'hbs!/templates/homepage',
  '../../views/homepage/HomepageHeaderView',
  '../../views/homepage/HomepageContentView',
  'TreeMap'
],

function (Backbone, Marionette, homepage, HomepageHeaderView, HomepageContentView,
  TreeMap) {
  'use strict';


  function treemapClick(event){
      var link = $(event.target).data("link");

      //clicked on others, open modal
      if (link == "others"){
          $('#myModal').modal('show');
          $.ajax($("#modal-anchor").data("remote"))
              .success(function(res){
                  $(".modal-content").html(res);
                  drawSparklines();
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