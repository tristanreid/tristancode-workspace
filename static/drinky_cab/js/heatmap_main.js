function isJFK(latitude, longitude) {
    return -73.820946 < longitude && longitude < -73.7550498 && 40.625471 < latitude && latitude < 40.6579053;
}

function isLGA(latitude, longitude) {
    return -73.8872934 < longitude && longitude < -73.8627566 && 40.7685043 < latitude && latitude < 40.7792779;
}

function isHarbor(latitude, longitude) {
    return longitude === -74.01700158 && latitude === 40.67374628
        || longitude === -73.99874508 && latitude === 40.76439481;
}

function isTrainStation(latitude, longitude) {
    return longitude === -73.99159906 && latitude === 40.74953221
        || longitude === -73.99440774 && latitude === 40.7507815
        || longitude === -73.97786028 && latitude === 40.75300149;

}

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

    var heatmap = new
        L.TileLayer.HeatCanvas({}, {
            'step': 0.2,
            'degree': HeatCanvas.LINEAR, 'opacity': 0.7
        });

    var loadOverlay = function (id) {
        var url = 'json_data/' + id + '.json';
        console.log("SHOW AIRPORTS = " + showAirports);
        $.getJSON(url).success(function (all_data) {
            for (var heat = 1; heat < 4; heat++) {
                var data = all_data[heat];
                for (var i = 0, l = data.length; i < l; i++) {
                    var latitude = data[i][0];
                    var longitude = data[i][1];
                    if (!showAirports) {
                        var isAirport = isLGA(latitude, longitude) || isJFK(latitude, longitude) || isHarbor(latitude, longitude) || isTrainStation(latitude, longitude);
                        if (!isAirport) {
                            heatmap.pushData(latitude, longitude, heat);
                        }
                    }
                    else {
                        heatmap.pushData(latitude, longitude, heat);
                    }
                }
            }
            map.addLayer(heatmap);
        }).error(function (err) {
            alert('An error occurred', err);
        });
    };

    loadOverlay('bar_coords');
});
