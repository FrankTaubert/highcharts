Highcharts.getJSON('https://demo-live-data.highcharts.com/aapl-ohlcv.json', function (data) {
    var ohlc = [],
        volume = [];

    data.forEach(function (point) {
        ohlc.push([
            point[0],
            point[1],
            point[2],
            point[3],
            point[4]
        ]);
        volume.push([
            point[0],
            point[5]
        ]);
    });

    Highcharts.stockChart('container', {
        title: {
            text: 'On-Balance Volume (OBV)'
        },
        legend: {
            enabled: true
        },
        yAxis: [{
            height: '60%'
        }, {
            height: '20%',
            top: '60%'
        }, {
            height: '20%',
            top: '80%'
        }],
        series: [{
            type: 'candlestick',
            id: 'AAPL',
            name: 'AAPL',
            data: ohlc,
            tooltip: {
                valueDecimals: 2
            }
        }, {
            type: 'column',
            id: 'volume',
            name: 'Volume',
            data: volume,
            yAxis: 1
        }, {
            linkedTo: 'AAPL',
            type: 'obv',
            params: {
                volumeSeriesID: 'volume'
            },
            showInLegend: true,
            yAxis: 2
        }]
    });
});