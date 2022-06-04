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
import data from './data/dt_database';
import { FilterType, getFilterType, groupValuesPerLocation, ZoomLevel } from './utils';
// TODO Map:
// - wenn Region/City gesetzt sind, soll country eingefärbt werden (bzw filter gesetzt, vl färbt sich das country dann von selber ein)
// TODO Filterbar:
// - Country/Region/City suggestions sind leer beim 2. Mal auswählen (Datenbank kommt schon leer rein wtf)
//      - Fehler in FilterBar.adjustSuggestionsDt() beim suggestions reduzieren, not sure what's the problem tho
// - Filter Suggestions -> type in letters to find suggestions
// TODO Table:
// - find out why there is an endless render loop
var DynatraceWorldmapApp = /** @class */ (function (_super) {
    __extends(DynatraceWorldmapApp, _super);
    function DynatraceWorldmapApp(props) {
        var _this = _super.call(this, props) || this;
        // test data (coordinates of Linz)
        _this.longitude = 14.2858;
        _this.latitude = 48.3069;
        _this.filterbarPanel = 'filter-panel';
        _this.metricswitcherPanel = 'metricswitcher-panel';
        _this.selectedMetricId = 'metricswitcher-apdex';
        _this.primaryTableSelector = 'table_tab1';
        _this.secondaryTableSelector = 'table_tab2';
        _this.mapSelector = 'geomap_dt';
        _this.selectedFilters = [];
        _this.filterSuggestions = [];
        _this.selectedMetric = 'apdex';
        _this.currentZoomLevel = ZoomLevel.COUNTRY;
        _this.datasetPrimary = [];
        _this.datasetSecondary = [];
        _this.getTableTabHeaders = function (zoomLevel) {
            if (zoomLevel <= ZoomLevel.CONTINENT) {
                return ['continent', 'country'];
            }
            else {
                return ['country', 'region'];
            }
            // TODO add handling for Region/City when data has been expanded
        };
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
                    for (var j = 0; j < dataSet.length; j++) {
                        var dataElement = dataSet[j][curFilterKey];
                        if (curFilterValue === dataElement) {
                            filteredDataPerCycle.push(dataSet[j]);
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
        // initialize table & metric switcher stuff
        _this.datasetPrimary = _this.prepareTableData(data, ZoomLevel.COUNTRY).datasetPrimary;
        _this.datasetSecondary = _this.prepareTableData(data, ZoomLevel.COUNTRY).datasetSecondary;
        var filterbar = ReactDOM.createRoot(document.getElementById(_this.filterbarPanel));
        var metricSwitcher = ReactDOM.createRoot(document.getElementById(_this.metricswitcherPanel));
        var map = ReactDOM.createRoot(document.getElementById(_this.mapSelector));
        var primaryTable = ReactDOM.createRoot(document.getElementById(_this.primaryTableSelector));
        var secondaryTable = ReactDOM.createRoot(document.getElementById(_this.secondaryTableSelector));
        var selectedFiltersCallback = function (value) {
            _this.selectedFilters = value;
            var filteredData = _this.filterData();
            _this.datasetPrimary = _this.prepareTableData(filteredData, _this.currentZoomLevel).datasetPrimary;
            _this.datasetSecondary = _this.prepareTableData(filteredData, _this.currentZoomLevel).datasetSecondary;
            primaryTable.render(React.createElement(Table, { data: _this.datasetPrimary, selectedMetric: _this.selectedMetric, isIVolunteer: false }));
            secondaryTable.render(React.createElement(Table, { data: _this.datasetSecondary, selectedMetric: _this.selectedMetric, isIVolunteer: false }));
            map.render(React.createElement(CustomMap, { selectedMetric: _this.selectedMetric, filters: _this.selectedFilters, onSetZoom: zoomLevelCallback, onChangeFilters: selectedFiltersCallback, isIVolunteer: false }));
            filterbar.render(React.createElement(Filterbar, { isIVolunteer: false, filters: _this.selectedFilters, onSelectedFilters: selectedFiltersCallback }));
        };
        var selectedMetricCallback = function (value) {
            _this.selectedMetric = value;
            primaryTable.render(React.createElement(Table, { data: _this.datasetPrimary, selectedMetric: _this.selectedMetric, isIVolunteer: false }));
            secondaryTable.render(React.createElement(Table, { data: _this.datasetSecondary, selectedMetric: _this.selectedMetric, isIVolunteer: false }));
            map.render(React.createElement(CustomMap, { selectedMetric: _this.selectedMetric, filters: _this.selectedFilters, onSetZoom: zoomLevelCallback, onChangeFilters: selectedFiltersCallback, isIVolunteer: false }));
        };
        var zoomLevelCallback = function (value) {
            _this.currentZoomLevel = value;
            _this.datasetPrimary = _this.prepareTableData(data, _this.currentZoomLevel).datasetPrimary;
            _this.datasetSecondary = _this.prepareTableData(data, _this.currentZoomLevel).datasetSecondary;
            primaryTable.render(React.createElement(Table, { data: _this.datasetPrimary, selectedMetric: _this.selectedMetric, isIVolunteer: false }));
            secondaryTable.render(React.createElement(Table, { data: _this.datasetSecondary, selectedMetric: _this.selectedMetric, isIVolunteer: false }));
        };
        filterbar.render(React.createElement(Filterbar, { isIVolunteer: false, filters: _this.selectedFilters, onSelectedFilters: selectedFiltersCallback }));
        metricSwitcher.render(React.createElement(MetricSwitcher, { isIVolunteer: false, onSetMetric: selectedMetricCallback }));
        primaryTable.render(React.createElement(Table, { data: _this.datasetPrimary, selectedMetric: _this.selectedMetric, isIVolunteer: false }));
        secondaryTable.render(React.createElement(Table, { data: _this.datasetSecondary, selectedMetric: _this.selectedMetric, isIVolunteer: false }));
        map.render(React.createElement(CustomMap, { selectedMetric: _this.selectedMetric, filters: _this.selectedFilters, onSetZoom: zoomLevelCallback, onChangeFilters: selectedFiltersCallback, isIVolunteer: false }));
        return _this;
    }
    DynatraceWorldmapApp.prototype.prepareTableData = function (data, zoomLevel) {
        var dataLabels = new Map();
        dataLabels.set('continent', 'Continent');
        dataLabels.set('country', 'Country');
        dataLabels.set('region', 'Region');
        dataLabels.set('city', 'City');
        var tabTitles = this.getTableTabHeaders(zoomLevel);
        var datasetPrimary = groupValuesPerLocation(data, tabTitles[0]);
        var datasetSecondary = groupValuesPerLocation(data, tabTitles[1]);
        $('#table_tab1_title').html(dataLabels.get(tabTitles[0]));
        $('#table_tab2_title').html(dataLabels.get(tabTitles[1]));
        return { datasetPrimary: datasetPrimary, datasetSecondary: datasetSecondary };
    };
    DynatraceWorldmapApp.prototype.render = function () {
        return (React.createElement(React.Fragment, null));
    };
    return DynatraceWorldmapApp;
}(Component));
export default DynatraceWorldmapApp;
//# sourceMappingURL=dynatraceScript.js.map