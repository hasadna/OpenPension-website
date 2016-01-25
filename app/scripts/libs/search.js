define(function(require) {
  'use strict';
  var $ = require('jquery');
  var Filter = require('Filter');
  var _ = require('underscore');
  var config = require('json!config');

  // Static wrapper for typeahead plugin.
  var Search = {

    init: function(){
        console.log('init search');


        var fundNames = new Bloodhound({
          datumTokenizer: Bloodhound.tokenizers.obj.whitespace('fund_name'),
          queryTokenizer: Bloodhound.tokenizers.whitespace,
          remote:
          {
            url: '/api/queryNames?q=%QUERY',
            filter: function(response){
                return response.funds;
            },
            cache: false
          }
        });


        var managingBodies = new Bloodhound({
          datumTokenizer: Bloodhound.tokenizers.obj.whitespace('managingBodies'),
          queryTokenizer: Bloodhound.tokenizers.whitespace,
          remote:
          {
            url: '/api/queryNames?q=%QUERY',
            filter: function(response){
                return response.managingBodies;
            },
            cache: false
          }
        });

        var instrumentNames = new Bloodhound({
          datumTokenizer: Bloodhound.tokenizers.obj.whitespace('instruments'),
          queryTokenizer: Bloodhound.tokenizers.whitespace,
          local : []
          // remote:
          // {
          //   url: '/api/queryNames?q=%QUERY',
          //   filter: function(response){
          //       return response.instrument_name;
          //   },
          //   cache: false
          // }
        });


        fundNames.initialize();
        managingBodies.initialize();
        instrumentNames.initialize();

        $('#nav-search').typeahead({
          highlight: false,
          hint: false,
          minLength: 2
        },
        {
          name: 'managing_body',
          displayKey: 'managing_body',
          source: managingBodies.ttAdapter(),
          templates: {
            header: '<h6 class="league-name">גופים מוסדיים</h6>',
            suggestion: function(data){
              return '<p>' + data.translated_managing_body + '</p>';
            }
          }
        },
        {
          name: 'fund_name',
          displayKey: 'fund_name',
          source: fundNames.ttAdapter(),
          templates: {
            header: '<h6>קופות</h6>'
          }
        }
        ,
        {
          name: 'instrument_name',
          displayKey: 'instrument_name',
          source: instrumentNames.ttAdapter(),
          templates: {
            header: '<h6>שמות נכסים</h6>',
          }
        },
        {
         name: 'instrument-search',
         displayKey: 'name',
         source: function(query, cb) {
            var result = [{
             'name': "לכל התוצאות", 'action': 'query_instruments', 'queryText':query
            }];
            cb(result);
         }
        });



        $('#nav-search').bind('typeahead:closed', function(obj, datum, name) {
			$("#nav-search").val("");
        })

        $('#nav-search').bind('typeahead:selected', function(obj, datum, name) {

                var field = Object.keys(datum)[0];
                var value = datum[field];
                var year = config.current_year;
                var quarter = config.current_quarter;
                var action = datum['action'];

                $("#nav-search").val("");
				$("#nav-search").blur();

                if (action == 'query_instruments'){
                    field = 'q';
                    value = datum['queryText'];
                    window.location.hash = '#/search?'+field+'='+value;
                    return;
                }
                else{

                    //managing body shows translated value
                    if (field == "translated_managing_body"){
                        value = datum["managing_body"];
                        field = "managing_body";
                    }

                    window.location.hash = '#/portfolio?report_year='+year+'&report_qurater='+quarter+'&'+field+'='+value;
					return;
                }
        });

        $("#nav-search").keydown(function(event){

            if(event.keyCode == 13 && !_.isEmpty($("#nav-search").val())){
                event.preventDefault();

                window.location.hash ='#/search?q=' + $("#nav-search").val();
				$("#nav-search").val("");
				$("#nav-search").blur();
				return false;
            }
        });
    }
  }

  return Search;

});
