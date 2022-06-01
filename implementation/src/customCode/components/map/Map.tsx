import { Feature, Map, Map as OLMap, View } from 'ol';
import { defaults as defaultControls } from 'ol/control';
import OverviewMap from 'ol/control/OverviewMap';
import GeoJSON from 'ol/format/GeoJSON';
import Geometry from "ol/geom/Geometry";
import { defaults, DragRotateAndZoom } from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from "ol/layer/Vector";
import { fromLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM';
import VectorSrc from 'ol/source/Vector';
import { Fill, Stroke, Style } from "ol/style";
import React, { useCallback, useEffect, useRef, useState } from "react";
import dataDt from "../../data/dt_database";
import dataIVol from "../../data/ivol_database";
import { Apdex, groupValuesPerLocation, ZoomLevel } from "../../utils";
import styles from "./Map.module.css";

// test data (coordinates of Linz)
const longitude = 14.2858;
const latitude = 48.3069;

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
        selectedColor: 'rgba(98, 36, 128, 0.9)',
        hoverColor: 'rgba(98, 36, 128, 0.5)',
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
    hasMinimap: boolean,
    onSetZoom: (value) => void,
    onChangeFilters: (value) => void
}

const CustomMap: React.FC<CustomMapProps> = ({ selectedMetric, filters, onSetZoom, onChangeFilters, hasMinimap }) => {
    data = hasMinimap ? groupValuesPerLocation(dataDt, 'country') : dataIVol;

    if (hasMinimap) {
        if (selectedMetric === apdexMetric) {
            selectedColor = overlayColorMap.apdex.Excellent.selectedColor;
            hoverColor = overlayColorMap.apdex.Excellent.hoverColor;
        } else {
            selectedColor = overlayColorMap.other.selectedColor;
            hoverColor = overlayColorMap.other.hoverColor;
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
        url: '../../../data/geodata/countries.geojson',
        format: new GeoJSON(),
    });

    // initialize map and overlays (only called once)
    useEffect( () => {
        // create and add vector source layer
        const overlayLayer = new VectorLayer({
            source: overlaySource
        });
        // create map
        const initialMap = createMap(mapElement.current, ZoomLevel.COUNTRY, longitude, latitude, hasMinimap, overlayLayer);

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
            if (hasMinimap) {
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
                // open dialog if user wants to create a new task
                // if yes, redirect to Add Task page
                // if no, close dialog and do nothing
            }
        });
    }

    useEffect( () => {
        if (selectedLocation !== undefined) { // at the beginning no location is selected
            if (selectedMetric === apdexMetric) {
                let value;
                for (let i = 0; i < data.length; i++) {
                    if (data[i].iso === selectedLocation.getId()) {
                        value = data[i].apdex;
                        break;
                    }
                }
                selectedColor = getDtOverlayColor(value, true);
            }

            selectStyle.getFill().setColor(selectedColor);
            selectedLocation.setStyle(selectStyle);
            previouslySelectedLocation = selectedLocation;
            
            // add tooltip information
            const tooltipTitle = document.getElementById('tooltipTitle');
            if (tooltipTitle) {
                if (selectedLocation) {
                    tooltipTitle.innerHTML = selectedLocation.get('name');

                    // Show Dynatrace-related information
                    if (hasMinimap) {
                        let values = groupValuesPerLocation(data, 'iso');
                        for (var i = 0; i < values.length; i++) {
                            let curElement = values[i];
                            if (curElement['iso'] == selectedLocation.getId()) {
                                $('#tooltip_apdex').text(curElement['apdex']);
                                $('#tooltip_useractions').text(curElement['useractions'] + '/min');
                                $('#tooltip_errors').text(curElement['errors'] + '/min');
                                $('#tooltip_loadactions').text(curElement['loadactions']);
                                $('#tooltip_totaluseractions').text(curElement['totaluseractions']);
                                $('#tooltip_affecteduseractions').text(curElement['affecteduseractions'] + ' %');
                                break;
                            }
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
            if (selectedMetric === 'apdex') {
                let value;
                for (let i = 0; i < data.length; i++) {
                    if (data[i].iso === hoveredLocation.getId()) {
                        value = data[i].apdex;
                        break;
                    }
                }
                hoverColor = getDtOverlayColor(value, false);
            }

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
            <div ref={mapElement} className={hasMinimap ? styles.container_dt : styles.container_ivol}></div>
        </>
      )
}

const createMap = (target: string, zoom: ZoomLevel, lon: number, lat: number, hasMinimap: boolean, overlayLayer: any) => {
    var mapLayer = new TileLayer({
        source: new OSM()
    });
    var view = new View({
        center: fromLonLat([lon, lat]),
        zoom: zoom
    });

    if (hasMinimap) {
        const minimapControl = new OverviewMap({
            className: 'ol-overviewmap ol-custom-overviewmap',
            layers: [ new TileLayer({
                source: new OSM(),
                }) ],
            collapseLabel: '\u00BB',
            label: '\u00AB',
            collapsed: false,
        });

        return new Map({
            controls: defaultControls().extend([minimapControl]),
            interactions: defaults().extend([new DragRotateAndZoom()]),
            target: target,
            layers: [ mapLayer, overlayLayer ],
            view: view
        });;
    } else {
        return new Map({
            target: target,
            layers: [ mapLayer ],
            view: view
        });     
    }
}

const getDtOverlayColor = (value: number, selectMode: boolean) => {
    if (selectMode) {
        if (value < Apdex.UNACCEPTABLE) {
            return overlayColorMap.apdex.Unacceptable.selectedColor;
        } else if (value < Apdex.POOR) {
            return overlayColorMap.apdex.Poor.selectedColor;
        } else if (value < Apdex.FAIR) {
            return overlayColorMap.apdex.Fair.selectedColor;
        } else if (value < Apdex.GOOD) {
            return overlayColorMap.apdex.Good.selectedColor;
        } else if (value < Apdex.EXCELLENT) {
            return overlayColorMap.apdex.Excellent.selectedColor;
        } else {
            return overlayColorMap.empty.selectedColor;
        }
    } else {
        if (value < Apdex.UNACCEPTABLE) {
            return overlayColorMap.apdex.Unacceptable.hoverColor;
        } else if (value < Apdex.POOR) {
            return overlayColorMap.apdex.Poor.hoverColor;
        } else if (value < Apdex.FAIR) {
            return overlayColorMap.apdex.Fair.hoverColor;
        } else if (value < Apdex.GOOD) {
            return overlayColorMap.apdex.Good.hoverColor;
        } else if (value < Apdex.EXCELLENT) {
            return overlayColorMap.apdex.Excellent.hoverColor;
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

export default CustomMap;