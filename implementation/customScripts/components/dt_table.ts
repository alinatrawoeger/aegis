import { ZoomLevel } from "../utils";
import geoLabels from '../../data/dt_filters.json';

const dataLabels = new Map<string, any>();
const tableHeadersPerMetric = new Map();

// TODO make this flexible in separate function i guess
let selectedMetric = 'metricswitcher-apdex';

const Table = (data: any, zoomLevel: number, primaryTableSelector: string, secondaryTableSelector: string) => {
    initVariables();
    let tabTitles = getGeographicTableColumnHeaders(zoomLevel);
    let datasetPrimary = groupValuesPerLocation(data, tabTitles[0]);
    let datasetSecondary = groupValuesPerLocation(data, tabTitles[1]);

    fillTableContents(getColumnHeaders(primaryTableSelector, zoomLevel, true), primaryTableSelector, zoomLevel, datasetPrimary);
    fillTableContents(getColumnHeaders(secondaryTableSelector, zoomLevel, false), secondaryTableSelector, zoomLevel, datasetSecondary);
}

export default Table;


// ---------  utility functions

function initVariables() {
    dataLabels.set('continent', 'Continent');
    dataLabels.set('country', 'Country');
    dataLabels.set('region', 'Region');
    dataLabels.set('city', 'City');
    dataLabels.set('apdex', 'Apdex');
    dataLabels.set('useractions', 'User actions');
    dataLabels.set('errors', 'Errors');
    dataLabels.set('loadactions', 'Load actions');
    dataLabels.set('totaluseractions', 'Total user actions');
    dataLabels.set('affecteduseractions', 'Affected user actions');
    dataLabels.set('Actions', 'Actions');

    tableHeadersPerMetric.set('metricswitcher-apdex', ['apdex', 'useractions']);
    tableHeadersPerMetric.set('metricswitcher-ua', ['useractions', 'totaluseractions']);
    tableHeadersPerMetric.set('metricswitcher-load', ['loadactions', 'totaluseractions']);
    tableHeadersPerMetric.set('metricswitcher-xhr', ['loadactions', 'totaluseractions']);
    tableHeadersPerMetric.set('metricswitcher-custom', ['loadactions', 'totaluseractions']);
    tableHeadersPerMetric.set('metricswitcher-errors', ['errors', 'totaluseractions']);
}

function fillTableContents(columnHeaders: string[], tableContainer: string, zoomLevel: number, dataset: Map<string, any>) {
    $(tableContainer + "_title").html(dataLabels.get(columnHeaders[0]));

    for (let key of dataset.keys()) {
        let row$ = $('<tr/>');
        let curElement = dataset.get(key);
        let geolocationKey: string = columnHeaders[0].toString();
        let geolocation = getLocationName(curElement[geolocationKey as keyof typeof curElement]);
       
        if (geolocation == undefined) continue;
        row$.append($('<td/>').html(geolocation));
        
        for (var colIndex = 1; colIndex < columnHeaders.length; colIndex++) {
            let key = columnHeaders[colIndex];
            let cellValue = curElement[key as keyof typeof curElement];
            if (cellValue == null) cellValue = "";
            
            cellValue = cellValue.toString(); // ensure that value is a string

            row$.append($('<td/>').html(cellValue));
        }

        $(tableContainer).append(row$);
    }
}

const getColumnHeaders = (selector: string, zoomLevel: number, primary: boolean): string[] => {
    let columnSet: string[] = [];
    let headerTr$ = $('<tr/>');

    columnSet = columnSet.concat(getGeographicTableColumnHeaders(zoomLevel)[primary ? 0 : 1], tableHeadersPerMetric.get(selectedMetric), 'Actions');
    for (var i = 0; i < columnSet.length; i++) {
        headerTr$.append($('<th/>').html(dataLabels.get(columnSet[i])));
    }
    $(selector).append(headerTr$);

    return columnSet;
}

const getGeographicTableColumnHeaders = (zoomLevel: number): string[] => {
    if (zoomLevel <= ZoomLevel.CONTINENT.level) {
        return ['continent', 'country'];
    } else {
        return ['country', 'region'];
    }
    // TODO add handling for Region/City when data has been expanded
}

const getLocationName = (key: string | number | undefined): string => {
    let geoValue: string;
    geoValue = geoLabels.continents[key as keyof typeof geoLabels.continents];
    if (geoValue === undefined) { // check if geoValue is a country
        geoValue = geoLabels.countries[key as keyof typeof geoLabels.countries];
    }

    if (geoValue === undefined) { // check if geoValue is a region
        for (var i in geoLabels.regions) {
            let temp = geoLabels.regions[i as keyof typeof geoLabels.regions];
            geoValue = temp[key as keyof typeof temp];
            if (geoValue != undefined) {
                break;
            }
        }
    }

    // TODO add check for city when data has been expanded accordingly

    return geoValue;
}

const groupValuesPerLocation = (data: any, locationKey: string) => {
    
    // group values together
    let groupedValuesMap = new Map();
    for (let i = 0; i < data.length; i++) {
        let curElement = data[i];
        let location = curElement[locationKey as keyof typeof curElement];
        
        if (groupedValuesMap.get(location) == undefined) { // add new element
            groupedValuesMap.set(location, [curElement]);
        } else { // add new value to existing one
            let value: any[] = groupedValuesMap.get(location);
            value.push(curElement);
            groupedValuesMap.set(location, value);
        }
    }

    // calculate new values per grouping
    let newValuesMap = new Map();
    groupedValuesMap.forEach(function(value, location){
        let newValuesPerLocation: { [key: string]: any } = {};
        newValuesPerLocation[locationKey] = location;
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
        
        newValuesMap.set(location, newValuesPerLocation);
    });

    return newValuesMap;
}