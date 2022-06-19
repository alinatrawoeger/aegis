import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import Filterbar from './components/filterbar/Filterbar';
import InteractiveMap from './components/map/Map';
import MetricSwitcher from './components/metricswitcher/MetricSwitcher';
import Table from './components/table/Table';
import data from './data/dt_database';
import { filterDtData, groupValuesPerLocation, ZoomLevel } from './utils';

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
    currentZoomLevel = ZoomLevel.WORLD;
    datasetPrimary = [];
    datasetSecondary = [];
    
    constructor(props) {
        super(props);

        // initialize table & metric switcher stuff
        this.datasetPrimary = this.prepareTableData(data, this.currentZoomLevel).datasetPrimary;
        this.datasetSecondary = this.prepareTableData(data, this.currentZoomLevel).datasetSecondary;
        
        const filterbar = ReactDOM.createRoot(document.getElementById(this.filterbarPanel)!);
        const metricSwitcher = ReactDOM.createRoot(document.getElementById(this.metricswitcherPanel)!);
        const map = ReactDOM.createRoot(document.getElementById(this.mapSelector)!);
        const primaryTable = ReactDOM.createRoot(document.getElementById(this.primaryTableSelector)!);
        const secondaryTable = ReactDOM.createRoot(document.getElementById(this.secondaryTableSelector)!);
        
        const selectedFiltersCallback = (value) => {
            this.selectedFilters = value;
            let filteredData = filterDtData(this.selectedFilters);
            this.datasetPrimary = this.prepareTableData(filteredData, this.currentZoomLevel).datasetPrimary;
            this.datasetSecondary = this.prepareTableData(filteredData, this.currentZoomLevel).datasetSecondary;

            primaryTable.render(React.createElement(Table, {data: this.datasetPrimary, selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetFilter: selectedFiltersCallback, isIVolunteer: false }));
            secondaryTable.render(React.createElement(Table, {data: this.datasetSecondary, selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetFilter: selectedFiltersCallback, isIVolunteer: false}));
            map.render(React.createElement(InteractiveMap, {selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetZoom: zoomLevelCallback, onChangeFilters: selectedFiltersCallback, isIVolunteer: false }));
            filterbar.render(React.createElement(Filterbar, {isIVolunteer: false, filters: this.selectedFilters, onSelectedFilters: selectedFiltersCallback}));
        };

        const selectedMetricCallback = (value) => {
            this.selectedMetric = value;
            
            primaryTable.render(React.createElement(Table, {data: this.datasetPrimary, selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetFilter: selectedFiltersCallback, isIVolunteer: false }));
            secondaryTable.render(React.createElement(Table, {data: this.datasetSecondary, selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetFilter: selectedFiltersCallback, isIVolunteer: false}));
            map.render(React.createElement(InteractiveMap, {selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetZoom: zoomLevelCallback, onChangeFilters: selectedFiltersCallback, isIVolunteer: false }));
        };

        const zoomLevelCallback = (value) => {
            this.currentZoomLevel = value;
            let filteredData = filterDtData(this.selectedFilters);
            this.datasetPrimary = this.prepareTableData(filteredData, this.currentZoomLevel).datasetPrimary;
            this.datasetSecondary = this.prepareTableData(filteredData, this.currentZoomLevel).datasetSecondary;

            primaryTable.render(React.createElement(Table, {data: this.datasetPrimary, selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetFilter: selectedFiltersCallback, isIVolunteer: false }));
            secondaryTable.render(React.createElement(Table, {data: this.datasetSecondary, selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetFilter: selectedFiltersCallback, isIVolunteer: false}));
        };

        filterbar.render(React.createElement(Filterbar, {isIVolunteer: false, filters: this.selectedFilters, onSelectedFilters: selectedFiltersCallback}));
        metricSwitcher.render(React.createElement(MetricSwitcher, { isIVolunteer: false, onSetMetric: selectedMetricCallback }));
        primaryTable.render(React.createElement(Table, {data: this.datasetPrimary, selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetFilter: selectedFiltersCallback, isIVolunteer: false }));
        secondaryTable.render(React.createElement(Table, {data: this.datasetSecondary, selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetFilter: selectedFiltersCallback, isIVolunteer: false}));
        map.render(React.createElement(InteractiveMap, {selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetZoom: zoomLevelCallback, onChangeFilters: selectedFiltersCallback,  isIVolunteer: false }));
    }

    prepareTableData(data: any, zoomLevel: number) {
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
    }

    render() {
        return (
            <>
            </>
        )
    }
}

export default DynatraceWorldmapApp;