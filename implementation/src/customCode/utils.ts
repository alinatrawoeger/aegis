import { Feature, Map, Map as OLMap, Overlay, View } from 'ol';
import { defaults as defaultControls } from 'ol/control';
import OverviewMap from 'ol/control/OverviewMap';
import GeoJSON from 'ol/format/GeoJSON';
import Geometry from 'ol/geom/Geometry';
import { defaults, DragRotateAndZoom } from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import 'ol/ol.css';
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
    
    level: number;

    constructor(level: number) {
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
export function createMap(target: string, zoom: ZoomLevel, lon: number, lat: number, hasMinimap: boolean) {
    var mapLayer = new TileLayer({
        source: new OSM()
    });
    var view = new View({
        center: fromLonLat([lon, lat]),
        zoom: zoom.level
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
            controls: defaultControls().extend([minimapControl]),
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

export function createCountryOverlay(map: OLMap, selectedColor: string, hoverColor: string) {
    let overlayLayer = new VectorLayer({
        source: new VectorSrc({
            url: '../data/geodata/countries.geojson',
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

    let hovered: Feature<Geometry> | undefined;
    let selected: Feature<Geometry> | undefined;
    map.on('pointermove', function (event) {
        if (hovered !== undefined) {
            hovered.setStyle(undefined);
            hovered = undefined;
        }
        
        map.forEachFeatureAtPixel(event.pixel, function (feature) {
            if (selected !== feature) {
                hovered = feature as Feature<Geometry>;
                hoverStyle.getFill().setColor(hoverColor)
                hovered.setStyle(hoverStyle);
                
                if (selected !== undefined) {
                    selectStyle.getFill().setColor(selectedColor);
                    selected.setStyle(selectStyle);
                }
            }
            return true;
        });

        // TODO add regions per country when zoom level is high enough
    });

    map.on('click', function (e) {       
        
        if (selected !== undefined) {
            selected.setStyle(undefined);
            selected = undefined;
        }
        
        map.forEachFeatureAtPixel(e.pixel, function (feature) {            
            selected = feature as Feature<Geometry>;
            selectStyle.getFill().setColor(selectedColor);
            selected.setStyle(selectStyle);
            hovered = undefined;
            
            const tooltipTitle = document.getElementById('tooltipTitle');
            if (tooltipTitle) {
                if (selected) {
                    tooltipTitle.innerHTML = selected.get('name');
                } else {
                    tooltipTitle.innerHTML = '&nbsp;';
                }
            }
            
            return true;
        });

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
export function createOverlay(target: string, lon: number, lat: number) {
    const pos = fromLonLat([14.2858, 48.3069]);
    let elem = document.getElementById(target);

    return new Overlay({
        position: pos,
        positioning: 'center-center',
        element: elem ? elem : undefined,
        stopEvent: false,
    });
}

/**
 * Switches metric and adapts shape and colour of the overlay accordingly
 * @param {background colour of overlay} colour
 */
export function switchMetric(colour: string, element: string) {
    let overlay = document.getElementById(element);
    if (overlay) {
        overlay.style.backgroundColor = colour;
    }
}