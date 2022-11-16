import Geometry from 'ol/geom/Geometry';
import 'ol/ol.css';
import { fromLonLat } from 'ol/proj';
import dataDt from './data/dt_database';
import dtFilters from './data/dt_filters';
import iVolFilters from './data/ivol_filters';

// ---------------------------------------------------------------------

export enum ZoomLevel {
    WORLD = 2,
    CONTINENT = 4,
    COUNTRY = 6,
    REGION = 8,
    CITY = 10,
    DETAIL = 15
}

export enum UrgencyDays {
    SEVERE = 5,
    HIGH = 15,
    MEDIUM = 50,
    LOW = 100
}

export enum PriorityLevels {
    HIGH = 1,
    MEDIUM = 2,
    LOW = 3
}

export enum DurationLength {
    SHORT = 1,
    MEDIUM = 3,
    LONG = 5
}

export enum Apdex {
    EXCELLENT = 1.00,
    GOOD = 0.94,
    FAIR = 0.85,
    POOR = 0.7,
    UNACCEPTABLE = 0.50
}

export enum FilterType {
    TEXT = 'text',
    RANGE = 'range',
    DATE = 'date',
    RADIUS = 'radius'
}

// ---------------------------------------------------------------------

export const getIVolData = () => {
    const data = JSON.parse(sessionStorage.getItem('iVolData'));
    let dataInTheFuture = [];

    const today = new Date();
    for (let i = 0; i < data.length; i++) {
        const dataDate = new Date(data[i].date.from);
        if (today <= dataDate) {
            dataInTheFuture.push(data[i]);
        }
    }

    return dataInTheFuture;
}

export const getFilterType = (filterName: any) => {
    // check iVolunteer filter database
    const iVolKeys = Object.keys(iVolFilters[0]);
    for (let i = 0; i < iVolKeys.length; i++) {
        let filter = iVolKeys[i];
        if (filter === filterName) {
            return iVolFilters[0][filter].filterType;
        }
    }

    // check Dynatrace filter database
    const dtKeys = Object.keys(dtFilters[0]);
    for (let i = 0; i < dtKeys.length; i++) {
        let filter = dtKeys[i];
        if (filter === filterName) {
            return dtFilters[0][filter].filterType;
        }
    }

    return FilterType.TEXT;
}

export const getIVolFilterName = (filterKey: string) => {
    switch(filterKey) {
        case 'coordinator': return 'Koordinator';
        case 'date': return 'Datum';
        case 'friend': return 'Freund';
        case 'location': return 'Bundesland';
        case 'priority': return 'Priorität';
        case 'taskid': return 'Task ID';
        case 'radius': return 'Standort Radius';
        default: filterKey;
    }
}

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

export const checkForExistingFilter = (filterKey, filters) => {
    let filterExists = false;
    for (let i = 0; i < filters.length; i++) {
        if (filters[i].key === filterKey) {
            filterExists = true;
            break;
        }
    }
    return filterExists;
}

export function getDataFromTaskId(taskId: any) {
    let taskIdNumber = Number(taskId);
    const iVolData = getIVolData();
    for (let i = 0; i < iVolData.length; i++) {
        if (iVolData[i].taskid === taskIdNumber) {
            return iVolData[i];
        }
    }
    return;
}

export function getUrlParameter(input: string) {
    input = input.toLowerCase();

    let url = window.location.search.substring(1);
    let parameters = url.split('&');

    for (let i = 0; i < parameters.length; i++) {
        let urlParam = parameters[i].split('=');

        if (input === urlParam[0].toLowerCase()) {
            return urlParam[1] === undefined ? true : decodeURIComponent(urlParam[1]);
        }
    }
    return;
};

