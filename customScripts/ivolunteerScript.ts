import {ZoomLevel, createMap, createOverlay, switchMetric} from './utils';
import {Map as OLMap} from 'ol';

class IVolunteerWorldmapApp {
  // test data (coordinates of Linz)
  longitude = 14.2858;
  latitude = 48.3069;

  // -----------------------

  metricMap = new Map();

  geomap: OLMap;

  constructor() {
    this.metricMap.set('map_urgency', '#D9001B'); // urgency (rgb(217, 0, 27))
    this.metricMap.set('map_duration', '#63A109'); // duration (rgb(99, 161, 3))
    this.metricMap.set('map_importance', '#FFC800'); // priority (rgb(255, 200, 0))
  
    let btns = $('[selectiongroup=OverlayMenu]');
    for (const btn of btns) {
        btn.addEventListener('click', (e: Event) => this.switchIVolunteerMetric(btn.id));
    }

    this.geomap = createMap('geomap_ivol', ZoomLevel.CITY, this.longitude, this.latitude, false);
  
    // TODO add custom shape for overlay instead of circle
    let overlay = createOverlay('map_overlay_ivol', this.longitude, this.latitude);
    this.geomap.addOverlay(overlay);
  }

  switchIVolunteerMetric(element: string) {
    switchMetric(this.metricMap.get(element), 'map_overlay_ivol');
  }
}

new IVolunteerWorldmapApp();