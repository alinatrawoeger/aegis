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
import { default as VectorSrc } from 'ol/source/Vector';
import { Fill, Stroke, Style } from "ol/style";
import React, { useCallback, useEffect, useRef, useState } from "react";
import dataDt from "../../data/dt_database";
import dataIVol from "../../data/ivol_database";
import { groupValuesPerLocation, ZoomLevel } from "../../utils";
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
            selectedColor: 'rgba(61, 199, 29, 0.9)',
            hoverColor: 'rgba(61, 199, 29, 0.5)',
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
    hasMinimap: boolean,
    onSetZoom: (value) => void,
}


const CustomMap: React.FC<CustomMapProps> = ({ selectedMetric, onSetZoom, hasMinimap }) => {
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
    
    // initialization 
    const [ map, setMap ] = useState<OLMap>()
    let [ selectedLocation, setSelectedLocation ] = useState<Feature<Geometry> | undefined>();
    let [ hoveredLocation, setHoveredLocation ] = useState<Feature<Geometry> | undefined>();
    const [ zoom, setZoom ] = useState<ZoomLevel>();
    const [ selectedCoordinates , setSelectedCoordinates ] = useState()

    const mapElement = useRef();

    const mapRef = useRef<OLMap>(); // map object for later use
    mapRef.current = map;

    let currZoom = undefined;

    useEffect( () => {
        // create and add vector source layer
        const overlayLayer = new VectorLayer({
            source: new VectorSrc({
                url: '../../../data/geodata/countries.geojson',
                format: new GeoJSON()
            })
        });

        // create map
        const initialMap = createMap(mapElement.current, ZoomLevel.COUNTRY, longitude, latitude, hasMinimap, overlayLayer);

        initialMap.on('click', handleMapClick);
        initialMap.on('pointermove', handleHover);
        initialMap.on('moveend', handleZoom);

        // save map for later use
        setMap(initialMap)
    }, [])

    // Overlay functions
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


    // click & hover functions on overlay
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
                        let values = groupValuesPerLocation(data, 'country-iso');
                        for (var i = 0; i < values.length; i++) {
                            let curElement = values[i];
                            if (curElement['location'] == selectedLocation.getId()) {
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
    }, [selectedLocation, hoveredLocation]);

    // Zoom functions
    // pass zoom level outside for other components
    const handleZoom = useCallback(
        (event) => {
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
        if (value < 0.5) {
            return overlayColorMap.apdex.Unacceptable.selectedColor;
        } else if (value < 0.60) {
            return overlayColorMap.apdex.Poor.selectedColor;
        } else if (value < 0.70) {
            return overlayColorMap.apdex.Fair.selectedColor;
        } else if (value < 0.85) {
            return overlayColorMap.apdex.Good.selectedColor;
        } else if (value < 1) {
            return overlayColorMap.apdex.Excellent.selectedColor;
        } else {
            return overlayColorMap.empty.selectedColor;
        }
    } else {
        if (value < 0.5) {
            return overlayColorMap.apdex.Unacceptable.hoverColor;
        } else if (value < 0.60) {
            return overlayColorMap.apdex.Poor.hoverColor;
        } else if (value < 0.70) {
            return overlayColorMap.apdex.Fair.hoverColor;
        } else if (value < 0.85) {
            return overlayColorMap.apdex.Good.hoverColor;
        } else if (value < 1) {
            return overlayColorMap.apdex.Excellent.hoverColor;
        } else {
            return overlayColorMap.empty.hoverColor;
        }
    }
   
}

export default CustomMap;