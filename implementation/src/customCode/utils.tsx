import { Feature, Map as OLMap, Overlay, View } from 'ol';
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

export enum ZoomLevel {
    WORLD = 2,
    CONTINENT = 4,
    COUNTRY = 6,
    REGION = 8,
    CITY = 10
}

export enum Apdex {
    EXCELLENT = 1.00,
    GOOD = 0.90,
    FAIR = 0.75,
    POOR = 0.60,
    UNACCEPTABLE = 0.50
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

        return new OLMap({
            controls: defaultControls().extend([minimapControl]),
            interactions: defaults().extend([new DragRotateAndZoom()]),
            target: target,
            layers: [ mapLayer ],
            view: view
        });
    } else {
        return new OLMap({
            target: target,
            layers: [ mapLayer ],
            view: view
        });     
    }
}

// table functions
export function groupValuesPerLocation(data: any, locationKey: string) {
    let groupedValuesMap: any[] = [];
    for (let i = 0; i < data.length; i++) {
        let curElement = data[i];
        let location = curElement[locationKey as keyof typeof curElement];
        
        if (location != undefined) {
            if (groupedValuesMap[location] === undefined) { // add new element
                groupedValuesMap[location] = [curElement];
            } else { // add new value to existing one
                let value: any[] = groupedValuesMap[location];
                value.push(curElement);
                groupedValuesMap[location] = value;
            }
        }
    }
    
    // calculate new values per grouping
    let newValues: any[] = [];
    for (let location in groupedValuesMap) {
        let value = groupedValuesMap[location];
    
        let newValuesPerLocation: { [key: string]: any } = {};
        newValuesPerLocation['location'] = location;
        newValuesPerLocation['iso'] = value[0][locationKey + '-iso'];
        for (let key in value[0]) {
            if (typeof value[0][key] === 'number') {
                let sum = 0;
                for (let i = 0; i < value.length; i++) {
                    sum += value[i][key];
                }
                let avg = sum / value.length;
    
                newValuesPerLocation[key] = avg.toFixed(2);;
            }
        }
        
        newValues.push(newValuesPerLocation);
    }
    
    newValues.sort(function(a, b){
        return b.apdex - a.apdex;
    });
    
    return newValues;
}


// older methods
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