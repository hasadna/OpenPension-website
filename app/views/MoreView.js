// MoreView.js
// -------
define(["jquery", "backbone", "collections/Funds", "text!templates/heading.html", "portfolio_templates", "Filter", "DataNormalizer", "views/TitleView", "views/BreadcrumbsView", "Dictionary"],

    function($, Backbone, Funds, template, templatizer, Filter, DataNormalizer, BreadcrumbsView, TitleView, Dictionary){

                
        var MoreView = Backbone.View.extend({

            el: "#more",

            // View constructor
            initialize: function(options) {
                this.args = options.args;           
            },

            // View Event Handlers
            events: {
                'click li a':'fundClick'
            },

            fundClick: function(e){
                var value = e.target.dataset.value;
                var field = e.target.dataset.field;

                this.handleFundClick(field, value);
            },
            handleFundClick: function(field, value){

                // this.filter = Filter.fromParsedQueryString(this.args);
                this.filter = new Filter();
                this.filter.setConstraint('managing_body', this.args['managing_body']);
                this.filter.setConstraint(field, value);
              
                // location.href = "/#portfolio" + decodeURI(this.filter.toQueryString());
                location.href = "/#portfolio" + this.filter.toQueryString();
            },
            // Renders the view's template to the UI
            render: function() {

                var args = this.args;
                var self = this;

                if (args == undefined || args['managing_body'] == undefined){
                    self.$el.html("");
                    return;
                }
                var managing_body = args['managing_body'][0];

                var fundsList = new Funds();

                fundsList.fetch({ data: $.param({ managing_body: managing_body}) })
                    .then(function(funds){

                        self.template =  templatizer.more({ funds:funds, managing_body: managing_body, escapeJSLink: DataNormalizer.escapeJSLink, translate: Dictionary.translate} );
                        
                        // Dynamically updates the UI with the view's template
                        self.$el.html(self.template);
                    });
                
                // Maintains chainability
                return self;
            }

        });

        // Returns the View class
        return MoreView;

    }

);