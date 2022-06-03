import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import CustomMap from './components/map/Map';
import MetricSwitcher from './components/metricswitcher/MetricSwitcher';
import Table from './components/table/Table';
import data from './data/ivol_database';
import { switchMetric } from './utils';


// TODO
// Map:
// - Overlay / Pins for Locations
// - click on Map lets you create new task -> link to "add task"-page with prefilled location
// - max/min Zoom, mehr als Ö ist für iVol nicht relevant, drum brauchma a ned viel weiter rauszoomen können
//
// Table:
// - link to task-details page

class IVolunteerWorldmapApp extends Component {
  // test data (coordinates of Linz)
  longitude = 14.2858;
  latitude = 48.3069;

  // -----------------------

  selectedMetric = 'urgency';
  selectedFilters = [];
  currentZoomLevel = 10;

  tableSelector = 'tasktable';
  metricSwitcherPanel = 'metricswitcher-panel';

  constructor(props) {
    super(props);

    const metricSwitcher = ReactDOM.createRoot(document.getElementById(this.metricSwitcherPanel)!);
    const map = ReactDOM.createRoot(document.getElementById('geomap_ivol')!);
    const table = ReactDOM.createRoot(document.getElementById(this.tableSelector)!);
    
    const selectedFiltersCallback = (value) => {
    
    };

    const selectedMetricCallback = (value) => {
      this.selectedMetric = value;
      
      map.render(React.createElement(CustomMap, {selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetZoom: zoomLevelCallback, onChangeFilters: selectedFiltersCallback, isIVolunteer: true }));
      table.render(React.createElement(Table, {data: data, selectedMetric: this.selectedMetric, isIVolunteer: true }));
    };

    const zoomLevelCallback = (value) => {
      this.currentZoomLevel = value;

      map.render(React.createElement(CustomMap, {selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetZoom: zoomLevelCallback, onChangeFilters: selectedFiltersCallback, isIVolunteer: true }));
      table.render(React.createElement(Table, {data: data, selectedMetric: this.selectedMetric, isIVolunteer: true }));
    }

    metricSwitcher.render(React.createElement(MetricSwitcher, { isIVolunteer: true, onSetMetric: selectedMetricCallback }));
    map.render(React.createElement(CustomMap, {selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetZoom: zoomLevelCallback, onChangeFilters: selectedFiltersCallback, isIVolunteer: true }));
    table.render(React.createElement(Table, {data: data, selectedMetric: this.selectedMetric, isIVolunteer: true}));

  }

  render() {
    return (
      <></>
    )
  }
}

export default IVolunteerWorldmapApp;