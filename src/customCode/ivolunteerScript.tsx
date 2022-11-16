import Geometry from 'ol/geom/Geometry';
import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import Filterbar from './components/filterbar/Filterbar';
import InteractiveMap from './components/map/Map';
import MetricSwitcher from './components/metricswitcher/MetricSwitcher';
import Table from './components/table/Table';
import iVolData from './data/ivol_database';
import { getFilteredIVolData, getIVolData } from './utils';


// TODO
// Map:
// - click on "Add Task"-Btn lets you create new task -> link to "add task"-page with prefilled location

class IVolunteerWorldmapApp extends Component {
  // test data (coordinates of Linz)
  longitude = 14.2858;
  latitude = 48.3069;

  // -----------------------

  selectedMetric = 'urgency';
  selectedFilters = [];
  filterSuggestions = [];
  currentZoomLevel = 10;
  tableData = [];
  radiusFilter = undefined;

  mapSelector = 'geomap_ivol';
  tableSelector = 'tasktable';
  metricSwitcherPanel = 'metricswitcher-panel';
  filterbarPanel = 'filter-panel';

  constructor(props) {
    super(props);

    // save data from file to sessionStorage at the very first call
    if (sessionStorage.getItem('iVolData') === null) {
      sessionStorage.setItem('iVolData', JSON.stringify(iVolData));
    }

    this.tableData = getIVolData();

    const filterbar = ReactDOM.createRoot(document.getElementById(this.filterbarPanel)!);
    const metricSwitcher = ReactDOM.createRoot(document.getElementById(this.metricSwitcherPanel)!);
    const map = ReactDOM.createRoot(document.getElementById(this.mapSelector)!);
    const table = ReactDOM.createRoot(document.getElementById(this.tableSelector)!);
    
    const radiusFilterCallback = (value) => {
      this.radiusFilter = value;

      filterbar.render(React.createElement(Filterbar, {isIVolunteer: true, filters: this.selectedFilters, onSelectedFilters: selectedFiltersCallback, onChangedRadiusFilter: this.radiusFilter}));
    }

    const selectedFiltersCallback = (value) => {
      this.selectedFilters = value;
      let data = getIVolData();
      this.tableData = getFilteredIVolData(data, this.selectedFilters);

      table.render(React.createElement(Table, {data: this.tableData, selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetFilter: selectedFiltersCallback, isIVolunteer: true }));
      map.render(React.createElement(InteractiveMap, {selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetZoom: zoomLevelCallback, onChangeFilters: selectedFiltersCallback, onChangeRadiusFilter: radiusFilterCallback, isIVolunteer: true }));
      filterbar.render(React.createElement(Filterbar, {isIVolunteer: true, filters: this.selectedFilters, onSelectedFilters: selectedFiltersCallback}));
    };

    const selectedMetricCallback = (value) => {
      this.selectedMetric = value;
      
      map.render(React.createElement(InteractiveMap, {selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetZoom: zoomLevelCallback, onChangeFilters: selectedFiltersCallback, onChangeRadiusFilter: radiusFilterCallback, isIVolunteer: true }));
      table.render(React.createElement(Table, {data: this.tableData, selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetFilter: selectedFiltersCallback, isIVolunteer: true }));
    };

    const zoomLevelCallback = (value) => {
      this.currentZoomLevel = value;

      table.render(React.createElement(Table, {data: this.tableData, selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetFilter: selectedFiltersCallback, isIVolunteer: true }));
    }

    filterbar.render(React.createElement(Filterbar, {isIVolunteer: true, filters: this.selectedFilters, onSelectedFilters: selectedFiltersCallback}));
    metricSwitcher.render(React.createElement(MetricSwitcher, { isIVolunteer: true, onSetMetric: selectedMetricCallback }));
    map.render(React.createElement(InteractiveMap, {selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetZoom: zoomLevelCallback, onChangeFilters: selectedFiltersCallback, onChangeRadiusFilter: radiusFilterCallback, isIVolunteer: true }));
    table.render(React.createElement(Table, {data: this.tableData, selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetFilter: selectedFiltersCallback, isIVolunteer: true}));

  }

  render() {
    return (
      <></>
    )
  }
}

export default IVolunteerWorldmapApp;