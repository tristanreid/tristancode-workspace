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

    var markers = L.markerClusterGroup();

    var loadOverlay = function (id) {
        var url = 'json_data/' + id + '.json';
        $.getJSON(url).success(function (data) {
            for (var i = 0; i < data.length; i++) {
                var a = data[i];
                var title = a[2];
                var marker = L.marker(new L.LatLng(a[0], a[1]), { title: title });
                marker.bindPopup(title);
                markers.addLayer(marker);
            }
            map.addLayer(markers);
        }).error(function (err) {
            alert('An error occurred', err);
        });
    };

    loadOverlay('bar_coords_and_names');
});


