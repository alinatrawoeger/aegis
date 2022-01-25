// test data (coordinates of Linz)
let longitude = 14.2858;
let latitude = 48.3069;

// -----------------------

const metricMap = new Map();
metricMap.set('map_urgency', '#D9001B'); // urgency (rgb(217, 0, 27))
metricMap.set('map_duration', '#63A109'); // duration (rgb(99, 161, 3))
metricMap.set('map_importance', '#FFC800'); // priority (rgb(255, 200, 0))

let map = createMap('geomap_ivol', ZoomLevel.CITY.level, longitude, latitude, false);

// TODO add custom shape for overlay instead of circle
let overlay = createOverlay('map_overlay_ivol', longitude, latitude);
map.addOverlay(overlay);

function switchIVolunteerMetric(element) {
  switchMetric(metricMap.get(element.id), 'map_overlay_ivol');
}