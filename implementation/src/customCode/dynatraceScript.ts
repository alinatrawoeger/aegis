import { Map as OLMap } from 'ol';
import React from 'react';
import ReactDOM from 'react-dom/client';
import data from './data/dt_database';
import geodata from './data/dt_filters.json';
import Table from './components/table/Table';
import MetricSwitcher from './components/metricswitcher/MetricSwitcher';
import { createCountryOverlay, createMap, ZoomLevel } from './utils';

// TODO table:
// - Spalten auf Metric reagieren lassen
// - ZoomLevel setzen beim zoomen damit table drauf reagiert

// TODO others:
// - Metric switch soll opacity vom Overlay nicht beeinflussen
// - Beispieldaten reinfeeden in Filterbar
// - Beispieldaten reinfeeden in Tooltip
// - Filterbar soll Daten beeinflussen
// - fix markiertes country overlay soll auf metric switcher reagieren
// - erneuter klick auf markiertes country soll die markierung aufheben

class DynatraceWorldmapApp {
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

    geoLabels = geodata;

    constructor() {
        // initialize variables
        this.initVariables();
        let initialSelectedColor = this.metricColorMapSelected.get('metricswitcher-apdex');
        let initialHoverColor = this.metricColorMapHover.get('metricswitcher-apdex');

        // -----------------------

        let metricSwitcherButtons: any = $(".metricSwitcherBtn");
        for (const btn of metricSwitcherButtons) {
            btn.addEventListener('click', (e: Event) => {
                this.switchDynatraceMetric(btn.id, geomap);
                this.selectedMetric = btn.id;
            });
        }
        
        let geomap: OLMap = createMap('geomap_dt', ZoomLevel.COUNTRY, this.longitude, this.latitude, true);
        let currZoom = geomap.getView().getZoom();
        geomap.on('moveend', function(e) {
            var newZoom = geomap.getView().getZoom();
            if (currZoom != newZoom) {
                if (newZoom != undefined && newZoom > ZoomLevel.CONTINENT.level) {
                    // update table accordingly
                } else if (newZoom != undefined && newZoom < ZoomLevel.COUNTRY.level) {
                    // update table accordingly
                }
                currZoom = newZoom;
            } 
        });

        createCountryOverlay(geomap, initialSelectedColor, initialHoverColor);

        // create table and contents
        let { datasetPrimary, datasetSecondary } = this.prepareData(data, currZoom);
        let headers = ['Location', 'Apdex', 'User actions'];

        const primaryTable = ReactDOM.createRoot(document.getElementById(this.primaryTableSelector)!);
        primaryTable.render(React.createElement(Table, {data: datasetPrimary, columnHeaders: headers, isIVolunteer: false }));
        const secondaryTable = ReactDOM.createRoot(document.getElementById(this.secondaryTableSelector)!);
        secondaryTable.render(React.createElement(Table, {data: datasetSecondary, columnHeaders: headers, isIVolunteer: false}));

        const test = ReactDOM.createRoot(document.getElementById(this.metricswitcherPanel)!);
        test.render(React.createElement(MetricSwitcher, {isIVolunteer: false }));
    }

    initVariables() {
        this.dataLabels.set('continent', 'Continent');
        this.dataLabels.set('country', 'Country');
        this.dataLabels.set('region', 'Region');
        this.dataLabels.set('city', 'City');

        this.metricColorMapSelected.set('metricswitcher-apdex', 'rgba(61, 199, 29, 1)');
        this.metricColorMapSelected.set('other', 'rgba(97, 36, 127, 1)');

        this.metricColorMapHover.set('metricswitcher-apdex', 'rgba(61, 199, 29, 0.5)');
        this.metricColorMapHover.set('other', 'rgba(97, 36, 127, 0.5)');
    }

    switchDynatraceMetric(element: string, geomap: OLMap) {
        this.selectedMetricId = element;
        var colorSelected = this.metricColorMapSelected.has(element) ? this.metricColorMapSelected.get(element) : this.metricColorMapSelected.get('other');
        var colorHover = this.metricColorMapHover.has(element) ? this.metricColorMapHover.get(element) : this.metricColorMapHover.get('other');
        $('[selectiongroup=MetricSwitcherDt]').removeClass('selected');
        $('#' + element).addClass('selected');
        createCountryOverlay(geomap, colorSelected, colorHover);

        return $('#' + element).text;
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
        if (zoomLevel <= ZoomLevel.CONTINENT.level) {
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
}

// start app
new DynatraceWorldmapApp();