    class ZoomLevel {
        static WORLD = new ZoomLevel(1);
        static CONTINENT = new ZoomLevel(3);
        static COUNTRY = new ZoomLevel(6);
        static REGION = new ZoomLevel(8);
        static CITY = new ZoomLevel(10);

        constructor(level) {
            this.level = level;
        }
    }

// ---------------------------------------------------------------------

    /**
     * Creates geographic map and puts it into the specified div-element
     * @param {id of div where map should be put into} target 
     * @param {initial zoom level of the map} zoom 
     * @param {longitude} lon 
     * @param {latitude} lat 
     * @param {show minimap in corner or not} hasMinimap 
     * @returns map object
     */
    function createMap(target, zoom, lon, lat, hasMinimap) {
        let mapLayer = new ol.layer.Tile({
            source: new ol.source.OSM(),
            });
        let view = new ol.View({
            center: ol.proj.fromLonLat([lon, lat]),
            zoom: zoom
        });

        if (hasMinimap) {
            const minimapControl = new ol.control.OverviewMap({
                className: 'ol-overviewmap ol-custom-overviewmap',
                layers: [ new ol.layer.Tile({
                    source: new ol.source.OSM(),
                    }) ],
                collapseLabel: '\u00BB',
                label: '\u00AB',
                collapsed: false,
              });

            return new ol.Map({
                controls: ol.interaction.defaults().extend([minimapControl]),
                interactions: ol.interaction.defaults().extend([new ol.interaction.DragRotateAndZoom()]),
                target: target,
                layers: [ mapLayer ],
                view: view
            });
        } else {
            return new ol.Map({
                target: target,
                layers: [ mapLayer ],
                view: view
            });     
        }
    }

    /**
     * Adds markers on the map, e.g. for POIs like cities
     */
    function createMarkers() {

    } 

    /**
     * Creates overlay that can be put on top of a map
     * @param {id of the element that serves as overlay} target 
     * @param {longitude} lon 
     * @param {latitude} lat 
     * @returns overlay object for further customization
     */
    function createOverlay(target, lon, lat) {
        const pos = ol.proj.fromLonLat([14.2858, 48.3069]);

        return marker = new ol.Overlay({
            position: pos,
            positioning: 'center-center',
            element: document.getElementById(target),
            stopEvent: false,
        });
    }

    /**
     * Switches metric and adapts shape and colour of the overlay accordingly
     * @param {background colour of overlay} colour
     */
    function switchMetric(colour, element) {
        let overlay = document.getElementById(element);
        overlay.style.backgroundColor = colour;
    }