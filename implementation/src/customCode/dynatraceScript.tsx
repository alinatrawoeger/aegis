import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import Filterbar from './components/filterbar/Filterbar';
import FilterSuggestionPanel from './components/filterbar/FilterSuggestion';
import CustomMap from './components/map/Map';
import MetricSwitcher from './components/metricswitcher/MetricSwitcher';
import Table from './components/table/Table';
import data from './data/dt_database';
import geodata from './data/dt_filters';
import { groupValuesPerLocation, ZoomLevel } from './utils';

// TODO Map:
// - Farbabstufungen bei violetten Daten
// - Klick auf Karte soll Filter setzen
// - erneuter klick auf markiertes country soll die markierung aufheben

// TODO Filterbar:
// - Filter Suggestions -> Style suggestions properly
// - Filterbar soll Daten beeinflussen
// - Filter Suggestions -> type in letters to find suggestions

class DynatraceWorldmapApp extends Component {
    // test data (coordinates of Linz)
    longitude = 14.2858;
    latitude = 48.3069;

    filterbarPanel = 'filter-panel';
    metricswitcherPanel = 'metricswitcher-panel';
    selectedMetricId = 'metricswitcher-apdex';
    primaryTableSelector = 'table_tab1';
    secondaryTableSelector = 'table_tab2';
    mapSelector = 'geomap_dt';

    selectedFilters = [];
    filterSuggestions = [];
    selectedMetric = 'apdex';
    currentZoomLevel = ZoomLevel.COUNTRY;
    datasetPrimary = [];
    datasetSecondary = [];
    
    geoLabels = geodata;

    constructor(props) {
        super(props);

        // initialize table & metric switcher stuff
        this.datasetPrimary = this.prepareData(data, ZoomLevel.COUNTRY).datasetPrimary;
        this.datasetSecondary = this.prepareData(data, ZoomLevel.COUNTRY).datasetSecondary;
        
        const filterbar = ReactDOM.createRoot(document.getElementById(this.filterbarPanel)!);
        const filterSuggestions = ReactDOM.createRoot(document.getElementById('suggestiontest')!);
        const metricSwitcher = ReactDOM.createRoot(document.getElementById(this.metricswitcherPanel)!);
        const map = ReactDOM.createRoot(document.getElementById(this.mapSelector)!);
        const primaryTable = ReactDOM.createRoot(document.getElementById(this.primaryTableSelector)!);
        const secondaryTable = ReactDOM.createRoot(document.getElementById(this.secondaryTableSelector)!);
        
        const selectedFiltersCallback = (value) => {
            this.selectedFilters = value;
            // let table and map react
        };

        const filterSuggestionsCallback = (value) => {
            this.filterSuggestions = value;
            // filterSuggestions.render(React.createElement(FilterSuggestionPanel, { suggestions: this.filterSuggestions, isIVolunteer: false }));
        };

        const selectedMetricCallback = (value) => {
            this.selectedMetric = value;
            primaryTable.render(React.createElement(Table, {data: this.datasetPrimary, selectedMetric: this.selectedMetric, isIVolunteer: false }));
            secondaryTable.render(React.createElement(Table, {data: this.datasetSecondary, selectedMetric: this.selectedMetric, isIVolunteer: false}));
            map.render(React.createElement(CustomMap, {selectedMetric: this.selectedMetric, onSetZoom: zoomLevelCallback, hasMinimap: true }));
        };

        const zoomLevelCallback = (value) => {
            this.currentZoomLevel = value;
            this.datasetPrimary = this.prepareData(data, this.currentZoomLevel).datasetPrimary;
            this.datasetSecondary = this.prepareData(data, this.currentZoomLevel).datasetSecondary;

            primaryTable.render(React.createElement(Table, {data: this.datasetPrimary, selectedMetric: this.selectedMetric, isIVolunteer: false }));
            secondaryTable.render(React.createElement(Table, {data: this.datasetSecondary, selectedMetric: this.selectedMetric, isIVolunteer: false}));
        };

        metricSwitcher.render(React.createElement(MetricSwitcher, { isIVolunteer: false, onSetMetric: selectedMetricCallback }));
        primaryTable.render(React.createElement(Table, {data: this.datasetPrimary, selectedMetric: this.selectedMetric, isIVolunteer: false }));
        secondaryTable.render(React.createElement(Table, {data: this.datasetSecondary, selectedMetric: this.selectedMetric, isIVolunteer: false}));
        map.render(React.createElement(CustomMap, {selectedMetric: this.selectedMetric, onSetZoom: zoomLevelCallback, hasMinimap: true }));

        filterbar.render(React.createElement(Filterbar, {isIVolunteer: false, onSelectedFilters: selectedFiltersCallback, onFilterSuggestions: filterSuggestionsCallback}));
    }

    render() {
        return (
            <>
            </>
        )
    }

    prepareData(data: any, zoomLevel: number) {
        let dataLabels = new Map<string, any>();
        dataLabels.set('continent', 'Continent');
        dataLabels.set('country', 'Country');
        dataLabels.set('region', 'Region');
        dataLabels.set('city', 'City');
        
        let tabTitles = this.getTableTabHeaders(zoomLevel);
        let datasetPrimary = groupValuesPerLocation(data, tabTitles[0]);
        let datasetSecondary = groupValuesPerLocation(data, tabTitles[1]);
    
        $('#table_tab1_title').html(dataLabels.get(tabTitles[0]));
        $('#table_tab2_title').html(dataLabels.get(tabTitles[1]));
      
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
      
}

export default DynatraceWorldmapApp;