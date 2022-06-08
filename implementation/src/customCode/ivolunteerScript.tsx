import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import Filterbar from './components/filterbar/Filterbar';
import InteractiveMap from './components/map/Map';
import MetricSwitcher from './components/metricswitcher/MetricSwitcher';
import Table from './components/table/Table';
import data from './data/ivol_database';
import { FilterType, getFilterType } from './utils';


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
      this.tableData = this.filterData();

      table.render(React.createElement(Table, {data: this.tableData, selectedMetric: this.selectedMetric, isIVolunteer: true }));
      map.render(React.createElement(InteractiveMap, {selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetZoom: zoomLevelCallback, onChangeFilters: selectedFiltersCallback, isIVolunteer: true }));
      filterbar.render(React.createElement(Filterbar, {isIVolunteer: true, filters: this.selectedFilters, onSelectedFilters: selectedFiltersCallback}));
    };

    const selectedMetricCallback = (value) => {
      this.selectedMetric = value;
      
      map.render(React.createElement(InteractiveMap, {selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetZoom: zoomLevelCallback, onChangeFilters: selectedFiltersCallback, isIVolunteer: true }));
      table.render(React.createElement(Table, {data: data, selectedMetric: this.selectedMetric, isIVolunteer: true }));
    };

    const zoomLevelCallback = (value) => {
      this.currentZoomLevel = value;

      table.render(React.createElement(Table, {data: this.tableData, selectedMetric: this.selectedMetric, isIVolunteer: true }));
    }

    filterbar.render(React.createElement(Filterbar, {isIVolunteer: true, filters: this.selectedFilters, onSelectedFilters: selectedFiltersCallback}));
    metricSwitcher.render(React.createElement(MetricSwitcher, { isIVolunteer: true, onSetMetric: selectedMetricCallback }));
    map.render(React.createElement(InteractiveMap, {selectedMetric: this.selectedMetric, filters: this.selectedFilters, onSetZoom: zoomLevelCallback, onChangeFilters: selectedFiltersCallback, isIVolunteer: true }));
    table.render(React.createElement(Table, {data: this.tableData, selectedMetric: this.selectedMetric, isIVolunteer: true}));

  }

  filterData = () => {
    let filteredData = [];
    for (let i = 0; i < this.selectedFilters.length; i++) {
        let curFilterKey = this.selectedFilters[i].key;
        let curFilterValue = this.selectedFilters[i].value;
        let curFilterType = getFilterType(curFilterKey);

        // first use full dataset; afterwards use already-filtered data
        let dataSet = i === 0 ? data : filteredData;

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
            let dataElement = new Date(dataSet[j][curFilterKey]);

            let filterFrom = new Date(curFilterValue[0]);
            let filterTo = new Date(curFilterValue[1]);
            if (filterFrom <= dataElement && dataElement <= filterTo) {
                filteredDataPerCycle.push(dataSet[j]);
            }
        }
        }

        filteredData = filteredDataPerCycle;
    }
    
    return this.selectedFilters.length > 0 ? filteredData : data;
  }

  render() {
    return (
      <></>
    )
  }
}

export default IVolunteerWorldmapApp;