import { Map as OLMap } from 'ol';
import React, { Component, useState } from 'react';
import ReactDOM from 'react-dom/client';
import CustomMap from './components/map/Map';
import MetricSwitcher from './components/metricswitcher/MetricSwitcher';
import Table from './components/table/Table';
import data from './data/ivol_database';
import { createMap, switchMetric, ZoomLevel } from './utils';

class IVolunteerWorldmapApp extends Component {
  // test data (coordinates of Linz)
  longitude = 14.2858;
  latitude = 48.3069;

  // -----------------------

  metricMap = new Map();

  tableSelector = 'tasktable';
  metricSwitcherPanel = 'metricswitcher-panel';

  columnTitles = new Map<string, string>();

  constructor(props) {
    super(props);

    // initialize variables
    this.metricMap.set('map_urgency', '#D9001B'); // urgency (rgb(217, 0, 27))
    this.metricMap.set('map_duration', '#63A109'); // duration (rgb(99, 161, 3))
    this.metricMap.set('map_importance', '#FFC800'); // priority (rgb(255, 200, 0))

    this.columnTitles.set('taskname', 'Task Name');
    this.columnTitles.set('taskid', 'Task ID');
    this.columnTitles.set('details', 'Details');

    // initialize map component
    const map = ReactDOM.createRoot(document.getElementById('geomap_ivol')!);
    map.render(React.createElement(CustomMap, {selectedMetric: 'urgency', hasMinimap: false }));

    // initialize table & metric switcher stuff
    let headers = ['Task Name', 'Task ID'];
    const table = ReactDOM.createRoot(document.getElementById(this.tableSelector)!);
    table.render(React.createElement(Table, {data: data, columnHeaders: headers, isIVolunteer: true}));

    const metricSwitcher = ReactDOM.createRoot(document.getElementById(this.metricSwitcherPanel)!);
    metricSwitcher.render(React.createElement(MetricSwitcher, { isIVolunteer: true }));

    // TODO Create overlays and let the metric switcher control the colour of the overlays
    // let btns: any = $('[selectiongroup=OverlayMenu]');
    // for (const btn of btns) {
    //     btn.addEventListener('click', (e: Event) => this.switchIVolunteerMetric(btn.id));
    // }
  }

  render() {
    return (
      <></>
    )
  }

  switchIVolunteerMetric(element: string) {
    switchMetric(this.metricMap.get(element), 'map_overlay_ivol');
  }
}

export default IVolunteerWorldmapApp;