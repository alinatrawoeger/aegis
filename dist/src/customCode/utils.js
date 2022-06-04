import { Map as OLMap, Overlay, View } from 'ol';
import { defaults as defaultControls } from 'ol/control';
import OverviewMap from 'ol/control/OverviewMap';
import GeoJSON from 'ol/format/GeoJSON';
import { defaults, DragRotateAndZoom } from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import 'ol/ol.css';
import { fromLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM';
import VectorSrc from 'ol/source/Vector';
import { Fill, Stroke, Style } from 'ol/style';
// ---------------------------------------------------------------------
export var ZoomLevel;
(function (ZoomLevel) {
    ZoomLevel[ZoomLevel["WORLD"] = 2] = "WORLD";
    ZoomLevel[ZoomLevel["CONTINENT"] = 4] = "CONTINENT";
    ZoomLevel[ZoomLevel["COUNTRY"] = 6] = "COUNTRY";
    ZoomLevel[ZoomLevel["REGION"] = 8] = "REGION";
    ZoomLevel[ZoomLevel["CITY"] = 10] = "CITY";
})(ZoomLevel || (ZoomLevel = {}));
// scale for Apdex and also other DT metrics
export var Apdex;
(function (Apdex) {
    Apdex[Apdex["EXCELLENT"] = 1] = "EXCELLENT";
    Apdex[Apdex["GOOD"] = 0.9] = "GOOD";
    Apdex[Apdex["FAIR"] = 0.75] = "FAIR";
    Apdex[Apdex["POOR"] = 0.6] = "POOR";
    Apdex[Apdex["UNACCEPTABLE"] = 0.5] = "UNACCEPTABLE";
})(Apdex || (Apdex = {}));
export var FilterType;
(function (FilterType) {
    FilterType["TEXT"] = "text";
    FilterType["RANGE"] = "range";
})(FilterType || (FilterType = {}));
export var getFilterType = function (filterName) {
    switch (filterName) {
        case 'apdex':
        case 'taskid':
            return FilterType.RANGE;
        case 'continents':
        case 'countries':
        case 'regions':
        case 'cities':
        case 'friend':
        default:
            return FilterType.TEXT;
    }
};
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
        var minimapControl = new OverviewMap({
            className: 'ol-overviewmap ol-custom-overviewmap',
            layers: [new TileLayer({
                    source: new OSM(),
                })],
            collapseLabel: '\u00BB',
            label: '\u00AB',
            collapsed: false,
        });
        return new OLMap({
            controls: defaultControls().extend([minimapControl]),
            interactions: defaults().extend([new DragRotateAndZoom()]),
            target: target,
            layers: [mapLayer],
            view: view
        });
    }
    else {
        return new OLMap({
            target: target,
            layers: [mapLayer],
            view: view
        });
    }
}
// table functions
export function groupValuesPerLocation(data, locationKey) {
    var groupedValuesMap = [];
    for (var i = 0; i < data.length; i++) {
        var curElement = data[i];
        var location_1 = curElement[locationKey];
        if (location_1 != undefined) {
            if (groupedValuesMap[location_1] === undefined) { // add new element
                groupedValuesMap[location_1] = [curElement];
            }
            else { // add new value to existing one
                var value = groupedValuesMap[location_1];
                value.push(curElement);
                groupedValuesMap[location_1] = value;
            }
        }
    }
    // calculate new values per grouping
    var newValues = [];
    for (var location_2 in groupedValuesMap) {
        var value = groupedValuesMap[location_2];
        var newValuesPerLocation = {};
        newValuesPerLocation['location'] = location_2;
        newValuesPerLocation['iso'] = locationKey === 'iso' ? value[0][locationKey] : value[0][locationKey + '-iso'];
        for (var key in value[0]) {
            if (typeof value[0][key] === 'number') {
                var sum = 0;
                for (var i = 0; i < value.length; i++) {
                    sum += value[i][key];
                }
                var avg = sum / value.length;
                newValuesPerLocation[key] = +avg.toFixed(2);
                ;
            }
        }
        newValues.push(newValuesPerLocation);
    }
    newValues.sort(function (a, b) {
        return b.apdex - a.apdex;
    });
    return newValues;
}
// older methods
export function createCountryOverlay(map, selectedColor, hoverColor) {
    var overlayLayer = new VectorLayer({
        source: new VectorSrc({
            url: '../data/geodata/countries.geojson',
            format: new GeoJSON()
        })
    });
    map.addLayer(overlayLayer);
    var selectStyle = new Style({
        fill: new Fill({
            color: 'rgba(0, 0, 0, 0)',
        }),
        stroke: new Stroke({
            color: selectedColor,
            width: 2,
        }),
    });
    var hoverStyle = new Style({
        fill: new Fill({
            color: 'rgba(0, 0, 0, 0)',
        }),
        stroke: new Stroke({
            color: selectedColor,
            width: 2,
        }),
    });
    var hovered;
    var selected;
    map.on('pointermove', function (event) {
        if (hovered !== undefined) {
            hovered.setStyle(undefined);
            hovered = undefined;
        }
        map.forEachFeatureAtPixel(event.pixel, function (feature) {
            if (selected !== feature) {
                hovered = feature;
                hoverStyle.getFill().setColor(hoverColor);
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
            selected = feature;
            selectStyle.getFill().setColor(selectedColor);
            selected.setStyle(selectStyle);
            hovered = undefined;
            var tooltipTitle = document.getElementById('tooltipTitle');
            if (tooltipTitle) {
                if (selected) {
                    tooltipTitle.innerHTML = selected.get('name');
                }
                else {
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
export function createOverlay(target, lon, lat) {
    var pos = fromLonLat([14.2858, 48.3069]);
    var elem = document.getElementById(target);
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
export function switchMetric(colour, element) {
    var overlay = document.getElementById(element);
    if (overlay) {
        overlay.style.backgroundColor = colour;
    }
}
//# sourceMappingURL=utils.js.map