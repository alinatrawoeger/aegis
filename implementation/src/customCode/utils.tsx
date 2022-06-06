import { Map as OLMap, View } from 'ol';
import { defaults as defaultControls } from 'ol/control';
import OverviewMap from 'ol/control/OverviewMap';
import { defaults, DragRotateAndZoom } from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import 'ol/ol.css';
import { fromLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM';

// ---------------------------------------------------------------------

export enum ZoomLevel {
    WORLD = 2,
    CONTINENT = 4,
    COUNTRY = 6,
    REGION = 8,
    CITY = 10
}

// scale for Apdex and also other DT metrics
export enum Apdex {
    EXCELLENT = 1.00,
    GOOD = 0.90,
    FAIR = 0.75,
    POOR = 0.60,
    UNACCEPTABLE = 0.50
}

export enum FilterType {
    TEXT = 'text',
    RANGE = 'range'
}

export const getFilterType = (filterName: any) => {
    switch(filterName) {
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
        newValuesPerLocation['iso'] = locationKey === 'iso'? value[0][locationKey] : value[0][locationKey + '-iso'];
        for (let key in value[0]) {
            if (typeof value[0][key] === 'number') {
                let sum = 0;
                for (let i = 0; i < value.length; i++) {
                    sum += value[i][key];
                }
                let avg = sum / value.length;
    
                newValuesPerLocation[key] = +avg.toFixed(2);;
            }
        }
        
        newValues.push(newValuesPerLocation);
    }
    
    newValues.sort(function(a, b){
        return b.apdex - a.apdex;
    });
    
    return newValues;
}
