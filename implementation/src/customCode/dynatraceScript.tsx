import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import CustomMap from './components/map/Map';
import MetricSwitcher from './components/metricswitcher/MetricSwitcher';
import Table from './components/table/Table';
import data from './data/dt_database';
import geodata from './data/dt_filters.json';
import { prepareData, ZoomLevel } from './utils';

// TODO table:
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

    metricswitcherPanel = 'metricswitcher-panel';
    selectedMetricId = 'metricswitcher-apdex';
    selectedMetric = 'apdex';
    primaryTableSelector = 'table_tab1';
    secondaryTableSelector = 'table_tab2';
    mapSelector = 'geomap_dt';

    geoLabels = geodata;

    constructor(props) {
        super(props);

        // initialize table & metric switcher stuff
        let { datasetPrimary, datasetSecondary } = prepareData(data, ZoomLevel.COUNTRY);
        
        const metricSwitcher = ReactDOM.createRoot(document.getElementById(this.metricswitcherPanel)!);
        const map = ReactDOM.createRoot(document.getElementById(this.mapSelector)!);
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

    render() {
        return (
            <>
            </>
        )
    }
}

export default DynatraceWorldmapApp;