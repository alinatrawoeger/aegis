import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import CustomMap from './components/map/Map';
import MetricSwitcher from './components/metricswitcher/MetricSwitcher';
import Table from './components/table/Table';
import data from './data/dt_database';
import geodata from './data/dt_filters.json';
import { ZoomLevel } from './utils';

// TODO table:
// - Grouping der Daten auslagern und darauf zugreifen anstatt mehrfach implementieren
// - Apdex-Overlay Farbe auf Apdex-Wert reagieren lassen
// - ZoomLevel setzen beim zoomen damit table drauf reagiert

// TODO others:
// - Beispieldaten reinfeeden in Filterbar
// - Filterbar soll Daten beeinflussen
// - erneuter klick auf markiertes country soll die markierung aufheben

class DynatraceWorldmapApp extends Component {
    // test data (coordinates of Linz)
    longitude = 14.2858;
    latitude = 48.3069;

    dataLabels = new Map<string, any>();

    metricColorMapSelected = new Map();
    metricColorMapHover = new Map();

    metricswitcherPanel = 'metricswitcher-panel';
    selectedMetricId = 'metricswitcher-apdex';
    selectedMetric = 'apdex';
    primaryTableSelector = 'table_tab1';
    secondaryTableSelector = 'table_tab2';

    initialSelectedColor = this.metricColorMapSelected.get('metricswitcher-apdex');
    initialHoverColor = this.metricColorMapHover.get('metricswitcher-apdex');

    geoLabels = geodata;

    constructor(props) {
        super(props);

        // initialize variables
        this.dataLabels.set('continent', 'Continent');
        this.dataLabels.set('country', 'Country');
        this.dataLabels.set('region', 'Region');
        this.dataLabels.set('city', 'City');

        this.metricColorMapSelected.set('metricswitcher-apdex', 'rgba(61, 199, 29, 1)');
        this.metricColorMapSelected.set('other', 'rgba(97, 36, 127, 1)');

        this.metricColorMapHover.set('metricswitcher-apdex', 'rgba(61, 199, 29, 0.5)');
        this.metricColorMapHover.set('other', 'rgba(97, 36, 127, 0.5)');

        // initialize table & metric switcher stuff
        let { datasetPrimary, datasetSecondary } = this.prepareData(data, ZoomLevel.COUNTRY);
        
        const metricSwitcher = ReactDOM.createRoot(document.getElementById(this.metricswitcherPanel)!);
        const map = ReactDOM.createRoot(document.getElementById('geomap_dt')!);
        const primaryTable = ReactDOM.createRoot(document.getElementById(this.primaryTableSelector)!);
        const secondaryTable = ReactDOM.createRoot(document.getElementById(this.secondaryTableSelector)!);
        
        const selectedMetricCallback = (value) => {
            this.selectedMetric = value;
            primaryTable.render(React.createElement(Table, {data: datasetPrimary, selectedMetric: this.selectedMetric, isIVolunteer: false }));
            secondaryTable.render(React.createElement(Table, {data: datasetSecondary, selectedMetric: this.selectedMetric, isIVolunteer: false}));
            map.render(React.createElement(CustomMap, {selectedMetric: this.selectedMetric, hasMinimap: true }));
        };

        metricSwitcher.render(React.createElement(MetricSwitcher, { isIVolunteer: false, onSetMetric: selectedMetricCallback }));
        primaryTable.render(React.createElement(Table, {data: datasetPrimary, selectedMetric: this.selectedMetric, isIVolunteer: false }));
        secondaryTable.render(React.createElement(Table, {data: datasetSecondary, selectedMetric: this.selectedMetric, isIVolunteer: false}));
        map.render(React.createElement(CustomMap, {selectedMetric: this.selectedMetric, hasMinimap: true }));
    }

    // table methods
    prepareData = (data: any, zoomLevel: number) => {
        let tabTitles = this.getTableTabHeaders(zoomLevel);
        let datasetPrimary = this.groupValuesPerLocation(data, tabTitles[0]);
        let datasetSecondary = this.groupValuesPerLocation(data, tabTitles[1]);
    
        $('#table_tab1_title').html(this.dataLabels.get(tabTitles[0]));
        $('#table_tab2_title').html(this.dataLabels.get(tabTitles[1]));
      
        return {datasetPrimary, datasetSecondary};
    }
      
    getTableTabHeaders = (zoomLevel: number): string[] => {
        if (zoomLevel <= ZoomLevel.CONTINENT) {
            return ['continent', 'country'];
        } else {
            return ['country', 'region'];
        }
        // TODO add handling for Region/City when data has been expanded
    }
    
    groupValuesPerLocation = (data: any, locationKey: string) => {
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

    render() {
        return (
            <>
            </>
        )
    }
}

export default DynatraceWorldmapApp;