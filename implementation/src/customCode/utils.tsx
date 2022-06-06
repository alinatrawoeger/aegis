import { Map as OLMap, View } from 'ol';
import { defaults as defaultControls } from 'ol/control';
import OverviewMap from 'ol/control/OverviewMap';
import { defaults, DragRotateAndZoom } from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import 'ol/ol.css';
import { fromLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM';
import dataIVol from './data/ivol_database';

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

export function getDataFromTaskId(taskId: any) {
    let taskIdNumber = Number(taskId);
    for (let i = 0; i < dataIVol.length; i++) {
        if (dataIVol[i].taskid === taskIdNumber) {
            return dataIVol[i];
        }
    }
    return;
}

export function getUrlParameter(parameter: string) {
    let url = window.location.search.substring(1);
    let parameters = url.split('&');

    for (let i = 0; i < parameters.length; i++) {
        let parameterName = parameters[i].split('=');

        if (parameterName[0] === parameter) {
            return parameterName[1] === undefined ? true : decodeURIComponent(parameterName[1]);
        }
    }
    return;
};

