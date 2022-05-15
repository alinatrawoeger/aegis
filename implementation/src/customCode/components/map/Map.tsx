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
import React, { useEffect, useRef, useState } from "react";
import { groupValuesPerLocation, ZoomLevel } from "../../utils";
import styles from "./Map.module.css";
import dataDt from "../../data/dt_database";
import dataIVol from "../../data/ivol_database";
import DynatraceWorldmapApp from '../../dynatraceScript';

// test data (coordinates of Linz)
const longitude = 14.2858;
const latitude = 48.3069;


const apdexSelectedColor = 'rgba(61, 199, 29, 0.9)';
const apdexHoverColor = 'rgba(61, 199, 29, 0.5)';
const otherSelectedColor = '';
const otherHoverColor = '';

let overlayColorMap = {
    'apdex': {
        1.0: {
            selectedColor: 'rgba(61, 199, 29, 0.9)',
            hoverColor: 'rgba(61, 199, 29, 0.5)',
            name: 'Excellent'
        },
        0.85: {
            selectedColor: 'rgba(61, 199, 29, 0.9)',
            hoverColor: 'rgba(61, 199, 29, 0.5)',
            name: 'Good'
        },
        0.70: {
            selectedColor: 'rgba(61, 199, 29, 0.9)',
            hoverColor: 'rgba(61, 199, 29, 0.5)',
            name: 'Average'
        },
        0.60: {
            selectedColor: 'rgba(61, 199, 29, 0.9)',
            hoverColor: 'rgba(61, 199, 29, 0.5)',
            name: 'Poor'
        },
        0.50: {
            selectedColor: 'rgba(61, 199, 29, 0.9)',
            hoverColor: 'rgba(61, 199, 29, 0.5)',
            name: 'Unacceptable'
        }
    },
    'other': {
        selectedColor: 'rgba(98, 36, 128, 0.9)',
        hoverColor: 'rgba(98, 36, 128, 0.5)',
    }
};


let data;

let selectedColor;
let hoverColor;

let previouslySelectedLocation;
let previouslyHoveredLocation;

function CustomMap ({ selectedMetric, hasMinimap }) {
    data = hasMinimap ? dataDt : dataIVol;

    if (hasMinimap) {
        if (selectedMetric === 'apdex') {
            selectedColor = overlayColorMap.apdex[1].selectedColor;
            hoverColor = overlayColorMap.apdex[1].hoverColor;
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

    // TODO remove, just for testing
    let [ count, setCount ] = useState (0);

    const mapElement = useRef();

    const mapRef = useRef<OLMap>(); // map object for later use
    mapRef.current = map;

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
        initialMap.on('moveend', handleZoom);
        initialMap.on('pointermove', handleHover);

        // save map for later use
        setMap(initialMap)
    }, [])

    // Zoom functions
    const handleZoom = (event) => {
        if (zoom != undefined && zoom > ZoomLevel.CONTINENT) {
            // update table accordingly
        } else if (zoom != undefined && zoom < ZoomLevel.COUNTRY) {
            // update table accordingly
        }
    };


    // Overlay functions
    const selectStyle = new Style({
        fill: new Fill({
            color: 'rgba(0, 0, 0, 0)',
        }),
        stroke: new Stroke({
            color: selectedColor,
            width: 2,
        }),
    });

    const hoverStyle = new Style({
        fill: new Fill({
            color: 'rgba(0, 0, 0, 0)',
        }),
        stroke: new Stroke({
            color: hoverColor,
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
            if (previouslySelectedLocation !== undefined) {
                previouslySelectedLocation.setStyle(undefined);
            }

            setSelectedLocation(feature as Feature<Geometry>);
            setHoveredLocation(undefined);
        });
    }

    useEffect( () => {
        if (selectedLocation !== undefined) { // at the beginning no location is selected
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
            hoverStyle.getFill().setColor(hoverColor)
            hoveredLocation.setStyle(hoverStyle);
            previouslyHoveredLocation = hoveredLocation;

            if (selectedLocation !== undefined) {
                selectStyle.getFill().setColor(selectedColor);
                selectedLocation.setStyle(selectStyle);
            }
        }
    }, [selectedLocation, hoveredLocation]);
    
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

export default CustomMap;