// PortfolioView.js
// -------
define(["jquery", "backbone", "text!templates/heading.html", "portfolio_templates", "Filter", "DataNormalizer", "views/TitleView", "views/BreadcrumbsView",  "views/MoreView", "views/HeaderView"],

    function($, Backbone, template, templatizer, Filter, DataNormalizer, BreadcrumbsView, TitleView, MoreView, HeaderView){

                
        var PortfolioView = Backbone.View.extend({

            el: "",

            // View constructor
            initialize: function(args) {
                this.render(args);
            },
            // Renders the view's template to the UI
            render: function(args) {
                
      
                this.headerView = new HeaderView({args: args}).render();
        
                this.titleView = new TitleView({args: args}).render();
                // this.breadcrumbsView.initialize(args),
                this.breadcrumbsView = new BreadcrumbsView({args: args}).render();
      
                this.moreView = new MoreView({args: args}).render();
      
      
                // Maintains chainability
                return this;

            }

        });

        // Returns the View class
        return PortfolioView;

    }

);