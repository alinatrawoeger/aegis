import {ZoomLevel, createMap, createOverlay, switchMetric} from './utils';
import {Map as OLMap} from 'ol';
import ReactDOM from 'react-dom/client';
import React from 'react';
import Table from './components/table/Table';
import MetricSwitcher from './components/metricswitcher/MetricSwitcher';
import data from './data/ivol_database';

class IVolunteerWorldmapApp {
  // test data (coordinates of Linz)
  longitude = 14.2858;
  latitude = 48.3069;

  // -----------------------

  metricMap = new Map();

  tableSelector = 'tasktable';
  metricSwitcherPanel = 'metricswitcher-panel';

  columnTitles = new Map<string, string>();

  constructor() {
    this.metricMap.set('map_urgency', '#D9001B'); // urgency (rgb(217, 0, 27))
    this.metricMap.set('map_duration', '#63A109'); // duration (rgb(99, 161, 3))
    this.metricMap.set('map_importance', '#FFC800'); // priority (rgb(255, 200, 0))

    this.columnTitles.set('taskname', 'Task Name');
    this.columnTitles.set('taskid', 'Task ID');
    this.columnTitles.set('details', 'Details');

    let geomap: OLMap = createMap('geomap_ivol', ZoomLevel.CITY, this.longitude, this.latitude, false);
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
  

    // create table and contents
    let datasetPrimary = data;
    let headers = ['Task Name', 'Task ID'];

    const table = ReactDOM.createRoot(document.getElementById(this.tableSelector)!);
    table.render(React.createElement(Table, {data: datasetPrimary, columnHeaders: headers, isIVolunteer: true}));

    const metricSwitcher = ReactDOM.createRoot(document.getElementById(this.metricSwitcherPanel)!);
    metricSwitcher.render(React.createElement(MetricSwitcher, {isIVolunteer: true }));

    // TODO Create overlays and let the metric switcher control the colour of the overlays
    // let btns: any = $('[selectiongroup=OverlayMenu]');
    // for (const btn of btns) {
    //     btn.addEventListener('click', (e: Event) => this.switchIVolunteerMetric(btn.id));
    // }

    // TODO add custom shape for overlay instead of circle
    // let overlay = createOverlay('map_overlay_ivol', this.longitude, this.latitude);
    // geomap.addOverlay(overlay);
  }

  switchIVolunteerMetric(element: string) {
    switchMetric(this.metricMap.get(element), 'map_overlay_ivol');
  }
}

new IVolunteerWorldmapApp();