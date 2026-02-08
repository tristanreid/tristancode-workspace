$(function () {

    var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    var map = new L.Map('map', {
        center: new L.LatLng(40.70563, -73.97800),
        zoom: 12,
        layers: [osm]
    });

    L.control.scale().addTo(map);
    L.control.locate().addTo(map);

    var initRadius = 50;
    var input_range = $('input.range');
    input_range.attr('value', initRadius);

    var colors = ['#309400', '#3F5D7D', '#f76c00'];
    var coverage = [];
    for (var i = 0; i < 3; i++) {
        coverage[i] = new L.TileLayer.MaskCanvas({ radius: initRadius, color: colors[i], noMask: true, lineColor: colors[i], useAbsoluteRadius: true, 'attribution': 'Get the data at <a href="//data.ny.gov/Economic-Development/Liquor-Authority-Quarterly-List-of-Active-Licenses/hrvs-fxs2">https://data.ny.gov</a>. Code soon to be on <a href="//github.com">Github</a>' });
    }

    var loadOverlay = function (id) {
        var url = 'json_data/' + id + '.json';
        $.getJSON(url).success(function (data) {
            for (var i = 0; i < 3; i++) {
                coverage[i].setData(data[i + 1]);
                map.addLayer(coverage[i]);
            }
        }).error(function (err) {
            alert('An error occurred', err);
        });
    };

    loadOverlay('bar_coords');

    input_range.change(function () {
        var value = $(this).val();
        for (var i = 0; i < 3; i++) {
            coverage[i].setRadius(value);
        }
    });
});
