class MapboxCircle {
    constructor( options ) {
        this.id = options.center.lng + '' + options.center.lat + '' + options.radius;
        this.type = 'circle';
        this.center = options.center;
        this.addSource( options );
        this.addLayer( options );
    }
    remove() {
        if ( window.map.getLayer( this.id ) ) {
            window.map.removeLayer( this.id );
            window.map.removeSource( this.id );
        }
    }
    addSource( options ) {
        window.map.addSource( this.id, {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': [{
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [ options.center.lng, options.center.lat ]
                    }
                }]
            }
        })
    }
    addLayer( options ) {
        window.map.addLayer({
            'id': this.id,
            'type': 'circle',
            'source': this.id,
            'paint': {
                'circle-radius': options.radius * 0.00125,
                'circle-color': options.fillColor || options.strokeColor,
                'circle-opacity': options.fillOpacity,
                'circle-stroke-width': options.strokeWeight,
                'circle-stroke-color': options.strokeColor,
                'circle-stroke-opacity': options.strokeOpacity,
                'circle-translate': options.offset || [ 0, 0 ],
                'circle-translate-anchor': options.circleTranslateAnchor || 'viewport',
                'circle-pitch-alignment': options.circlePitchAlignment || 'map'
            }
        });
    }
    addTo() {}
    setCenter( latLng ) {
        this.center = latLng;
        window.map.getSource( this.id ).setData( {
            'type': 'FeatureCollection',
            'features': [{
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [ latLng.lng, latLng.lat ]
                }
            }]
        })        
    }
    getCenter() {
        return this.center;
    }
}

export default MapboxCircle;
