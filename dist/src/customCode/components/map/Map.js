import { Feature, Map, View } from 'ol';
import { defaults as defaultControls } from 'ol/control';
import OverviewMap from 'ol/control/OverviewMap';
import GeoJSON from 'ol/format/GeoJSON';
import Point from 'ol/geom/Point';
import { defaults, DragRotateAndZoom } from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from "ol/layer/Vector";
import { fromLonLat, transform } from 'ol/proj';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import VectorSrc from 'ol/source/Vector';
import { Fill, Icon, Stroke, Style } from "ol/style";
import React, { useCallback, useEffect, useRef, useState } from "react";
import dataDt from "../../data/dt_database";
import dataIVol from "../../data/ivol_database";
import dtFilters from "../../data/dt_filters";
import { Apdex, groupValuesPerLocation, ZoomLevel } from "../../utils";
import styles from "./Map.module.css";
import markerRed from "./img/marker-red.png";
import markerYellow from "./img/marker-yellow.png";
import markerGreen from "./img/marker-green.png";
// test data (coordinates of Linz)
var longitude = 14.2858;
var latitude = 48.3069;
var overlayColorMap = {
    'apdex': {
        'Excellent': {
            selectedColor: 'rgba(61, 199, 29, 0.9)',
            hoverColor: 'rgba(61, 199, 29, 0.5)',
        },
        'Good': {
            selectedColor: 'rgba(122, 254, 92, 0.9)',
            hoverColor: 'rgba(122, 254, 92, 0.5)',
        },
        'Fair': {
            selectedColor: 'rgba(255, 225, 0, 0.9)',
            hoverColor: 'rgba(255, 225, 0, 0.5)',
        },
        'Poor': {
            selectedColor: 'rgba(255, 106, 0, 0.9)',
            hoverColor: 'rgba(255, 106, 0, 0.5)',
        },
        'Unacceptable': {
            selectedColor: 'rgba(238, 16, 12, 0.9)',
            hoverColor: 'rgba(238, 16, 12, 0.5)',
        }
    },
    'other': {
        'Excellent': {
            selectedColor: 'rgba(98, 36, 128, 0.9)',
            hoverColor: 'rgba(98, 36, 128, 0.5)',
        },
        'Good': {
            selectedColor: 'rgba(135, 56, 175, 0.9)',
            hoverColor: 'rgba(135, 56, 175, 0.5)',
        },
        'Fair': {
            selectedColor: 'rgba(170, 86, 212, 0.9)',
            hoverColor: 'rgba(170, 86, 212, 0.5)',
        },
        'Poor': {
            selectedColor: 'rgba(188, 111, 227, 0.9)',
            hoverColor: 'rgba(188, 111, 227, 0.5)',
        },
        'Unacceptable': {
            selectedColor: 'rgba(210, 150, 239, 0.9)',
            hoverColor: 'rgba(210, 150, 239, 0.5)',
        }
    },
    'empty': {
        selectedColor: 'rgba(177, 177, 177, 0.5)',
        hoverColor: 'rgba(177, 177, 177, 0.25)',
    }
};
var data;
var selectedColor;
var hoverColor;
var previouslySelectedLocation;
var previouslyHoveredLocation;
var apdexMetric = 'apdex';
var CustomMap = function (_a) {
    var selectedMetric = _a.selectedMetric, filters = _a.filters, onSetZoom = _a.onSetZoom, onChangeFilters = _a.onChangeFilters, isIVolunteer = _a.isIVolunteer;
    data = !isIVolunteer ? groupValuesPerLocation(dataDt, 'country') : dataIVol;
    if (!isIVolunteer) {
        if (selectedMetric === apdexMetric) {
            selectedColor = overlayColorMap.apdex.Excellent.selectedColor;
            hoverColor = overlayColorMap.apdex.Excellent.hoverColor;
        }
        else {
            selectedColor = overlayColorMap.other.Excellent.selectedColor;
            hoverColor = overlayColorMap.other.Excellent.hoverColor;
        }
    }
    else {
        // TODO add ivolunteer handling
    }
    // ------------ initialization 
    var _b = useState(), map = _b[0], setMap = _b[1];
    var _c = useState(), selectedLocation = _c[0], setSelectedLocation = _c[1];
    var _d = useState(), hoveredLocation = _d[0], setHoveredLocation = _d[1];
    var _e = useState(filters), selectedFilters = _e[0], setSelectedFilters = _e[1];
    var _f = useState(), zoom = _f[0], setZoom = _f[1];
    var _g = useState(), selectedCoordinates = _g[0], setSelectedCoordinates = _g[1];
    var mapElement = useRef();
    var mapRef = useRef(); // map object for later use
    mapRef.current = map;
    var filterRef = useRef();
    filterRef.current = selectedFilters;
    var currZoom = undefined;
    var overlaySource = new VectorSrc({
        url: '../../../data/geodata/countries.geojson',
        format: new GeoJSON(),
    });
    // initialize map and overlays (only called once)
    useEffect(function () {
        // create and add vector source layer
        var overlayLayer = new VectorLayer({
            source: overlaySource
        });
        // create map
        var initialMap = createMap(mapElement.current, ZoomLevel.COUNTRY, longitude, latitude, isIVolunteer, overlayLayer);
        // set event handlers except click handler (will be set later)
        initialMap.on('pointermove', handleHover);
        initialMap.on('moveend', handleZoom);
        // save map for later use
        setMap(initialMap);
    }, []);
    // ---------------- handle filters
    var updateFilterCallback = useCallback(function (value) {
        if (!checkForExistingCountryFilter(value)) {
            selectedLocation = undefined;
        }
        setSelectedFilters(value);
        onChangeFilters(value);
    }, [selectedFilters, onChangeFilters]);
    if (selectedFilters !== undefined && filters !== selectedFilters) {
        setSelectedFilters(filters);
    }
    // -------------- Overlay functions
    // click & hover functions on overlay
    var selectStyle = new Style({
        fill: new Fill({
            color: 'rgba(0, 0, 0, 0)',
        }),
        stroke: new Stroke({
            color: 'rgba(2, 167, 240, 1)',
            width: 2,
        }),
    });
    var hoverStyle = new Style({
        fill: new Fill({
            color: 'rgba(0, 0, 0, 0)',
        }),
        stroke: new Stroke({
            color: 'rgba(2, 167, 240, 1)',
            width: 2,
        }),
    });
    var handleHover = function (event) {
        mapRef.current.forEachFeatureAtPixel(event.pixel, function (feature) {
            if (selectedLocation !== feature) {
                if (previouslyHoveredLocation !== undefined && previouslyHoveredLocation !== feature) {
                    previouslyHoveredLocation.setStyle(undefined);
                }
                setHoveredLocation(feature);
            }
        });
    };
    var handleMapClick = function (event) {
        // higlight newly selected location
        mapRef.current.forEachFeatureAtPixel(event.pixel, function (feature) {
            if (!isIVolunteer) {
                if (previouslySelectedLocation !== undefined) {
                    previouslySelectedLocation.setStyle(undefined);
                }
                setSelectedLocation(feature);
                setHoveredLocation(undefined);
                // add selected country to filter list
                var currentFilters = [];
                for (var i = 0; i < selectedFilters.length; i++) {
                    if (selectedFilters[i].key !== 'country') {
                        currentFilters.push(selectedFilters[i]);
                    }
                }
                currentFilters.push({
                    "key": 'country',
                    "value": feature.get('name')
                });
                updateFilterCallback(currentFilters);
            }
            else {
                // open dialog if user wants to create a new task
                // if yes, redirect to Add Task page
                // if no, close dialog and do nothing
            }
        });
    };
    useEffect(function () {
        if (selectedLocation !== undefined) { // at the beginning no location is selected
            var value = void 0;
            for (var i_1 = 0; i_1 < data.length; i_1++) {
                if (data[i_1].iso === selectedLocation.getId()) {
                    value = data[i_1].apdex;
                    break;
                }
            }
            selectedColor = getDtOverlayColor(selectedMetric, value, true);
            selectStyle.getFill().setColor(selectedColor);
            selectedLocation.setStyle(selectStyle);
            previouslySelectedLocation = selectedLocation;
            // add tooltip information
            var tooltipTitle = document.getElementById('tooltipTitle');
            if (tooltipTitle) {
                if (selectedLocation) {
                    tooltipTitle.innerHTML = selectedLocation.get('name');
                    // Show Dynatrace-related information
                    if (!isIVolunteer) {
                        var values = groupValuesPerLocation(data, 'iso');
                        var valueFound = false;
                        for (var i = 0; i < values.length; i++) {
                            var curElement = values[i];
                            if (curElement['iso'] == selectedLocation.getId()) {
                                $('#tooltip_apdex').text(curElement['apdex']);
                                $('#tooltip_useractions').text(curElement['useractions'] + '/min');
                                $('#tooltip_errors').text(curElement['errors'] + '/min');
                                $('#tooltip_loadactions').text(curElement['loadactions']);
                                $('#tooltip_totaluseractions').text(curElement['totaluseractions']);
                                $('#tooltip_affecteduseractions').text(curElement['affecteduseractions'] + ' %');
                                valueFound = true;
                                break;
                            }
                        }
                        if (!valueFound) {
                            $('#tooltip_apdex').text('?');
                            $('#tooltip_useractions').text('?');
                            $('#tooltip_errors').text('?');
                            $('#tooltip_loadactions').text('?');
                            $('#tooltip_totaluseractions').text('?');
                            $('#tooltip_affecteduseractions').text('?');
                        }
                    }
                    else {
                        // TODO add iVolunteer Tooltip info
                    }
                }
                else {
                    tooltipTitle.innerHTML = '&nbsp;';
                }
            }
        }
        if (hoveredLocation !== undefined) { // at the beginning no location is hovered over
            var value = void 0;
            for (var i_2 = 0; i_2 < data.length; i_2++) {
                if (data[i_2].iso === hoveredLocation.getId()) {
                    value = data[i_2][selectedMetric];
                    break;
                }
            }
            hoverColor = getDtOverlayColor(selectedMetric, value, false);
            hoverStyle.getFill().setColor(hoverColor);
            hoveredLocation.setStyle(hoverStyle);
            previouslyHoveredLocation = hoveredLocation;
            if (selectedLocation !== undefined) {
                selectStyle.getFill().setColor(selectedColor);
                selectedLocation.setStyle(selectStyle);
            }
        }
    }, [hoveredLocation, selectedLocation, selectedFilters, onChangeFilters]);
    // ---------------  Zoom functions
    // pass zoom level outside for other components
    var handleZoom = useCallback(function () {
        if (mapRef.current !== undefined) {
            var newZoom = mapRef.current.getView().getZoom();
            if (currZoom != newZoom) {
                currZoom = newZoom;
                setZoom(currZoom);
                onSetZoom(currZoom);
            }
            var markerDataset = [];
            if (isIVolunteer) {
            }
            else {
                mapRef.current.getLayers().getArray()
                    .filter(function (layer) { return layer.get('name') === 'LocationMarker'; })
                    .forEach(function (layer) { return mapRef.current.removeLayer(layer); });
                if (newZoom >= ZoomLevel.COUNTRY) {
                    markerDataset = getDataSetForMarkers(isIVolunteer);
                    for (var i = 0; i < markerDataset.length; i++) {
                        addIconOverlay(isIVolunteer, markerDataset[i], mapRef.current, selectedMetric);
                    }
                }
            }
        }
    }, [zoom, onSetZoom]);
    // ---------- set click handler
    // if click handler is set during initialization, the filters aren't updated properly 
    // because it thinks the filter array is still empty (as it was during initialization)
    if (mapRef.current !== undefined) {
        mapRef.current.on('click', handleMapClick);
    }
    useEffect(function () {
        // potentially deselect country if filter has been removed
        var containsCountryFilter = false;
        for (var i = 0; i < selectedFilters.length; i++) {
            if (selectedFilters[i].key === 'country') {
                containsCountryFilter = true;
                break;
            }
        }
        if (!containsCountryFilter) {
            if (previouslySelectedLocation !== undefined) {
                previouslySelectedLocation.setStyle(undefined);
                previouslySelectedLocation = undefined;
            }
            setSelectedLocation(undefined);
        }
        overlaySource.on('change', function (event) {
            var source = event.target;
            var currentFilterList = filterRef.current;
            if (source.getState() === 'ready' && (currentFilterList === null || currentFilterList === void 0 ? void 0 : currentFilterList.length) > 0) {
                var _loop_1 = function (i) {
                    if (currentFilterList[i].key === 'country') {
                        var filterValue_1 = currentFilterList[i].value;
                        overlaySource.forEachFeature(function (feature) {
                            if (feature.get('name') === filterValue_1) {
                                setSelectedLocation(feature);
                            }
                        });
                    }
                };
                for (var i = 0; i < currentFilterList.length; i++) {
                    _loop_1(i);
                }
            }
        });
    }, [selectedFilters, onChangeFilters]);
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { ref: mapElement, className: !isIVolunteer ? styles.container_dt : styles.container_ivol })));
};
var createMap = function (target, zoom, lon, lat, isIVolunteer, overlayLayer) {
    var mapLayer = new TileLayer({
        source: new OSM()
    });
    var view = new View({
        center: fromLonLat([lon, lat]),
        zoom: zoom
    });
    if (!isIVolunteer) {
        var minimapControl = new OverviewMap({
            className: 'ol-overviewmap ol-custom-overviewmap',
            layers: [new TileLayer({
                    source: new OSM(),
                })],
            collapseLabel: '\u00BB',
            label: '\u00AB',
            collapsed: false,
        });
        return new Map({
            controls: defaultControls().extend([minimapControl]),
            interactions: defaults().extend([new DragRotateAndZoom()]),
            target: target,
            layers: [mapLayer, overlayLayer],
            view: view
        });
        ;
    }
    else {
        return new Map({
            target: target,
            layers: [mapLayer],
            view: view
        });
    }
};
var getDtOverlayColor = function (selectedMetric, value, selectMode) {
    var metricMapping = selectedMetric === 'apdex' ? selectedMetric : 'other';
    if (selectMode) {
        if (value < Apdex.UNACCEPTABLE) {
            return overlayColorMap[metricMapping].Unacceptable.selectedColor;
        }
        else if (value < Apdex.POOR) {
            return overlayColorMap[metricMapping].Poor.selectedColor;
        }
        else if (value < Apdex.FAIR) {
            return overlayColorMap[metricMapping].Fair.selectedColor;
        }
        else if (value < Apdex.GOOD) {
            return overlayColorMap[metricMapping].Good.selectedColor;
        }
        else if (value < Apdex.EXCELLENT) {
            return overlayColorMap[metricMapping].Excellent.selectedColor;
        }
        else {
            return overlayColorMap.empty.selectedColor;
        }
    }
    else {
        if (value < Apdex.UNACCEPTABLE) {
            return overlayColorMap[metricMapping].Unacceptable.hoverColor;
        }
        else if (value < Apdex.POOR) {
            return overlayColorMap[metricMapping].Poor.hoverColor;
        }
        else if (value < Apdex.FAIR) {
            return overlayColorMap[metricMapping].Fair.hoverColor;
        }
        else if (value < Apdex.GOOD) {
            return overlayColorMap[metricMapping].Good.hoverColor;
        }
        else if (value < Apdex.EXCELLENT) {
            return overlayColorMap[metricMapping].Excellent.hoverColor;
        }
        else {
            return overlayColorMap.empty.hoverColor;
        }
    }
};
var checkForExistingCountryFilter = function (filters) {
    var filterExists = false;
    for (var i = 0; i < filters.length; i++) {
        if (filters[i].key === 'country') {
            filterExists = true;
            break;
        }
    }
    return filterExists;
};
var getDataSetForMarkers = function (isIVolunteer) {
    if (isIVolunteer) {
        return [];
    }
    else {
        var citiesDataset = [];
        for (var i = 0; i < dataDt.length; i++) {
            if (dataDt[i].city != undefined) {
                citiesDataset.push(dataDt[i]);
            }
        }
        return citiesDataset;
    }
};
var addIconOverlay = function (isIVolunteer, markerData, map, selectedMetric) {
    var _a = getCoordinatesForCity(markerData.city), longitude = _a.longitude, latitude = _a.latitude;
    var iconSource = '';
    if (isIVolunteer) {
        if (selectedMetric === 'urgency') {
            iconSource = markerRed;
        }
        else if (selectedMetric === 'priority') {
            iconSource = markerYellow;
        }
        else if (selectedMetric === 'duration') {
            iconSource = markerGreen;
        }
    }
    else {
        iconSource = markerRed;
    }
    if (iconSource != '') {
        var iconFeature = new Feature({
            geometry: new Point(transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857')),
            name: 'LocationMarker',
            population: 4000,
            rainfall: 500,
        });
        var iconStyle = new Style({
            image: new Icon({
                anchor: [0.5, 20],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                src: iconSource
            }),
        });
        iconFeature.setStyle(iconStyle);
        var vectorSource = new VectorSource({
            features: [iconFeature],
        });
        var iconVectorLayer = new VectorLayer({
            source: vectorSource,
            properties: {
                name: 'LocationMarker'
            }
        });
        map.addLayer(iconVectorLayer);
    }
};
var getCoordinatesForCity = function (cityName) {
    var fullCityList = dtFilters[0].city.properties;
    var longitude;
    var latitude;
    for (var continentKey in fullCityList) {
        for (var countryKey in fullCityList[continentKey]) {
            for (var regionKey in fullCityList[continentKey][countryKey]) {
                for (var i = 0; i < fullCityList[continentKey][countryKey][regionKey].length; i++) {
                    var databaseCity = fullCityList[continentKey][countryKey][regionKey][i];
                    if (cityName === databaseCity.name) {
                        longitude = databaseCity.longitude;
                        latitude = databaseCity.latitude;
                    }
                }
            }
        }
    }
    return { longitude: longitude, latitude: latitude };
};
export default CustomMap;
//# sourceMappingURL=Map.js.map