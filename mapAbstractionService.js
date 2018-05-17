import MapboxCircle from './mapboxCircle'

angular.module('module-GoogleMapsMapboxAbstraction')
.service('mapAbstractionService', ['commonService', 'mapStyles', 'mapStylesLight',
function ( commonService, mapStyles, mapStylesLight ) {

    var service = {
        id: 'mapAbstractionService',
        mapProvider: 'google',
        googleMapsScript: 'https://maps.googleapis.com/maps/api/js?v=3.30&key=AIzaSyDoCXqVxUbMQWnFMgfLZnTh3_h1B87bb3Q',
        mapboxScript: '/js/mapbox-gl.js',
        richMarkerPath: '/js/richmarker.js',
        mapBoxStyleMapping: {
            mapStyles: '/js/mapboxMapStyles.json',
            mapStylesLight: '/js/mapboxMapStylesLight.json'
        },
        eventMappings: {
            google: {
                ZOOM: 'zoom_changed',
                ROTATE: 'heading_changed'
            },
            mapbox: {
                ZOOM: 'zoomend',
                ROTATE: 'rotateend'
            }
        },
        init,
        map,
        circle,
        once,
        infoWindow,
        remove,
        latLng,
        flyTo,
        trigger,
        addMarker,
        project,
        addListener,
        setMapStyle,
        setMaxZoom,
        setInitialMapStyle,
        addDomListener,
        removeListener,
        addCollisionOverlay,
        getLatLngFromEvent,
        getLatLngFromLatLng,
        getLatLngFromMarker,
        getEventMapping,
        getCollisionServiceName,
        getClusterServiceName,
        isStyleLoaded,
        loadSupportLibraries
    };

    const maxTimeToGetMapProvider = 5000;
    let timePassedSoFar = 0;

    return service;

    function init ( $scopeReference, vmReference ) {
        service.$scopeReference = $scopeReference;
        service.vmReference = vmReference;
        return setMapProvider();
    }
    function setMapProvider() {
        return new Promise( resolve => {
            service.mapProvider = 'mapbox';
            loadMapProvider().then( () => {
                resolve( service.mapProvider );
            })
        });
    }
    function loadMapProvider() {
        document.getElementsByTagName( 'body' )[ 0 ].className += ' map-' + service.mapProvider;
        if ( service.mapProvider === 'google' ) {
            return commonService.loadScript( service.googleMapsScript );
        } else {
            return commonService.loadScript( service.mapboxScript );
        }
    }
    function mapProviderIsGoogle() {
        return service.mapProvider === 'google';
    }

    /* Abstraction Methods */
    function addMarker( markerObj ) {
        return mapProviderIsGoogle() ? new window.RichMarker( markerObj ) : addMapboxMarker( markerObj );
    }
    function remove( marker ) {
        return mapProviderIsGoogle() ? marker.setMap( null ) : marker.remove();
    }
    function project( latLng ) {
        return mapProviderIsGoogle() ? fromLatLngToPoint( latLng ) : window.map.project( latLng );
    }
    function circle( options ) {
        return mapProviderIsGoogle() ? new google.maps.Circle( options ) : mapboxCircle( options );
    }
    function flyTo( latLng, zoom ) {
        return mapProviderIsGoogle() ? window.map.panTo( latLng ) && window.map.setZoom( zoom ) : window.map.flyTo( { center: [ latLng.lng, latLng.lat ], zoom: zoom } );
    }
    function infoWindow( options ) {
        return mapProviderIsGoogle() ? new google.maps.InfoWindow( options ) : {};//new mapboxgl.Circle( options );
    }
    function map( element, coordinates, mapStyle ) {
        return mapProviderIsGoogle() ? new Promise ( ( resolve ) => { let map = new google.maps.Map( element, getGoogleMapOptions( coordinates ) ); resolve( map ); } ) : createMapboxMap( element, coordinates, mapStyle );
    }
    function latLng( lat, lng ) {
        return mapProviderIsGoogle() ? new google.maps.LatLng( lat, lng ) : new mapboxLatLng( lat, lng );
    }
    function addListener( target, action, callback ) {
        return mapProviderIsGoogle() ? google.maps.event.addListener( target, action, callback ) : mapboxglDomEvent( target, action, callback );
    }
    function addDomListener( target, action, callback ) {
        return mapProviderIsGoogle() ? google.maps.event.addDomListener( target, action, callback ) : mapboxglDomEvent( target, action, callback );
    }
    function once( action, callback ) {
        return mapProviderIsGoogle() ? google.maps.event.addListenerOnce( window.map, action, callback ) : window.map.once( action, callback );
    }
    function trigger( target, action ) {
        if ( mapProviderIsGoogle() ) google.maps.event.trigger( target, action );
    }
    function removeListener( handle, target, action, callback ) {
        mapProviderIsGoogle() ? google.maps.event.removeListener( handle ) : removeMapboxListener( target, action, callback );
    }
    function setMapStyle( styleName ) {
        return mapProviderIsGoogle() ? setGoogleMapStyle( styleName ) : setMapboxMapStyle( styleName );
    }
    function isStyleLoaded() {
        return mapProviderIsGoogle() ? true : window.map.isStyleLoaded();
    }
    function setMaxZoom( maxZoom ) {
        mapProviderIsGoogle() ? window.map.set( 'maxZoom', maxZoom ) : window.map.setMaxZoom( maxZoom );
    }
    function setInitialMapStyle( styleName ) {
        if ( mapProviderIsGoogle() ) { setGoogleMapStyle( styleName ); };
    }
    function addCollisionOverlay( drawFn ) {
        mapProviderIsGoogle() ? addGoogleCollisionOverlay( drawFn ) : addMapboxCollisionOverlay( drawFn );
    }
    function loadSupportLibraries( drawFn ) {
        return mapProviderIsGoogle() ? loadGoogleDependancies() : loadMapboxDependancies();
    }
    function getLatLngFromEvent( event ) {
        return mapProviderIsGoogle() ? event.latLng : event.lngLat;
    }
    function getLatLngFromLatLng( LatLng ) {
        return mapProviderIsGoogle() ? { lat: LatLng.lat(), lng: LatLng.lng() }: { lat: LatLng.lat, lng: LatLng.lng };
    }
    function getLatLngFromMarker( marker ) {
        return mapProviderIsGoogle() ? { lat: marker.position.lat(), lng: marker.position.lng() }: { lat: marker.getLngLat().lat, lng: marker.getLngLat().lng };
    }
    function getEventMapping( eventName ) {
        return service.eventMappings[ service.mapProvider ][ eventName ];
    }
    function getCollisionServiceName() {
        return mapProviderIsGoogle() ? 'googleCollisionService' : 'mapboxCollisionService';
    }
    function getClusterServiceName() {
        return mapProviderIsGoogle() ? 'googleClusterService' : 'mapboxClusterService';
    }

    /* Google Maps Methods */
    function fromLatLngToPoint( latLng ) {
        var topRight = window.map.getProjection().fromLatLngToPoint(window.map.getBounds().getNorthEast());
        var bottomLeft = window.map.getProjection().fromLatLngToPoint(window.map.getBounds().getSouthWest());
        var scale = Math.pow(2, window.map.getZoom());
        var worldPoint = window.map.getProjection().fromLatLngToPoint(latLng);
        return new google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
    }
    function addGoogleCollisionOverlay( drawFn ) {
        let overlay = new google.maps.OverlayView();
        overlay.setMap( window.map );
        overlay.onAdd = function() {
            overlay.draw = drawFn;
        }
    }
    function setGoogleMapStyle( styleName ) {
        return new Promise( resolve => {
            let mapStyleToUse = styleName === 'mapStyles' ? mapStyles : mapStylesLight;
            let styledMap = new google.maps.StyledMapType( mapStyleToUse, { name: 'Styled Map' } );
            window.map.mapTypes.set( 'map_style', styledMap );
            window.map.setMapTypeId( 'map_style' );
            resolve();
        });
    }
    function getGoogleMapOptions( coordinates ) {
        return {
            scrollwheel: true,
            zoomControl: !commonService.isMobile.any(),
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_TOP
            },
            minZoom: service.vmReference.config.mapMinZoom,
            gestureHandling: 'greedy',
            streetViewControl: false,
            fullscreenControl: false,
            disableDoubleClickZoom: false,
            zoom: service.vmReference.currentMapZoom,
            mapTypeControl: false,
            navigationControlOptions: { style: google.maps.NavigationControlStyle.SMALL },
            mapTypeControlOptions: {
                mapTypeIds: [ google.maps.MapTypeId.ROADMAP, 'map_style' ]
            },
            center: coordinates
        };
    }
    function loadGoogleDependancies() {
        return commonService.loadScript( service.richMarkerPath );
    }

    /* Mapbox Methods */
    function createMapboxMap( element, coordinates, styleName ) {
        return new Promise( (resolve) => {
            var map = new mapboxgl.Map({
                container: 'mapholder',
                style: service.mapBoxStyleMapping[ styleName ],
                center: [ coordinates.lng, coordinates.lat ],
                zoom: 16
            });
            if ( !commonService.isMobile.any() ) {
                map.addControl( new mapboxgl.NavigationControl( { showCompass: false } ) );
            }
            map.on('style.load', () => {
                resolve( map );
            });
        });
    }
    function mapboxCoordinates( coordinates ) {
        if ( Array.isArray( coordinates ) ) {
            return latLng( coordinates[1], coordinates[0] );
        }
    }
    function setMapboxMapStyle( styleName ) {
        return new Promise( resolve => {
            window.map.setStyle( service.mapBoxStyleMapping[ styleName ] );
            window.map.on('style.load', () => {
                resolve();
            });
        });
    }
    function loadMapboxDependancies() {
        extendMapboxMarkerClass();
        return new Promise( ( resolve ) => { resolve(); } );
    }
    function addMapboxMarker( markerObj ) {
        let element = markerObj.content;
        if ( typeof element === 'string' ) {
            element = document.createElement('div');
            element.innerHTML = markerObj.content;
        }
        var marker = new mapboxgl.Marker( element, markerObj )
            .setLngLat([ markerObj.position.lng, markerObj.position.lat ]);
        marker.position = {
            lat: () => { return markerObj.position.lat; },
            lng: () => { return markerObj.position.lng; }
        };
        for ( var prop in markerObj ) {
            if ( typeof markerObj[ prop ] === 'string' ) {
                marker[ prop ] = markerObj[ prop ];
            }
        }
        return marker;
    }
    function mapboxLatLng( lat, lng ) {
        var latLng = new mapboxgl.LngLat( lng, lat );
        latLng.getLat = function() { return this.lat; }
        latLng.getLng = function() { return this.lng; }
        return latLng;
    }
    function extendMapboxMarkerClass() {
        mapboxgl.Marker.prototype.setMap = mapboxgl.Marker.prototype.addTo;
        mapboxgl.Marker.prototype.getPosition = mapboxgl.Marker.prototype.getLngLat;
        // mapboxgl.CircleMarker.prototype.setMap = mapboxgl.CircleMarker.prototype.addTo;
    }
    function mapboxglDomEvent( target, action, callback ) {
        if ( target && typeof target.on === 'function' ) {
            return target.on( action, callback );
        } else if ( target && typeof target.getElement === 'function' ) {
            target.getElement().addEventListener( action, callback);
        }
    }
    function removeMapboxListener( target, action, callback ) {
        if ( target && typeof target.off === 'function' ) {
            target.off( action, callback );
        } else if ( target && typeof target.remove === 'function' ) {
            target.remove();
        }
    }
    function addMapboxCollisionOverlay() {}
    function mapboxCircle( options ) {
        return new MapboxCircle( options );
    }

}]);
