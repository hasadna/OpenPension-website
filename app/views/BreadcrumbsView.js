// BreadcrumbsView.js
// -------
define(["jquery", "backbone", "text!templates/heading.html", "portfolio_templates", "Filter", "DataNormalizer", "Dictionary"],

    function($, Backbone, template, templatizer, Filter, DataNormalizer, Dictionary){

        var BreadcrumbsView = Backbone.View.extend({


             // The DOM Element associated with this view
            el: "#breadcrumbs",
        
            // View constructor
            initialize: function(options) {
                this.args = options.args;
            },

            // View Event Handlers
            events: {
                'click li a':'breadCrumbsClick'
            },
            // Renders the view's template to the UI
            render: function() {
                var args = this.args;

                this.filter = Filter.fromParsedQueryString(args);

                // Setting the view's template property using the Underscore template method
                this.template =  templatizer.breadcrumbs({drillDown: this.filter.getDrillDown(), filter: this.filter, escapeJSLink: DataNormalizer.escapeJSLink, translate: Dictionary.translate, removeQoutes: DataNormalizer.removeQoutes})
                
                // Dynamically updates the UI with the view's template
                this.$el.html(this.template);

                // Maintains chainability
                return this;

            },
            breadCrumbsClick : function(e) {

                var key = e.target.dataset.value;
                this.deleteBreadCrumbs(key);
            },
            deleteBreadCrumbs :function(key){

                var constraintFields = this.filter.getConstrainedFields();

                for ( var index = constraintFields.length - 1; index >= 0; index-- ) {

                    var field = this.filter.getConstrainedFields()[index];

                    // if bread crumb is equal to field, stop removing
                    if (key == this.filter.getConstraintData(field)) {
                        break;
                    }
                    
                    //remove all fields other than quarter, year and group_by
                    if (field == 'report_qurater' || 
                        field == 'report_year' || 
                        field == 'group_by'){
                        continue;
                    }

                    this.filter.removeField(field);

                }

                location.href = '/#portfolio'+this.filter.toQueryString();
            }

        });

        // Returns the View class
        return BreadcrumbsView;

    }

);