

define(function(require) {
  'use strict';
  
  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var template = require('hbs!/templates/select');


  var SelectView = Marionette.ItemView.extend({
    initialize : function (options){
        if(options.selectedValue){
          options.collection.forEach(function(option){
            if (option.value == options.selectedValue){
              option.selected = true;
            }
          })
        }
    },
    tagName: "select",
    template: template,
    serializeData: function(){
      var firstTitle = this.options.firstTitle || "--SELECT";

      return {
        options: this.collection,
        addFirst: this.options.addFirst,
        firstTitle: firstTitle
      }      
    },
  });

  return SelectView;

});