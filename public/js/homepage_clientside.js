$(function () {


    $.ajax({
        url: '/highcharts_managing_body',
        datatype: "json",
        success: function(data) 
        {
            drawGraph(data);
        },
    });
    
});

//add new constraint to filter and reload page
function addConstraint(key, value) {

    //generate filter from query string
    var filter = Filter.fromQueryString(window.location.search);

    //add constraint from user
    filter.setConstraint(key, value);

    //convert filter back to query string, and apply location
    window.location.href = '/portfolio' + filter.toQueryString();
}



function drawGraph(data){
    $('#container').highcharts({
        chart: {
            margin: 0,
            plotBackgroundColor: null,
            plotBorderWidth: 0,
            plotShadow: false
        },
        plotOptions: {
            pie: {
                slicedOffset: 0,
                dataLabels: {
                    enabled: true,
                    distance: -50,
                    style: {
                        fontWeight: 'bold',
                        color: 'white',
                        textShadow: '0px 1px 2px black'
                    }
                },
                size:'100%',
                startAngle: -90,
                endAngle: 90,
                center: ['50%', '75%'],
                colors: ["#3B70BF"],
                point: {
                    events: {
                        click: function () {
                            if (this.link == "others"){
                                $('#myModal').modal('show');
                                $.ajax($("#modal-anchor").data("remote"))
                                    .success(function(res){
                                        $(".modal-content").html(res);
                                    });
                            }
                            else{
                                location.href = this.link;
                            }
                        }
                    }
                }

            }
        },
        title: {
            text: 'שוק הפנסיה',
            align: 'center',
            verticalAlign: 'middle',
            y: 60
        },
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        tooltip: {
            useHTML: true,
            formatter: function()
            {
                var color = "";
                return '<div style="direction:rtl;text-align:right">' + 
                    '<p><b>'+this.point.name+'</b></p><p>חלק מהשוק:' + Number(this.y * 100).toFixed(1) + '% </p></div>';
            }
        },
        series: [{
            type: 'pie',
            name: 'חלק יחסי',
            innerSize: '50%',
            data: data
        }]
    });
}