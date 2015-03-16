

//////////////////// GRAPH

$(function () {


    //get current year and quarter if not set in cookie
    if ($.cookie("current_year") == undefined||
        $.cookie("current_quarter") == undefined){

                $.getJSON("/api/config", function(config){
                    $.cookie("current_year", config.current_year);
                    $.cookie("current_quarter", config.current_quarter);
                });
    }
        

   
    /**
     * Create a constructor for sparklines that takes some sensible defaults and merges in the individual 
     * chart options. This function is also available from the jQuery plugin as $(element).highcharts('SparkLine').
     */
        Highcharts.SparkLine = function (options, callback) {
            var defaultOptions = {
                chart: {
                    renderTo: (options.chart && options.chart.renderTo) || this,
                    backgroundColor: null,
                    borderWidth: 0,
                    type: 'line',
                    margin: [2, 0, 2, 0],
                    width: 80,
                    height: 20,
                    style: {
                        overflow: 'visible'
                    },
                    skipClone: true
                },
                title: {
                    text: ''
                },
                credits: {
                    enabled: false
                },
                xAxis: {
                    labels: {
                        enabled: false
                    },
                    title: {
                        text: null
                    },
                    startOnTick: false,
                    endOnTick: false,
                    tickPositions: []
                },
                yAxis: {
                    endOnTick: false,
                    startOnTick: false,
                    labels: {
                        enabled: false
                    },
                    title: {
                        text: null
                    },
                    tickPositions: [0]
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    backgroundColor: null,
                    borderWidth: 0,
                    shadow: false,
                    useHTML: true,
                    hideDelay: 0,
                    shared: true,
                    padding: 0,
                    positioner: function (w, h, point) {
                        return { x: point.plotX - w / 2, y: point.plotY - h};
                    }
                },
                plotOptions: {
                    series: {
                        animation: false,
                        lineWidth: 3, //width of graph
                        shadow: false,
                        states: {
                            hover: {
                                lineWidth: 3 //width of graph line
                            }
                        },
                        marker: {
                            radius: 1,
                            states: {
                                hover: {
                                    radius: 2
                                }
                            }
                        },
                        fillOpacity: 0.25
                    },
                    column: {
                        negativeColor: '#910000',
                        borderColor: 'silver'
                    }
                }
            };
            options = Highcharts.merge(defaultOptions, options);

            return new Highcharts.Chart(options, callback);
        };

    drawSparklines();

});


function drawSparklines(){

    var start = +new Date(),
        $tds = $("div[data-sparkline]"),
        fullLen = $tds.length,
        n = 0;

    // Creating sparkline charts is quite fast in modern browsers, but IE8 and mobile
    // can take some seconds, so we split the input into chunks and apply them in timeouts
    // in order avoid locking up the browser process and allow interaction.
    function doChunk(){
        var time = +new Date(),
            i,
            len = $tds.length;

        for (i = 0; i < len; i++) {
            var $td = $($tds[i]),
                stringdata = $td.data('sparkline'),
                arr = stringdata.split('; '),
                data = $.map(arr[0].split(', '), parseFloat),
                chart = {};

            if (arr[1]) {
                chart.type = arr[1];
            }

            var color;
            var dataDif = data[3] - data[0];
  
            if (dataDif < 0){
                color = '#FFBE4C'; //yellow
            }
            else if(dataDif == 0){
                color = '#999999'; //gray
            }
            else{
                color = '#7FB2FF'; //blue
            }

            $td.highcharts('SparkLine', {
                series: [{
                    color: color,
                    data: data,
                    pointStart: 1
                }],
                tooltip: {
                    //headerFormat: '<span style="font-size: 10px">' + $td.parent().find('th').html() + ', Q{point.x}:</span><br/>',
                    headerFormat :'',
                    pointFormat: '<b>% {point.y}</b>'
                },
                chart: chart
            });

            n++;
            
            // If the process takes too much time, run a timeout to allow interaction with the browser
            if (new Date() - time > 1500) {
                $tds.splice(0, i + 1);
                setTimeout(doChunk, 0);
                break;
            }

        }
    }
    doChunk();
    
};


$(function(){

        ///// MODAL EVENTS
        $('body').on('hidden.bs.modal', '.modal', function () {
            $(this).removeData('bs.modal');
            $(".modal-content").empty();
             //alert("hidden");
        });

        $(".modal").on("show.bs.modal",function()
        {
            $(".modal-content").html("טוען נתונים...")
           // alert("show");  
        });
        
        $(".modal").on("shown.bs.modal",function()
        {
            // alert("shown");
        });

        $('body').on('loaded.bs.modal', '.modal', function () {
            // alert("loaded");
            drawSparklines();
       });
});


////// TYPEAHEAD
$(function(){

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
     
    $('#rtl-support .typeahead').typeahead({
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
   }
  );

    $('.typeahead').bind('typeahead:closed', function(obj, datum, name) {      
            $(".typeahead").val("")

    })

    $('.typeahead').bind('typeahead:selected', function(obj, datum, name) {      

            var filter = Filter.fromQueryString(window.location.search)

            var field = Object.keys(datum)[0];
            var value = datum[field];
            var year = filter.getConstraintData("report_year")[0]
            var quarter = filter.getConstraintData("report_qurater")[0]
            var action = datum['action'];

            $(".typeahead").val("");


            if (action == 'query_instruments'){
                field = 'q';
                value = datum['queryText'];
                navigate('/search-results?'+field+'='+value);
                return;
            }
            else{
    
                //get year and quarter from cookie if undefined
                if (year == undefined){
                    year = $.cookie("current_year");
                }

                if (quarter == undefined){
                    quarter = $.cookie("current_quarter");
                }
                

                //managing body shows translated value 
                if (field == "translated_managing_body"){
                    value = datum["managing_body"];
                    field = "managing_body";
                }
         
                navigate('/portfolio?report_year='+year+'&report_qurater='+quarter+'&'+field+'='+value);

            }


    });


    $(".typeahead").keydown(function(event){
        
        if(event.keyCode == 13){
            event.preventDefault();
            window.location ='/search-results?q=' + $(".typeahead").val();        
            return false;
        }
    });
})