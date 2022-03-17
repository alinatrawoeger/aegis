import {ZoomLevel, createMap, createCountryOverlay, switchMetric} from './utils';
import {Feature, Map as OLMap} from 'ol';

// TODO next: GeoJSON auf Shapefile umbauen
// TODO next1: fix markiertes country overlay soll auf metric switcher reagieren
// TODO next2: Tooltip daten anlegen
// TODO next3: Filterbar soll Daten beeinflussen
// TODO next4: Beispieldaten erstellen und reinfeeden

class DynatraceWorldmapApp {
    // test data (coordinates of Linz)
    longitude = 14.2858;
    latitude = 48.3069;

    metricColorMapSelected = new Map();
    metricColorMapHover = new Map();

    geomap: OLMap;

    constructor() {
        this.metricColorMapSelected.set('metricswitcher-apdex', 'rgba(61, 199, 29, 1)');
        this.metricColorMapSelected.set('other', 'rgba(97, 36, 127, 1)');
    
        this.metricColorMapHover.set('metricswitcher-apdex', 'rgba(61, 199, 29, 0.5)');
        this.metricColorMapHover.set('other', 'rgba(97, 36, 127, 0.5)');
    
        let initialSelectedColor = this.metricColorMapSelected.get('metricswitcher-apdex');
        let initialHoverColor = this.metricColorMapHover.get('metricswitcher-apdex');
    
        // -----------------------

        let metricSwitcherButtons = $(".metricSwitcherBtn");
        for (const btn of metricSwitcherButtons) {
            btn.addEventListener('click', (e: Event) => this.switchDynatraceMetric(btn.id));
        }
        
        this.geomap = createMap('geomap_dt', ZoomLevel.WORLD, this.longitude, this.latitude, true);
        createCountryOverlay(this.geomap, initialSelectedColor, initialHoverColor);
    }

    switchDynatraceMetric(element: string) {
        var colorSelected = this.metricColorMapSelected.has(element) ? this.metricColorMapSelected.get(element) : this.metricColorMapSelected.get('other');
        var colorHover = this.metricColorMapHover.has(element) ? this.metricColorMapHover.get(element) : this.metricColorMapHover.get('other');
        $('[selectiongroup=MetricSwitcherDt]').removeClass('selected');
        $('#' + element).addClass('selected');
        createCountryOverlay(this.geomap, colorSelected, colorHover);
    }
}

// start app
new DynatraceWorldmapApp();