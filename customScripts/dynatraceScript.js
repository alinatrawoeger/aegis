// test data (coordinates of Linz)
let longitude = 14.2858;
let latitude = 48.3069;

// -----------------------

const metricMap = new Map();
metricMap.set('metricswitcher-apdex', '#3dc71a'); // urgency (rgb(217, 0, 27))
metricMap.set('other', '#61247f'); // duration (rgb(99, 161, 3))

let map = createMap('geomap_dt', ZoomLevel.WORLD.level, longitude, latitude);

let overlay = createOverlay('map_overlay_dt', longitude, latitude);
map.addOverlay(overlay);

// TODO next:  metric switcher colours
// TODO next2: minimap
// TODO next3: tooltip
// TODO next4: custom shape for overlay

function switchDynatraceMetric(element) {
    var color = metricMap.has(element.id) ? metricMap.get(element.id) : metricMap.get('other');
    $('[selectiongroup=MetricSwitcherDt]').removeClass('selected');
    $(element).addClass('selected');
    switchMetric(color, 'map_overlay_dt');
}