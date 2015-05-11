// TitleView.js
// -------
define(["jquery", "backbone", "text!templates/heading.html", "portfolio_templates", "Filter", "DataNormalizer", "TitleGenerator"],

    function($, Backbone, template, templatizer, Filter, DataNormalizer, TitleGenerator){
                
        var TitleView = Backbone.View.extend({

            // The DOM Element associated with this view
            el: "#reportTitle",

            // View constructor
            initialize: function(options) {
                this.args = options.args;
            },

            // View Event Handlers
            events: {
                'click li a':'alert'
            },

            alert: function(e){
                e.preventDefault();
                // alert("ddd");
            },
            // Renders the view's template to the UI
            render: function() {
                var args = this.args;

                this.filter = Filter.fromParsedQueryString(args);

                // Setting the view's template property using the Underscore template method
                this.template =  templatizer.report_title( { report_type: TitleGenerator.getReportType(this.filter), report_title : TitleGenerator.createTitle(this.filter), filter : this.filter } );
                
                // Dynamically updates the UI with the view's template
                this.$el.html(this.template);

                // Maintains chainability
                return this;

            }

        });

        // Returns the View class
        return TitleView;

    }

);