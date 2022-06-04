var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import Filterbar from './components/filterbar/Filterbar';
import CustomMap from './components/map/Map';
import MetricSwitcher from './components/metricswitcher/MetricSwitcher';
import Table from './components/table/Table';
import data from './data/ivol_database';
import { FilterType, getFilterType } from './utils';
// TODO
// Map:
// - Overlay / Pins for Locations
// - click on Map lets you create new task -> link to "add task"-page with prefilled location
// - max/min Zoom, mehr als Ö ist für iVol nicht relevant, drum brauchma a ned viel weiter rauszoomen können
//
// Table:
// - link to task-details page
var IVolunteerWorldmapApp = /** @class */ (function (_super) {
    __extends(IVolunteerWorldmapApp, _super);
    function IVolunteerWorldmapApp(props) {
        var _this = _super.call(this, props) || this;
        // test data (coordinates of Linz)
        _this.longitude = 14.2858;
        _this.latitude = 48.3069;
        // -----------------------
        _this.selectedMetric = 'urgency';
        _this.selectedFilters = [];
        _this.filterSuggestions = [];
        _this.currentZoomLevel = 10;
        _this.tableData = [];
        _this.tableSelector = 'tasktable';
        _this.metricSwitcherPanel = 'metricswitcher-panel';
        _this.filterbarPanel = 'filter-panel';
        _this.filterData = function () {
            var filteredData = [];
            for (var i = 0; i < _this.selectedFilters.length; i++) {
                var curFilterKey = _this.selectedFilters[i].key;
                var curFilterValue = _this.selectedFilters[i].value;
                var curFilterType = getFilterType(curFilterKey);
                // first use full dataset; afterwards use already-filtered data
                var dataSet = i === 0 ? data : filteredData;
                var filteredDataPerCycle = [];
                if (curFilterType === FilterType.TEXT) {
                    if (curFilterKey === 'friend') {
                        for (var j = 0; j < dataSet.length; j++) {
                            var friendsList = dataSet[j][curFilterKey];
                            for (var k = 0; k < friendsList.length; k++) {
                                if (curFilterValue === friendsList[k]) {
                                    filteredDataPerCycle.push(dataSet[j]);
                                }
                            }
                        }
                    }
                    else {
                        for (var j = 0; j < dataSet.length; j++) {
                            var dataElement = dataSet[j][curFilterKey];
                            if (curFilterValue === dataElement) {
                                filteredDataPerCycle.push(dataSet[j]);
                            }
                        }
                    }
                }
                else if (curFilterType === FilterType.RANGE) {
                    for (var j = 0; j < dataSet.length; j++) {
                        var dataElement = dataSet[j][curFilterKey];
                        var filterFrom = curFilterValue[0];
                        var filterTo = curFilterValue[1];
                        if (filterFrom <= dataElement && dataElement <= filterTo) {
                            filteredDataPerCycle.push(dataSet[j]);
                        }
                    }
                }
                filteredData = filteredDataPerCycle;
            }
            return _this.selectedFilters.length > 0 ? filteredData : data;
        };
        _this.tableData = data;
        var filterbar = ReactDOM.createRoot(document.getElementById(_this.filterbarPanel));
        var metricSwitcher = ReactDOM.createRoot(document.getElementById(_this.metricSwitcherPanel));
        var map = ReactDOM.createRoot(document.getElementById('geomap_ivol'));
        var table = ReactDOM.createRoot(document.getElementById(_this.tableSelector));
        var selectedFiltersCallback = function (value) {
            _this.selectedFilters = value;
            _this.tableData = _this.filterData();
            table.render(React.createElement(Table, { data: _this.tableData, selectedMetric: _this.selectedMetric, isIVolunteer: true }));
            map.render(React.createElement(CustomMap, { selectedMetric: _this.selectedMetric, filters: _this.selectedFilters, onSetZoom: zoomLevelCallback, onChangeFilters: selectedFiltersCallback, isIVolunteer: true }));
            filterbar.render(React.createElement(Filterbar, { isIVolunteer: true, filters: _this.selectedFilters, onSelectedFilters: selectedFiltersCallback }));
        };
        var selectedMetricCallback = function (value) {
            _this.selectedMetric = value;
            map.render(React.createElement(CustomMap, { selectedMetric: _this.selectedMetric, filters: _this.selectedFilters, onSetZoom: zoomLevelCallback, onChangeFilters: selectedFiltersCallback, isIVolunteer: true }));
            table.render(React.createElement(Table, { data: data, selectedMetric: _this.selectedMetric, isIVolunteer: true }));
        };
        var zoomLevelCallback = function (value) {
            _this.currentZoomLevel = value;
            table.render(React.createElement(Table, { data: _this.tableData, selectedMetric: _this.selectedMetric, isIVolunteer: true }));
        };
        filterbar.render(React.createElement(Filterbar, { isIVolunteer: true, filters: _this.selectedFilters, onSelectedFilters: selectedFiltersCallback }));
        metricSwitcher.render(React.createElement(MetricSwitcher, { isIVolunteer: true, onSetMetric: selectedMetricCallback }));
        map.render(React.createElement(CustomMap, { selectedMetric: _this.selectedMetric, filters: _this.selectedFilters, onSetZoom: zoomLevelCallback, onChangeFilters: selectedFiltersCallback, isIVolunteer: true }));
        table.render(React.createElement(Table, { data: _this.tableData, selectedMetric: _this.selectedMetric, isIVolunteer: true }));
        return _this;
    }
    IVolunteerWorldmapApp.prototype.render = function () {
        return (React.createElement(React.Fragment, null));
    };
    return IVolunteerWorldmapApp;
}(Component));
export default IVolunteerWorldmapApp;
//# sourceMappingURL=ivolunteerScript.js.map