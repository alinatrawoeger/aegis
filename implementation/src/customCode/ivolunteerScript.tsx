import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import Filterbar from './components/filterbar/Filterbar';
import InteractiveMap from './components/map/Map';
import MetricSwitcher from './components/metricswitcher/MetricSwitcher';
import Table from './components/table/Table';
import data from './data/ivol_database';
import { getFilteredIVolData } from './utils';


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

  mapSelector = 'geomap_ivol';
  tableSelector = 'tasktable';
  metricSwitcherPanel = 'metricswitcher-panel';
  filterbarPanel = 'filter-panel';

  constructor(props) {
    super(props);

    this.tableData = data;

    const filterbar = ReactDOM.createRoot(document.getElementById(this.filterbarPanel)!);
    const metricSwitcher = ReactDOM.createRoot(document.getElementById(this.metricSwitcherPanel)!);
    const map = ReactDOM.createRoot(document.getElementById(this.mapSelector)!);
    const table = ReactDOM.createRoot(document.getElementById(this.tableSelector)!);
    
    const selectedFiltersCallback = (value) => {
      this.selectedFilters = value;
      this.tableData = getFilteredIVolData(data, this.selectedFilters);

      table.render(React.createElement(Table, {data: this.tableData, selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetFilter: selectedFiltersCallback, isIVolunteer: true }));
      map.render(React.createElement(InteractiveMap, {selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetZoom: zoomLevelCallback, onChangeFilters: selectedFiltersCallback, isIVolunteer: true }));
      filterbar.render(React.createElement(Filterbar, {isIVolunteer: true, filters: this.selectedFilters, onSelectedFilters: selectedFiltersCallback}));
    };

    const selectedMetricCallback = (value) => {
      this.selectedMetric = value;
      
      map.render(React.createElement(InteractiveMap, {selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetZoom: zoomLevelCallback, onChangeFilters: selectedFiltersCallback, isIVolunteer: true }));
      table.render(React.createElement(Table, {data: this.tableData, selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetFilter: selectedFiltersCallback, isIVolunteer: true }));
    };

    const zoomLevelCallback = (value) => {
      this.currentZoomLevel = value;

      table.render(React.createElement(Table, {data: this.tableData, selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetFilter: selectedFiltersCallback, isIVolunteer: true }));
    }

    filterbar.render(React.createElement(Filterbar, {isIVolunteer: true, filters: this.selectedFilters, onSelectedFilters: selectedFiltersCallback}));
    metricSwitcher.render(React.createElement(MetricSwitcher, { isIVolunteer: true, onSetMetric: selectedMetricCallback }));
    map.render(React.createElement(InteractiveMap, {selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetZoom: zoomLevelCallback, onChangeFilters: selectedFiltersCallback, isIVolunteer: true }));
    table.render(React.createElement(Table, {data: this.tableData, selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetFilter: selectedFiltersCallback, isIVolunteer: true}));

  }

  render() {
    return (
      <></>
    )
  }
}

export default IVolunteerWorldmapApp;