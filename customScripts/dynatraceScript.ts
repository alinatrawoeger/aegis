import { Map as OLMap } from 'ol';
import { Zoom } from 'ol/control';
import jsondata from '../data/dt_database.json';
import geodata from '../data/dt_filters.json';
import { createCountryOverlay, createMap, ZoomLevel } from './utils';

// TODO table:
// - Auf fehlendes property (e.g. keine Region, keine City, ...) reagieren
// - Sachen nach geolocation zusammengruppieren
// - Actions Symbol in letzte Spalte der Table adden
// - ZoomLevel setzen beim zoomen damit table drauf reagiert

// TODO others:
// - Beispieldaten reinfeeden in Filterbar
// - Beispieldaten reinfeeden in Tooltip
// - Filterbar soll Daten beeinflussen
// - fix markiertes country overlay soll auf metric switcher reagieren

class DynatraceWorldmapApp {
    // test data (coordinates of Linz)
    longitude = 14.2858;
    latitude = 48.3069;

    metricColorMapSelected = new Map();
    metricColorMapHover = new Map();

    dataLabels = new Map();
    tableHeadersPerMetric = new Map();

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

        this.fillTable(currZoom ?? 1);
    }

    initVariables() {
        this.metricColorMapSelected.set('metricswitcher-apdex', 'rgba(61, 199, 29, 1)');
        this.metricColorMapSelected.set('other', 'rgba(97, 36, 127, 1)');

        this.metricColorMapHover.set('metricswitcher-apdex', 'rgba(61, 199, 29, 0.5)');
        this.metricColorMapHover.set('other', 'rgba(97, 36, 127, 0.5)');

        this.dataLabels.set('continent', 'Continent');
        this.dataLabels.set('country', 'Country');
        this.dataLabels.set('region', 'Region');
        this.dataLabels.set('city', 'City');
        this.dataLabels.set('apdex', 'Apdex');
        this.dataLabels.set('useractions', 'User actions');
        this.dataLabels.set('errors', 'Errors');
        this.dataLabels.set('loadactions', 'Load actions');
        this.dataLabels.set('totaluseractions', 'Total user actions');
        this.dataLabels.set('affecteduseractions', 'Affected user actions');
        this.dataLabels.set('Actions', 'Actions');

        this.tableHeadersPerMetric.set('metricswitcher-apdex', ['apdex', 'useractions']);
        this.tableHeadersPerMetric.set('metricswitcher-ua', ['useractions', 'totaluseractions']);
        this.tableHeadersPerMetric.set('metricswitcher-load', ['loadactions', 'totaluseractions']);
        this.tableHeadersPerMetric.set('metricswitcher-xhr', ['loadactions', 'totaluseractions']);
        this.tableHeadersPerMetric.set('metricswitcher-custom', ['loadactions', 'totaluseractions']);
        this.tableHeadersPerMetric.set('metricswitcher-errors', ['errors', 'totaluseractions']);
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

    fillTable(zoomLevel: number) {
        this.fillTableContents(this.getColumnHeaders(this.primaryTableSelector, zoomLevel, true), this.primaryTableSelector, zoomLevel);
        this.fillTableContents(this.getColumnHeaders(this.secondaryTableSelector, zoomLevel, false), this.secondaryTableSelector, zoomLevel);
    }

    fillTableContents(columnHeaders: string[], tableContainer: string, zoomLevel: number) {
        $(tableContainer + "_title").html(this.dataLabels.get(columnHeaders[0]));
        for (var i = 0; i < this.data.length; i++) {
            var row$ = $('<tr/>');
            for (var colIndex = 0; colIndex < columnHeaders.length; colIndex++) {
                let key = columnHeaders[colIndex];
                var curElement = this.data[i];
                let cellValue = curElement[key as keyof typeof curElement];
                if (cellValue == null) cellValue = "";
                
                cellValue = cellValue.toString(); // ensure that value is a string
                
                if (colIndex == 0) { // only for the geocolumn
                    cellValue = this.getLocationName(cellValue, zoomLevel);
                }

                row$.append($('<td/>').html(cellValue));
            }
            $(tableContainer).append(row$);
        }
    }

    getColumnHeaders(selector: string, zoomLevel: number, primary: boolean) {
        let columnSet: string[] = [];
        let headerTr$ = $('<tr/>');

        columnSet = columnSet.concat(this.getGeographicTableColumnHeaders(zoomLevel)[primary ? 0 : 1], this.tableHeadersPerMetric.get(this.selectedMetric), 'Actions');
        for (var i = 0; i < columnSet.length; i++) {
            headerTr$.append($('<th/>').html(this.dataLabels.get(columnSet[i])));
        }
        $(selector).append(headerTr$);

        return columnSet;
    }

    getGeographicTableColumnHeaders(zoomLevel: number): string[] {
        if (zoomLevel <= ZoomLevel.CONTINENT.level) {
            return ['continent', 'country'];
        } else {
            return ['country', 'region'];
        }
        // TODO add handling for Region/City when data has been expanded
    }

    getLocationName(key: string, zoomLevel: number): string {
        let geoValue: string;
        geoValue = this.geoLabels.continents[key as keyof typeof this.geoLabels.continents];
        if (geoValue === undefined) { // check if geoValue is a country
            geoValue = this.geoLabels.countries[key as keyof typeof this.geoLabels.countries];
        }

        if (geoValue === undefined) { // check if geoValue is a region
            for (var i in this.geoLabels.regions) {
                let temp = this.geoLabels.regions[i as keyof typeof this.geoLabels.regions];
                geoValue = temp[key as keyof typeof temp];
                if (geoValue != undefined) {
                    break;
                }
            }
        }

        // TODO add check for city when data has been expanded accordingly

        return geoValue;
    }
}

// start app
new DynatraceWorldmapApp();