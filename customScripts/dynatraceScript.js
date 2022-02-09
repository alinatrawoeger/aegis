// test data (coordinates of Linz)
let longitude = 14.2858;
let latitude = 48.3069;

const metricColorMapSelected = new Map();
metricColorMapSelected.set('metricswitcher-apdex', 'rgba(61, 199, 29, 1)');
metricColorMapSelected.set('other', 'rgba(97, 36, 127, 1)');

const metricColorMapHover = new Map();
metricColorMapHover.set('metricswitcher-apdex', 'rgba(61, 199, 29, 0.5)');
metricColorMapHover.set('other', 'rgba(97, 36, 127, 0.5)');

let initialSelectedColor = metricColorMapSelected.get('metricswitcher-apdex');
let initialHoverColor = metricColorMapHover.get('metricswitcher-apdex');

// -----------------------

let map = createMap('geomap_dt', ZoomLevel.WORLD.level, longitude, latitude, true);
createCountryOverlay(map, initialSelectedColor, initialHoverColor);

// TODO next1: fix markiertes country overlay soll auf metric switcher reagieren
// TODO next2: Tooltip daten anlegen
// TODO next3: Filterbar soll Daten beeinflussen
// TODO next4: Beispieldaten erstellen und reinfeeden

function switchDynatraceMetric(element) {
    var colorSelected = metricColorMapSelected.has(element.id) ? metricColorMapSelected.get(element.id) : metricColorMapSelected.get('other');
    var colorHover = metricColorMapHover.has(element.id) ? metricColorMapHover.get(element.id) : metricColorMapHover.get('other');
    $('[selectiongroup=MetricSwitcherDt]').removeClass('selected');
    $(element).addClass('selected');
    createCountryOverlay(map, colorSelected, colorHover);
}