export function getFilteredIVolData(dataset, selectedFilters) {
    let filteredData = [];
    for (let i = 0; i < selectedFilters.length; i++) {
        let curFilterKey = selectedFilters[i].key;
        let curFilterValue = selectedFilters[i].value;
        let curFilterType = getFilterType(curFilterKey);

        // first use full dataset; afterwards use already-filtered data
        let dataSet = i === 0 ? dataset : filteredData;

        let filteredDataPerCycle = [];
        if (curFilterType === FilterType.TEXT) {
            if (curFilterKey === 'friend') {
              for (let j = 0; j < dataSet.length; j++) {
                  let friendsList = dataSet[j][curFilterKey];
                  for (let k = 0; k < friendsList.length; k++) {
                    if (curFilterValue === friendsList[k]) {
                        filteredDataPerCycle.push(dataSet[j]);
                    }
                  }
              }
            } else if (curFilterKey === 'location') {
              for (let j = 0; j < dataSet.length; j++) {
                let dataElement = dataSet[j]['address']['region'];
                if (curFilterValue === dataElement) {
                    filteredDataPerCycle.push(dataSet[j]);
                }
              }
            } else if (curFilterKey === 'priority') {
                for (let j = 0; j < dataSet.length; j++) {
                    let dataElement = dataSet[j][curFilterKey].toString();
                    let sanitizedFilterValue = curFilterValue.split(' - ')[0];
                    if (sanitizedFilterValue === dataElement) {
                        filteredDataPerCycle.push(dataSet[j]);
                    }
                }
            } else {    
                for (let j = 0; j < dataSet.length; j++) {
                    let dataElement = dataSet[j][curFilterKey];
                    if (curFilterValue === dataElement) {
                        filteredDataPerCycle.push(dataSet[j]);
                    }
                }
            }
        } else if (curFilterType === FilterType.RANGE) {
            // click on table should filter for the task ID alone, not for a range
            if (curFilterKey === 'taskid' && curFilterValue.to === '') {
                for (let j = 0; j < dataSet.length; j++) {
                    let dataElement = dataSet[j][curFilterKey];
                    if (curFilterValue.from === dataElement) {
                        filteredDataPerCycle.push(dataSet[j]);
                    }
                }
            } else {
                // actual range filter implementation
                for (let j = 0; j < dataSet.length; j++) {
                    let dataElement = dataSet[j][curFilterKey];
    
                    let filterFrom = curFilterValue[0];
                    let filterTo = curFilterValue[1];
                    if (filterFrom <= dataElement && dataElement <= filterTo) {
                        filteredDataPerCycle.push(dataSet[j]);
                    }
                }
            }
        } else if (curFilterType === FilterType.DATE) {
          for (let j = 0; j < dataSet.length; j++) {
            let dataElement = dataSet[j][curFilterKey];
            let dataFrom = new Date(dataElement.from);
            let dataTo;
            if (dataElement.to !== '') {
              dataTo = new Date(dataElement.to);
            } else {
              dataTo = new Date (dataElement.from);
            }

            let filterFrom = new Date(curFilterValue[0]);
            let filterTo = new Date(curFilterValue[1]);
            filterTo.setUTCHours(23,59,59,999); // set filter to 23:59:59
            if (filterFrom <= dataFrom) {
                if (dataTo <= filterTo) {
                filteredDataPerCycle.push(dataSet[j]);
                }
            }
          }
        } else if (curFilterType === FilterType.RADIUS) {
            let radiusFilter = curFilterValue as Geometry;
            for (let j = 0; j < dataSet.length; j++) {
                const dataElementCoordinates = dataSet[j]['address']['coordinates'];
                const coordinatesSanitized = fromLonLat([ dataElementCoordinates[1], dataElementCoordinates[0]]); // intersectsCoordinate needs LonLat in reverse order
                if (radiusFilter.intersectsCoordinate(coordinatesSanitized)) {
                    filteredDataPerCycle.push(dataSet[j]);
                }
            }
        } else {
            for (let j = 0; j < dataSet.length; j++) {
                let dataElement = dataSet[j][curFilterKey];
                if (curFilterValue === dataElement) {
                    filteredDataPerCycle.push(dataSet[j]);
                }
            }
        }

        filteredData = filteredDataPerCycle;
    }
    
    return selectedFilters.length > 0 ? filteredData : dataset;
  }

export function filterDtData(selectedFilters ) {
    let filteredData = [];
    for (let i = 0; i < selectedFilters.length; i++) {
        let curFilterKey = selectedFilters[i].key;
        let curFilterValue = selectedFilters[i].value;
        let curFilterType = getFilterType(curFilterKey);

        // first use full dataset; afterwards use already-filtered data
        let dataSet = i === 0 ? dataDt : filteredData;

        let filteredDataPerCycle = [];
        if (curFilterType === FilterType.TEXT) {
            for (let j = 0; j < dataSet.length; j++) {
                let dataElement = dataSet[j][curFilterKey];
                if (curFilterValue === dataElement) {
                    filteredDataPerCycle.push(dataSet[j]);
                }
            }
        } else if (curFilterType === FilterType.RANGE) {
            for (let j = 0; j < dataSet.length; j++) {
                let dataElement = dataSet[j][curFilterKey];

                let filterFrom = curFilterValue[0];
                let filterTo = curFilterValue[1];
                if (filterFrom <= dataElement && dataElement <= filterTo) {
                    filteredDataPerCycle.push(dataSet[j]);
                }
            }
        }
        filteredData = filteredDataPerCycle;
    }
    
    return selectedFilters.length > 0 ? filteredData : dataDt;
}

export const getPriorityLevelText = (level: number) => {
    switch(level) {
        case PriorityLevels.HIGH:
            return 'hoch';
        case PriorityLevels.MEDIUM:
            return 'mittel';
        case PriorityLevels.LOW:
            return 'niedrig';
        default:
            return '<n/a>';
    }
}