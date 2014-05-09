$(function () {

    $('#select_quarter').selectpicker();

    $('#select_quarter').on('change', function () {
        //generate filter from query string

        var filter = Filter.fromQueryString(window.location.search);

        var quarterData = JSON.parse(this.value);

        //add constraint from user
        filter.setConstraint("report_year", quarterData.year);
        filter.setConstraint("report_qurater", quarterData.quarter);

        //convert filter back to query string, and apply location
        window.location.href = filter.toQueryString();

    });

});


//add new constraint to filter and reload page
function addConstraint(key, value) {

    //TODO: remove this and implement
    //instrument_details 

    if (value == "NULL") {
        return;
    }

    //generate filter from query string
    var filter = Filter.fromQueryString(window.location.search);

    //add constraint from user
    filter.setConstraint(key, value);

    //convert filter back to query string, and apply location
    window.location.href = filter.toQueryString();
}

function breadCrumbs(key) {

    //generate filter from query string
    var filter = Filter.fromQueryString(window.location.search);

    // remove group by field 
    filter.removeField("group_by");

    // remove from stop=1 fields from array 
    var stop = 0;

    for (var index in filter.getConstrainedFields()) {

        // from here remove all fields from the filter. (always remove the last element from array in each iteration) 
        if (stop == 1) {
            var lastField = filter.getConstrainedFields().pop();
            filter.removeField(lastField);
        }
        // if bread crumb is equal to field data remove all fields from here and on. 
        var field = filter.getConstrainedFields()[index];
        if (key == filter.getConstraintData(field)) {
            stop = 1;
        }
    }

    // browse to new filter
    window.location.href = filter.toQueryString();

}


function setConstraint(key, value) {

    //generate filter from query string
    var filter = Filter.fromQueryString(window.location.search);

    //add constraint from user
    filter.setConstraint(key, value);

    //convert filter back to query string, and apply location
    window.location.href = filter.toQueryString();

}

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
                width: 120,
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
                    lineWidth: 1,
                    shadow: false,
                    states: {
                        hover: {
                            lineWidth: 1
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

    var start = +new Date(),
        $tds = $("td[data-sparkline]"),
        fullLen = $tds.length,
        n = 0;

    // Creating 153 sparkline charts is quite fast in modern browsers, but IE8 and mobile
    // can take some seconds, so we split the input into chunks and apply them in timeouts
    // in order avoid locking up the browser process and allow interaction.
    function doChunk() {
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
            $td.highcharts('SparkLine', {
                series: [{
                    data: data,
                    pointStart: 1
                }],
                tooltip: {
                    headerFormat: '<span style="font-size: 10px">' + $td.parent().find('th').html() + ', Q{point.x}:</span><br/>',
                    pointFormat: '<b>% {point.y}</b>'
                },
                chart: chart
            });

            n++;
            
            // If the process takes too much time, run a timeout to allow interaction with the browser
            if (new Date() - time > 500) {
                $tds.splice(0, i + 1);
                setTimeout(doChunk, 0);
                break;
            }

            // Print a feedback on the performance
            if (n === fullLen) {
                $('#result').html('Generated ' + fullLen + ' sparklines in ' + (new Date() - start) + ' ms');
            }
        }
    }
    doChunk();
    
});