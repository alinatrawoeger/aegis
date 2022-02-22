import 'ol/ol.css';
import { Map, Overlay, View } from 'ol';
import OverviewMap from 'ol/control/OverviewMap';
import GeoJSON from 'ol/format/GeoJSON';
import { defaults, DragRotateAndZoom } from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM';
import VectorSrc from 'ol/source/Vector';
import { Fill, Stroke, Style } from 'ol/style';

// ---------------------------------------------------------------------

export class ZoomLevel {
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
export function createMap(target, zoom, lon, lat, hasMinimap) {
    var mapLayer = new TileLayer({
        source: new OSM()
    });
    var view = new View({
        center: fromLonLat([lon, lat]),
        zoom: zoom
    });

    if (hasMinimap) {
        const minimapControl = new OverviewMap({
            className: 'ol-overviewmap ol-custom-overviewmap',
            layers: [ new TileLayer({
                source: new OSM(),
                }) ],
            collapseLabel: '\u00BB',
            label: '\u00AB',
            collapsed: false,
            });

        return new Map({
            controls: defaults().extend([minimapControl]),
            interactions: defaults().extend([new DragRotateAndZoom()]),
            target: target,
            layers: [ mapLayer ],
            view: view
        });
    } else {
        return new Map({
            target: target,
            layers: [ mapLayer ],
            view: view
        });     
    }
}

export function createCountryOverlay(map, selectedColor, hoverColor) {
    let overlayLayer = new VectorLayer({
        source: new VectorSrc({
            url: 'https://openlayers.org/en/v4.6.5/examples/data/geojson/countries.geojson',
            format: new GeoJSON()
        })
    });
    map.addLayer(overlayLayer);

    const selectStyle = new Style({
        fill: new Fill({
            color: 'rgba(0, 0, 0, 0)',
        }),
        stroke: new Stroke({
            color: selectedColor,
            width: 2,
        }),
        });

    const hoverStyle = new Style({
        fill: new Fill({
            color: 'rgba(0, 0, 0, 0)',
        }),
        stroke: new Stroke({
            color: selectedColor,
            width: 2,
        }),
    });  
    
    let hovered = null;
    let selected = null;
    map.on('pointermove', function (e) {
        if (hovered !== null) {
            hovered.setStyle(undefined);
            hovered = null;
        }
        
        map.forEachFeatureAtPixel(e.pixel, function (f) {
            if (selected !== f) {
                hovered = f;
                hoverStyle.getFill().setColor(hoverColor);
                hovered.setStyle(hoverStyle);
                
                if (selected != null) {
                    selectStyle.getFill().setColor(selectedColor);
                    selected.setStyle(selectStyle);
                }
            }
            return true;
        });

        // TODO add regions per country when zoom level is high enough
    });

    map.on('pointerdown', function (e) {       
        if (selected !== null) {
            selected.setStyle(undefined);
            selected = null;
        }

        map.forEachFeatureAtPixel(e.pixel, function (f) {            
            selected = f;
            selectStyle.getFill().setColor(selectedColor);
            f.setStyle(selectStyle);
            hovered = null;
            return true;
        });

        const tooltipTitle = document.getElementById('tooltipTitle');
        if (selected) {
            tooltipTitle.innerHTML = selected.A.name;
        } else {
            tooltipTitle.innerHTML = '&nbsp;';
        }
    });

    return map;
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
export function createOverlay(target, lon, lat) {
    const pos = fromLonLat([14.2858, 48.3069]);

    return new Overlay({
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
export function switchMetric(colour, element) {
    let overlay = document.getElementById(element);
    overlay.style.backgroundColor = colour;
}