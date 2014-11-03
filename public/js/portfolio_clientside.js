$(function () {

    //initialize quarter select element
    $('#select-quarter').selectpicker();

    //handle quarter change
    $('#select-quarter').on('change', function () {
        
        //generate filter from query string
        var filter = Filter.fromQueryString(window.location.search);

        var quarterData = JSON.parse(this.value);

        //add constraint from user
        filter.setConstraint("report_year", quarterData.year);
        filter.setConstraint("report_qurater", quarterData.quarter);


        navigate(filter.toQueryString());
    
    });


    //handle back events
    window.onpopstate = function (event) {
        var filter = Filter.fromQueryString();
        loadTemplates(filter);
    };


});


//change url either by history & ajax or by setting new location 
function navigate(url){

    if (history.pushState != null){
        history.pushState("", "", url);

        //convert filter back to query string, and apply location
        loadTemplates(filter);

    }
    else{
        window.location = url;
    }

}

/**
 * Remove query parameters from end of 
 * query string till selected parameter key
 * 
 * @param key : selected parameter
 *
 */

function breadCrumbs(key) {

    //generate filter from query string
    var filter = Filter.fromQueryString(window.location.search);
    
    var constraintFields = filter.getConstrainedFields();

    for ( var index = constraintFields.length - 1; index >= 0; index-- ) {

        var field = filter.getConstrainedFields()[index];

        // if bread crumb is equal to field, stop removing
        if (key == filter.getConstraintData(field)) {
            break;
        }
        
        //remove all fields other than quarter, year and group_by
        if (field == 'report_qurater' || 
            field == 'report_year' || 
            field == 'group_by'){
            continue;
        }

        filter.removeField(field);

    }

    navigate(filter.toQueryString());


}





/**
 * Group by managing body, if managing body is in the filter
 * and by last four quarters
 * @param filter : Filter object 
 * @param callback : function to handle result rows
 */

function groupByManagingBody(filter){
    
  var mFilter = new Filter();

  if (filter.hasConstraint("managing_body") 
            &&  filter.getDrillDownDepth() > 1){
        mFilter.addConstraint("managing_body", filter.getConstraintData("managing_body"));
  }

  //add year and quarter to new fiter
  mFilter.addConstraint("report_year", filter.getConstraintData("report_year"));
  mFilter.addConstraint("report_qurater", filter.getConstraintData("report_qurater"));

  return mFilter; 
}

//load templates by filter
function loadTemplates(filter){

    //show message on data table
    $('#aggregate-data-panel').block({ 
        message: '<h1>טוען נתונים...</h1>', 
        css: { border: '2px solid #3B70BF' } 
    }); 

    //scroll window to top position
    window.scrollTo(0,0);

    var filter = Filter.fromQueryString();
 
    var managingBodyFilter = groupByManagingBody(filter);

    function success(a1, a2, a3, a4){

        var quarters = a1[0];
        var totalPensionFundQuarters = a2[0];
        var data = a3[0];
        var funds = a4[0];
        var report_year = filter.getConstraintData("report_year")[0];
        var report_qurater = filter.getConstraintData("report_qurater")[0];
        var lastQuarters = getLastQuarters(report_year, report_qurater, 4);

        $("#header").html( templatizer.header( { report_type: getReportType(filter), report_title : createTitle(filter),totalPensionFundQuarters: totalPensionFundQuarters, quarters: quarters , total_sum_words: convertNumberToWords(quarters[0]['fair_value']), filter : filter} ) );
        $("#groups").html(templatizer.groups({ debug: debug, groups:data, rfc3986EncodeURIComponent:rfc3986EncodeURIComponent, quarters: quarters, filter: filter, lastQuarters: lastQuarters} ))
        $("#funds").html(templatizer.funds({ debug: debug, funds:funds, rfc3986EncodeURIComponent:rfc3986EncodeURIComponent} ))
        $("#breadcrumbs").html(templatizer.breadcrumbs({drillDown: filter.getDrillDown(), filter: filter}))
        $("#reportTitle").html(templatizer.report_title( { report_type: getReportType(filter), report_title : createTitle(filter), filter : filter } ) );
        drawSparklines();


        //remove loading message
        $('#aggregate-data-panel').unblock(); 

    }

    function failed(msg){
        $('#aggregate-data-panel').unblock(); 
        console.error(msg);
    }

    
    var deferred = [ $.ajax( "/api/quarters" + filter.toQueryString()), 
            $.ajax( "/api/quarters" + managingBodyFilter.toQueryString()),
            $.ajax( "/api/portfolio" + filter.toQueryString()),
            $.ajax( "/api/funds" + filter.toQueryString()) ];

    $.when.apply($, deferred).then( success , failed);


}

//add new constraint to filter and reload page
function addConstraint(key, value) {

    //generate filter from query string
    var filter = Filter.fromQueryString(window.location.search);

    //add constraint from user
    filter.setConstraint(key, value);

    navigate(filter.toQueryString());

}

//reset filter to year quarter and managing body
function gotoPage(key, value){

    //generate filter from query string
    var filter = Filter.fromQueryString(window.location.search);

    //create new filter for fund page
    var mFilter = new Filter();
    var report_year = filter.getConstraintData("report_year")[0];
    var report_qurater = filter.getConstraintData("report_qurater")[0];
    var managing_body = filter.getConstraintData("managing_body")[0];

    mFilter.setConstraint("report_year",report_year);
    mFilter.setConstraint("report_qurater",report_qurater);
    mFilter.setConstraint("managing_body",managing_body);
    mFilter.setConstraint(key, value);

    navigate(mFilter.toQueryString());

}



/// Sort the tables

function sortTable(table, col, reverse) {
    var tb = table.tBodies[0], // use `<tbody>` to ignore `<thead>` and `<tfoot>` rows
        tr = Array.prototype.slice.call(tb.rows, 0), // put rows into array
        i;
    reverse = ((+reverse) || -1);

    tr = tr.sort(function (a, b) { // sort rows
        return reverse * (Number(a.cells[col].textContent.replace(/[^\d.-]/g, ''))
                 - Number(b.cells[col].textContent.replace(/[^\d.-]/g, '')));

    });
    
    for(i = 0; i < tr.length; ++i) tb.appendChild(tr[i]); // append each row in order
}


$(function () {
    
     //sort the tables
    $('.group-table').each(function(i,table){sortTable(table,2)})

});
//////////////////// GRAPH

$(function () {

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