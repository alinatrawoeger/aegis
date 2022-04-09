import { Map as OLMap } from 'ol';
import jsondata from '../data/dt_database.json';
import geodata from '../data/dt_filters.json';
import { createCountryOverlay, createMap, ZoomLevel } from './utils';
import Table from './components/dt_table';

// TODO table:
// - Actions Symbol in letzte Spalte der Table adden
// - Spalten sortieren
// - Spalten auf Metric reagieren lassen
// - ZoomLevel setzen beim zoomen damit table drauf reagiert

// TODO others:
// - Beispieldaten reinfeeden in Filterbar
// - Beispieldaten reinfeeden in Tooltip
// - Filterbar soll Daten beeinflussen
// - fix markiertes country overlay soll auf metric switcher reagieren
// - erneuter klick auf markiertes country soll die markierung aufheben

class DynatraceWorldmapApp {
    // test data (coordinates of Linz)
    longitude = 14.2858;
    latitude = 48.3069;

    metricColorMapSelected = new Map();
    metricColorMapHover = new Map();

    selectedMetric = 'metricswitcher-apdex';
    primaryTableSelector = '#table_tab1';
    secondaryTableSelector = '#table_tab2';

    data = jsondata.elements;
    geoLabels = geodata;

    constructor() {
        // initialize variables
        this.initVariables();
        let initialSelectedColor = this.metricColorMapSelected.get('metricswitcher-apdex');
        let initialHoverColor = this.metricColorMapHover.get('metricswitcher-apdex');

        // -----------------------

        let metricSwitcherButtons = $(".metricSwitcherBtn");
        for (const btn of metricSwitcherButtons) {
            btn.addEventListener('click', (e: Event) => this.switchDynatraceMetric(btn.id, geomap));
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

        Table(this.data, currZoom ?? 1, this.primaryTableSelector, this.secondaryTableSelector);
    }

    initVariables() {
        this.metricColorMapSelected.set('metricswitcher-apdex', 'rgba(61, 199, 29, 1)');
        this.metricColorMapSelected.set('other', 'rgba(97, 36, 127, 1)');

        this.metricColorMapHover.set('metricswitcher-apdex', 'rgba(61, 199, 29, 0.5)');
        this.metricColorMapHover.set('other', 'rgba(97, 36, 127, 0.5)');
    }

    switchDynatraceMetric(element: string, geomap: OLMap) {
        this.selectedMetric = element;
        var colorSelected = this.metricColorMapSelected.has(element) ? this.metricColorMapSelected.get(element) : this.metricColorMapSelected.get('other');
        var colorHover = this.metricColorMapHover.has(element) ? this.metricColorMapHover.get(element) : this.metricColorMapHover.get('other');
        $('[selectiongroup=MetricSwitcherDt]').removeClass('selected');
        $('#' + element).addClass('selected');
        createCountryOverlay(geomap, colorSelected, colorHover);

        return $('#' + element).text;
    }
}

// start app
new DynatraceWorldmapApp();