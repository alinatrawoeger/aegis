import { Feature, Map, Map as OLMap, View } from 'ol';
import { defaults as defaultControls } from 'ol/control';
import OverviewMap from 'ol/control/OverviewMap';
import GeoJSON from 'ol/format/GeoJSON';
import Geometry from "ol/geom/Geometry";
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

// test data (coordinates of the center of Austria)
const longitude = 14.12456;
const latitude = 47.59397;

let overlayColorMap = {
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


let data;

let selectedColor;
let hoverColor;

let previouslySelectedLocation;
let previouslyHoveredLocation;

const apdexMetric = 'apdex';

type CustomMapProps = {
    selectedMetric: string,
    filters: any,
    isIVolunteer: boolean,
    onSetZoom: (value) => void,
    onChangeFilters: (value) => void
}

const CustomMap: React.FC<CustomMapProps> = ({ selectedMetric, filters, onSetZoom, onChangeFilters, isIVolunteer }) => {
    data = !isIVolunteer ? groupValuesPerLocation(dataDt, 'country') : dataIVol;

    if (!isIVolunteer) {
        if (selectedMetric === apdexMetric) {
            selectedColor = overlayColorMap.apdex.Excellent.selectedColor;
            hoverColor = overlayColorMap.apdex.Excellent.hoverColor;
        } else {
            selectedColor = overlayColorMap.other.Excellent.selectedColor;
            hoverColor = overlayColorMap.other.Excellent.hoverColor;
        }
    } else {
        // TODO add ivolunteer handling
    }
    
// ------------ initialization 
    const [ map, setMap ] = useState<OLMap>()
    let [ selectedLocation, setSelectedLocation ] = useState<Feature<Geometry> | undefined>();
    let [ hoveredLocation, setHoveredLocation ] = useState<Feature<Geometry> | undefined>();
    let [ selectedFilters, setSelectedFilters ] = useState(filters);
    const [ zoom, setZoom ] = useState<ZoomLevel>();
    const [ selectedCoordinates , setSelectedCoordinates ] = useState()

    const mapElement = useRef();
    const mapRef = useRef<OLMap>(); // map object for later use
    mapRef.current = map;

    const filterRef = useRef();
    filterRef.current = selectedFilters;

    let currZoom = undefined;

    const overlaySource = new VectorSrc({
        url: "../data/geodata/countries.geojson",
        format: new GeoJSON(),
    });

    // initialize map and overlays (only called once)
    useEffect( () => {
        // create and add vector source layer
        const overlayLayer = new VectorLayer({
            source: overlaySource
        });
        // create map
        const initialMap = createMap(mapElement.current, 6, longitude, latitude, isIVolunteer, overlayLayer);

        // set event handlers except click handler (will be set later)
        initialMap.on('pointermove', handleHover);
        initialMap.on('moveend', handleZoom);    

        // save map for later use
        setMap(initialMap)
    }, [])

// ---------------- handle filters
    const updateFilterCallback = useCallback(
        (value) => {
            if (!checkForExistingCountryFilter(value)) {
                selectedLocation = undefined;
            }
        
            setSelectedFilters(value);
            onChangeFilters(value);
        },
        [selectedFilters, onChangeFilters]
    );
        
    if (selectedFilters !== undefined && filters !== selectedFilters) {
        setSelectedFilters(filters);
    }
        
// -------------- Overlay functions
    // click & hover functions on overlay
    const selectStyle = new Style({
        fill: new Fill({
            color: 'rgba(0, 0, 0, 0)',
        }),
        stroke: new Stroke({
            color: 'rgba(2, 167, 240, 1)',
            width: 2,
        }),
    });

    const hoverStyle = new Style({
        fill: new Fill({
            color: 'rgba(0, 0, 0, 0)',
        }),
        stroke: new Stroke({
            color: 'rgba(2, 167, 240, 1)',
            width: 2,
        }),
    });  

    const handleHover = (event) => {        
        mapRef.current.forEachFeatureAtPixel(event.pixel, function (feature) {
            if (selectedLocation !== feature) {
                if (previouslyHoveredLocation !== undefined && previouslyHoveredLocation !== feature) {
                    previouslyHoveredLocation.setStyle(undefined);
                }
                setHoveredLocation(feature as Feature<Geometry>);
            }
        });
    }

    const handleMapClick = (event) => {
        // higlight newly selected location
        mapRef.current.forEachFeatureAtPixel(event.pixel, function (feature) {
            if (!isIVolunteer) {
                if (previouslySelectedLocation !== undefined) {
                    previouslySelectedLocation.setStyle(undefined);
                }
    
                setSelectedLocation(feature as Feature<Geometry>);
                setHoveredLocation(undefined);

                // add selected country to filter list
                let currentFilters = [];
                for (let i = 0; i < selectedFilters.length; i++) {
                    if (selectedFilters[i].key !== 'country') {
                        currentFilters.push(selectedFilters[i]);
                    }
                }

                currentFilters.push({
                    "key": 'country',
                    "value": feature.get('name')
                });
            
                updateFilterCallback(currentFilters);
            } else {
                let markerLayers = map.getLayers().getArray().filter(layer => layer.get('name') === 'LocationMarker');
                for (let i = 0; i < markerLayers.length; i++) {
                    let marker = markerLayers[i];
                    let markerTaskId = marker.get('source').getFeatures()[0].get('taskid');
                    if (markerTaskId = feature.get('taskid')) {
                        // get data for taskid
                        let data;
                        for (let i = 0; i < dataIVol.length; i++) {
                            if (dataIVol[i].taskid === markerTaskId) {
                                data = dataIVol[i];
                                break;
                            }
                        }

                        if (data !== undefined) {
                            // show tooltip panel
                            let tooltipPanel = document.getElementById('tooltip-panel');
                            tooltipPanel.classList.add(styles.iVolTooltipPanel);
    
                            // add data to tooltip
                            $('#tooltip-title').text(data.taskname);
                            $('#tooltip-taskid').text(data.taskid);
                            $('#tooltip-responsible').text(data.responsible);
                            $('#tooltip-city').text(data.address.zip + ' ' + data.address.city);
                            
                            // add clickhandlers
                            $('#close-tooltip').on('click', function() {
                                tooltipPanel.classList.remove(styles.iVolTooltipPanel);
                            })

                            $('#tooltip-details-link').attr('href', 'ivolunteer_-_taskdetails.html?taskid=' + markerTaskId);
                        }
                    }
                }

                // TODO
                // open dialog if user wants to create a new task
                // if yes, redirect to Add Task page
                // if no, close dialog and do nothing
            }
        });
    }

    useEffect( () => {
        if (selectedLocation !== undefined) { // at the beginning no location is selected
            let value;
            for (let i = 0; i < data.length; i++) {
                if (data[i].iso === selectedLocation.getId()) {
                    value = data[i].apdex;
                    break;
                }
            }
            selectedColor = getDtOverlayColor(selectedMetric, value, true);

            selectStyle.getFill().setColor(selectedColor);
            selectedLocation.setStyle(selectStyle);
            previouslySelectedLocation = selectedLocation;
            
            // add tooltip information
            const tooltipTitle = document.getElementById('tooltipTitle');
            if (tooltipTitle) {
                if (selectedLocation) {
                    tooltipTitle.innerHTML = selectedLocation.get('name');

                    // Show Dynatrace-related information
                    if (!isIVolunteer) {
                        let values = groupValuesPerLocation(data, 'iso');
                        let valueFound = false;
                        for (var i = 0; i < values.length; i++) {
                            let curElement = values[i];
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
                    } else {
                        // TODO add iVolunteer Tooltip info
                    }
                } else {
                    tooltipTitle.innerHTML = '&nbsp;';
                }
            }
        }

        if (hoveredLocation !== undefined) { // at the beginning no location is hovered over
            let value;
            for (let i = 0; i < data.length; i++) {
                if (data[i].iso === hoveredLocation.getId()) {
                    value = data[i][selectedMetric];
                    break;
                }
            }
            hoverColor = getDtOverlayColor(selectedMetric, value, false);

            hoverStyle.getFill().setColor(hoverColor)
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
    const handleZoom = useCallback(
        () => {
            if (mapRef.current !== undefined) {
                var newZoom = mapRef.current.getView().getZoom();
                if (currZoom != newZoom) {
                  currZoom = newZoom;
                  setZoom(currZoom);
                  onSetZoom(currZoom);
                }
            }
        },
        [zoom, onSetZoom],
    );

// ---------- set click handler
// if click handler is set during initialization, the filters aren't updated properly 
// because it thinks the filter array is still empty (as it was during initialization)
    if (mapRef.current !== undefined) {
        mapRef.current.on('click', handleMapClick);
        setIconMarkers(isIVolunteer, mapRef.current, zoom, selectedMetric); 
    }    

    useEffect( () => {
        // potentially deselect country if filter has been removed
        let containsCountryFilter = false;
        for (let i = 0; i < selectedFilters.length; i++) {
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
        
        overlaySource.on('change', function(event){
            var source: any = event.target;
            let currentFilterList = filterRef.current as any;
            if (source.getState() === 'ready' && currentFilterList?.length > 0){
                for (let i = 0; i < currentFilterList.length; i++) {
                    if (currentFilterList[i].key === 'country') {                              
                        let filterValue = currentFilterList[i].value;
                        overlaySource.forEachFeature((feature) => {
                            if (feature.get('name') === filterValue) {
                                setSelectedLocation(feature);
                            }
                        });
                    }
                }
            }   
        });     
    }, [selectedFilters, onChangeFilters]);

    return (
        <>
            <div ref={mapElement} className={!isIVolunteer ? styles.container_dt : styles.container_ivol}></div>
        </>
      )
}

const createMap = (target: string, zoom: ZoomLevel, lon: number, lat: number, isIVolunteer: boolean, overlayLayer: any) => {
    var mapLayer = new TileLayer({
        source: new OSM()
    });
    var view = new View({
        center: fromLonLat([lon, lat]),
        zoom: zoom
    });

    if (!isIVolunteer) {
        const minimapControl = new OverviewMap({
            className: 'ol-overviewmap ol-custom-overviewmap',
            layers: [ new TileLayer({
                source: new OSM(),
                }) ],
            collapseLabel: '\u00BB',
            label: '\u00AB',
            collapsed: false,
        });

        view.setMaxZoom(ZoomLevel.REGION);

        return new Map({
            controls: defaultControls().extend([minimapControl]),
            interactions: defaults().extend([new DragRotateAndZoom()]),
            target: target,
            layers: [ mapLayer, overlayLayer ],
            view: view
        });;
    } else {
        view.setMinZoom(ZoomLevel.COUNTRY);

        return new Map({
            target: target,
            layers: [ mapLayer ],
            view: view
        });     
    }
}

const getDtOverlayColor = (selectedMetric: string, value: number, selectMode: boolean) => {
    let metricMapping = selectedMetric === 'apdex' ? selectedMetric : 'other';
    
    if (selectMode) {
        if (value < Apdex.UNACCEPTABLE) {
            return overlayColorMap[metricMapping].Unacceptable.selectedColor;
        } else if (value < Apdex.POOR) {
            return overlayColorMap[metricMapping].Poor.selectedColor;
        } else if (value < Apdex.FAIR) {
            return overlayColorMap[metricMapping].Fair.selectedColor;
        } else if (value < Apdex.GOOD) {
            return overlayColorMap[metricMapping].Good.selectedColor;
        } else if (value < Apdex.EXCELLENT) {
            return overlayColorMap[metricMapping].Excellent.selectedColor;
        } else {
            return overlayColorMap.empty.selectedColor;
        }
    } else {
        if (value < Apdex.UNACCEPTABLE) {
            return overlayColorMap[metricMapping].Unacceptable.hoverColor;
        } else if (value < Apdex.POOR) {
            return overlayColorMap[metricMapping].Poor.hoverColor;
        } else if (value < Apdex.FAIR) {
            return overlayColorMap[metricMapping].Fair.hoverColor;
        } else if (value < Apdex.GOOD) {
            return overlayColorMap[metricMapping].Good.hoverColor;
        } else if (value < Apdex.EXCELLENT) {
            return overlayColorMap[metricMapping].Excellent.hoverColor;
        } else {
            return overlayColorMap.empty.hoverColor;
        }
    }    
}

const checkForExistingCountryFilter = (filters) => {
    let filterExists = false;
    for (let i = 0; i < filters.length; i++) {
        if (filters[i].key === 'country') {
            filterExists = true;
            break;
        }
    }
    return filterExists;
}

const setIconMarkers = (isIVolunteer: boolean, map: Map, zoom: number, selectedMetric: string) => {
    let markerDataset = [];
    if (isIVolunteer) {
        map.getLayers().getArray()
                .filter(layer => layer.get('name') === 'LocationMarker')
                .forEach(layer => map.removeLayer(layer));

        markerDataset = getDataSetForMarkers(isIVolunteer);
        for (let i = 0; i < markerDataset.length; i++) {
            addIconOverlay(isIVolunteer, markerDataset[i], map, selectedMetric);
        }
    } else {
        map.getLayers().getArray()
                .filter(layer => layer.get('name') === 'LocationMarker')
                .forEach(layer => map.removeLayer(layer));


        if (zoom >= ZoomLevel.COUNTRY) {
            markerDataset = getDataSetForMarkers(isIVolunteer);
            for (let i = 0; i < markerDataset.length; i++) {
                addIconOverlay(isIVolunteer, markerDataset[i], map, selectedMetric);
            }
        }
    }
}

const getDataSetForMarkers = (isIVolunteer: boolean) => {
    // TODO add filter to restrict the shown icons on map
    if (isIVolunteer) {
        return dataIVol;
    } else {
        let citiesDataset = [];
        for (let i = 0; i < dataDt.length; i++) {
            if (dataDt[i].city != undefined) {
                citiesDataset.push(dataDt[i]);
            }
        }
        return citiesDataset;
    }
}

const addIconOverlay = (isIVolunteer: boolean, markerData: any, map: Map, selectedMetric: string) => {
    let { longitude, latitude } = isIVolunteer ?  getCoordinatesForCityIVol(markerData) : getCoordinatesForCityDt(markerData.city);
    
    let iconSource = '';
    if (isIVolunteer) {
        if (selectedMetric === 'urgency') {
            iconSource = markerRed;
        } else if (selectedMetric === 'priority') {
            iconSource = markerYellow;
        } else if (selectedMetric === 'duration') {
            iconSource = markerGreen;
        }
    } else {
        iconSource = markerRed;
    }

    if (iconSource != '') {
        const iconFeature = new Feature({
            geometry: new Point(transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857')),
            name: 'LocationMarkerFeature',
            population: 4000,
            rainfall: 500,
          });
          if (isIVolunteer) {
            iconFeature.set('taskid', markerData.taskid);
        }
          
          const iconStyle = new Style({
            image: new Icon({
              anchor: [0.5, 20],
              anchorXUnits: 'fraction',
              anchorYUnits: 'pixels',
              src: iconSource
            }),
          });
          iconFeature.setStyle(iconStyle);
          
          const vectorSource = new VectorSource({
            features: [iconFeature],
          });
          
          
          const iconVectorLayer = new VectorLayer({
            source: vectorSource,
            properties: {
                name: 'LocationMarker'
            }
          });
    
          map.addLayer(iconVectorLayer);       
    }
}

const getCoordinatesForCityIVol = (markerData: any) => {
    let latitude = markerData.address.coordinates[0]
    let longitude = markerData.address.coordinates[1];
    return { longitude, latitude };
}

const getCoordinatesForCityDt = (cityName: string) => {
    const fullCityList = dtFilters[0].city.properties;
    let longitude: number;
    let latitude: number;
    for (let continentKey in fullCityList) {
        for (let countryKey in fullCityList[continentKey]) {
            for (let regionKey in fullCityList[continentKey][countryKey]) {
                for (let i = 0; i < fullCityList[continentKey][countryKey][regionKey].length; i++) {
                    let databaseCity = fullCityList[continentKey][countryKey][regionKey][i];
                    if (cityName === databaseCity.name) {
                        longitude = databaseCity.longitude;
                        latitude = databaseCity.latitude;
                    }
                }
            }
        }
    }
    return { longitude, latitude };
}

export default CustomMap;