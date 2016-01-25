define(function(require) {
  'use strict';

  var Backbone = require('backbone');
  var Marionette = require('backbone.marionette');
  var Filter = require('Filter');
  var Dictionary = require('Dictionary');
  var investments = require('hbs!/templates/investment-group');
  var Sparkline = require('Sparkline');

  return Backbone.Marionette.ItemView.extend({
    initialize : function (options){
        this.options = options;
        this.filter = Filter.fromQueryString(this.options.queryString);
    },
    serializeData: function(){
      return {
        managing_body : Dictionary.translate(this.filter.getConstraintData('managing_body')[0]),
        group: this.options.group
      }
    },
    onRender : function(){

    },
    onShow: function(){
      Sparkline.draw();
    },
    template: investments,
    events:{
      "click .table-link": function(ev){
		$('#myModal').modal('hide');
        var value = ev.currentTarget.dataset.value;
        var group = ev.currentTarget.dataset.group;
        this.filter.setConstraint(group, value);
        this.filter.removeField('group_by');
        location.href = "#/portfolio" + this.filter.toQueryString();
      },
    }
  });

});
