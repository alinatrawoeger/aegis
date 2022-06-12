import 'ol/ol.css';
import dtFilters from './data/dt_filters';
import dataIVol from './data/ivol_database';
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
    RANGE = 'range',
    DATE = 'date'
}

export const getFilterType = (filterName: any) => {
    // check iVolunteer filter database
    for (let filter in iVolFilters[0]) {
        if (filter === filterName) {
            return iVolFilters[0][filter].filterType;
        }
    }

    // check Dynatrace filter database
    for (let filter in dtFilters[0]) {
        if (filter === filterName) {
            return dtFilters[0][filter].filterType;
        }
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
            } else {
              for (let j = 0; j < dataSet.length; j++) {
                let dataElement = dataSet[j][curFilterKey];
                if (curFilterValue === dataElement) {
                    filteredDataPerCycle.push(dataSet[j]);
                }
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
            if (filterFrom <= dataFrom) {
                if (dataTo !== undefined) {
                  if (dataTo <= filterTo) {
                    filteredDataPerCycle.push(dataSet[j]);
                  }
                } else {
                  filteredDataPerCycle.push(dataSet[j]);
                }
            }
          }
        }

        filteredData = filteredDataPerCycle;
    }
    
    return selectedFilters.length > 0 ? filteredData : dataset;
  }