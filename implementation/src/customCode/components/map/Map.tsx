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
import { ZoomLevel } from "../../utils";
import styles from "./Map.module.css";

// test data (coordinates of Linz)
const longitude = 14.2858;
const latitude = 48.3069;

const apdexSelectedColor = 'rgba(61, 199, 29, 0.9)';
const apdexHoverColor = 'rgba(61, 199, 29, 0.5)';
const otherSelectedColor = '';
const otherHoverColor = ''

let previouslySelectedLocation;
let previouslyHoveredLocation;

function CustomMap ({ selectedMetric, hasMinimap }) {
    
    // initialization 
    const [ map, setMap ] = useState<OLMap>()
    let [ selectedLocation, setSelectedLocation ] = useState<Feature<Geometry> | undefined>();
    let [ hoveredLocation, setHoveredLocation ] = useState<Feature<Geometry> | undefined>();
    let [ selectedColor, setSelectedColor ] = useState(apdexSelectedColor);
    let [ hoverColor, setHoverColor ] = useState(apdexHoverColor);
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

    // hover functions on overlay
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

    // Click functions on overlay
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
            
            const tooltipTitle = document.getElementById('tooltipTitle');
            if (tooltipTitle) {
                if (selectedLocation) {
                    tooltipTitle.innerHTML = selectedLocation.get('name');
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
        <div ref={mapElement} className={hasMinimap ? styles.container_dt : styles.container_ivol}></div>
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