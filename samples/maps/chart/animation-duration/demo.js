Highcharts.getJSON('https://cdn.jsdelivr.net/gh/highcharts/highcharts@v7.0.0/samples/data/world-population-density.json', function (data) {

    // Initialize the chart
    Highcharts.mapChart('container', {

        chart: {
            animation: {
                duration: 2000
            }
        },

        title: {
            text: 'Longer animation on updates. Click the Plus button or use mousewheel to test.'
        },

        mapNavigation: {
            enabled: true,
            buttonOptions: {
                verticalAlign: 'bottom'
            }
        },

        colorAxis: {
            min: 1,
            max: 1000,
            //type: 'logarithmic',
            stops: [
                [0, '#f8faff'],
                [0.3, '#2f7ed8'],
                [1, '#000000']
            ],
            tickPixelInterval: 100
        },

        series: [{
            data: data,
            mapData: Highcharts.maps['custom/world'],
            joinBy: ['iso-a2', 'code'],
            name: 'Population density',
            states: {
                hover: {
                    color: '#a4edba'
                }
            },
            tooltip: {
                valueSuffix: '/km²'
            }
        }]
    });
});