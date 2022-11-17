import { Feature, Map, Map as OLMap } from 'ol';
import GeoJSON from 'ol/format/GeoJSON';
import Geometry from "ol/geom/Geometry";
import Draw from 'ol/interaction/Draw';
import VectorLayer from "ol/layer/Vector";
import { default as VectorSource, default as VectorSrc } from 'ol/source/Vector';
import { Fill, Stroke, Style } from "ol/style";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dataDt from "../../data/dt_database";
import { Apdex, checkForExistingFilter, filterDtData, getDataFromTaskId, getFilteredIVolData, getIVolData, groupValuesPerLocation, UrgencyDays, ZoomLevel } from "../../utils";
import styles from "./Map.module.css";
import { addIconOverlay, createMap, defaultLatitude, defaultLongitude, getDateString, getTaskUrgencyDays } from './MapUtils';

let overlayColorMap = {
    'apdex': {
        'Excellent': {
            selectedColor: 'rgba(61, 199, 29, 0.9)',
            hoverColor: 'rgba(61, 199, 29, 0.5)',
            staticColor: 'rgba(61, 199, 29, 0.25)',
        },
        'Good': {
            selectedColor: 'rgba(122, 254, 92, 0.9)',
            hoverColor: 'rgba(122, 254, 92, 0.5)',
            staticColor: 'rgba(122, 254, 92, 0.25)',
        },
        'Fair': {
            selectedColor: 'rgba(255, 225, 0, 0.9)',
            hoverColor: 'rgba(255, 225, 0, 0.5)',
            staticColor: 'rgba(255, 225, 0, 0.25)',
        },
        'Poor': {
            selectedColor: 'rgba(255, 106, 0, 0.9)',
            hoverColor: 'rgba(255, 106, 0, 0.5)',
            staticColor: 'rgba(255, 106, 0, 0.25)',
        },
        'Unacceptable': {
            selectedColor: 'rgba(238, 16, 12, 0.9)',
            hoverColor: 'rgba(238, 16, 12, 0.5)',
            staticColor: 'rgba(238, 16, 12, 0.25)',
        }
    },
    'other': {
        'Excellent': {
            selectedColor: 'rgba(98, 36, 128, 0.9)',
            hoverColor: 'rgba(98, 36, 128, 0.5)',
            staticColor: 'rgba(98, 36, 128, 0.25)',
        },
        'Good': {
            selectedColor: 'rgba(135, 56, 175, 0.9)',
            hoverColor: 'rgba(135, 56, 175, 0.5)',
            staticColor: 'rgba(135, 56, 175, 0.25)',
        },
        'Fair': {
            selectedColor: 'rgba(170, 86, 212, 0.9)',
            hoverColor: 'rgba(170, 86, 212, 0.5)',
            staticColor: 'rgba(170, 86, 212, 0.25)',
        },
        'Poor': {
            selectedColor: 'rgba(188, 111, 227, 0.9)',
            hoverColor: 'rgba(188, 111, 227, 0.5)',
            staticColor: 'rgba(188, 111, 227, 0.25)',
        },
        'Unacceptable': {
            selectedColor: 'rgba(210, 150, 239, 0.9)',
            hoverColor: 'rgba(210, 150, 239, 0.5)',
            staticColor: 'rgba(210, 150, 239, 0.25)',
        }
    },
    'empty': {
        selectedColor: 'rgba(177, 177, 177, 0.5)',
        hoverColor: 'rgba(177, 177, 177, 0.25)',
        staticColor: 'rgba(255, 255, 255, 0.5)',
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
    filters?: any,
    isIVolunteer: boolean,
    onSetZoom?: (value) => void,
    onChangeFilters?: (value) => void
    onChangeRadiusFilter?: (value) => void
}

const InteractiveMap: React.FC<CustomMapProps> = ({ selectedMetric, filters, onSetZoom, onChangeFilters, onChangeRadiusFilter, isIVolunteer }) => {
    const defaultZoom = isIVolunteer ? ZoomLevel.COUNTRY : ZoomLevel.WORLD;

    // ------------ initialization 
    const [ map, setMap ] = useState<OLMap>()
    let [ selectedLocation, setSelectedLocation ] = useState<Feature<Geometry> | undefined>();
    let [ hoveredLocation, setHoveredLocation ] = useState<Feature<Geometry> | undefined>();
    let [ selectedFilters, setSelectedFilters ] = useState(filters);
    const [ zoom, setZoom ] = useState<ZoomLevel>();
    let [ radiusFilter, setRadiusFilter ] = useState<Geometry | undefined>();
    
    if (isIVolunteer) {
        data = getIVolData();
    } else {
        let filteredData = filterDtData(selectedFilters);
        data = groupValuesPerLocation(filteredData, 'country');
    }
    if (!isIVolunteer) {
        if (selectedMetric === apdexMetric) {
            selectedColor = overlayColorMap.apdex.Excellent.selectedColor;
            hoverColor = overlayColorMap.apdex.Excellent.hoverColor;
        } else {
            selectedColor = overlayColorMap.other.Excellent.selectedColor;
            hoverColor = overlayColorMap.other.Excellent.hoverColor;
        }
    }

    const mapElement = useRef();
    const mapRef = useRef<OLMap>(); // map object for later use
    mapRef.current = map;

    const metricRef = useRef<string>();
    metricRef.current = selectedMetric;

    const filterRef = useRef();
    filterRef.current = selectedFilters;

    let currZoom = undefined;
    let radiusFilterCircle;
    let canDrawRadiusFilterCircle = isIVolunteer && $('#radiusFilterPanel').length > 0;

    // layer for the countries overlay in DT
    const overlaySource = new VectorSrc({
        url: "../data/geodata/countries.geojson",
        format: new GeoJSON(),
    });

    // layer for the radius filter in iVol
    const radiusFilterVectorLayer = useMemo(()=> {
        let vectorSource = new VectorSource({wrapX: true});
        let vectorLayer = new VectorLayer({
            source: vectorSource,
        });
        return vectorLayer
    },  []);
    
    // initialize map and overlays (only called once)
    useEffect( () => {
        // create and add vector source layer
        const overlayLayer = new VectorLayer({
            source: overlaySource,
            style: function (feature) {
                const color = getDtOverlayColor(metricRef.current, feature, undefined);
                return new Style({
                  fill: new Fill({
                    color: color,
                  }),
                  stroke: new Stroke({
                    color: 'rgba(2, 167, 240, 1)',
                  }),
                });
              },
        });
        
        // create map
        const initialMap: OLMap = createMap(mapElement.current, defaultZoom, defaultLongitude, defaultLatitude, isIVolunteer, overlayLayer, radiusFilterVectorLayer);
        
        // set event handlers except click handler (will be set later)
        initialMap.on('pointermove', handleHover);
        initialMap.on('moveend', handleZoom);    
        addRadiusFilterCircleInteraction(initialMap);

        // save map for later use
        setMap(initialMap)
    }, [])

    
    // ---------------- handle filters
    const updateFilterCallback = useCallback(
        (value) => {
            if (!checkForExistingFilter('country', value)) {
                selectedLocation = undefined;
            }
            
            setSelectedFilters(value);
            onChangeFilters(value);
            
            setIconMarkers(isIVolunteer, mapRef.current, zoom, selectedMetric, value);                
        }, [selectedFilters, onChangeFilters]
    );

    const updateRadiusFilterCircleCallback = useCallback(
        (value) => {
            setRadiusFilter(value);
            onChangeRadiusFilter(value);
        }, [radiusFilter, onChangeRadiusFilter]
    );
           
    const addRadiusFilterCircleInteraction = (map: OLMap) => {
        radiusFilterCircle = new Draw({
            source: radiusFilterVectorLayer.getSource(),
            type: 'Circle',
        });
        
        radiusFilterCircle.on('drawend',  function(e) {
            if (!checkForExistingFilter('radius', selectedFilters)) {
                setRadiusFilter(e.feature.getGeometry());
                updateRadiusFilterCircleCallback(e.feature.getGeometry())
            }
        })
        // remove old circle when starting to draw a new one
        radiusFilterCircle.on('drawstart', function (e) {
            radiusFilterVectorLayer.getSource().clear();
        })
        
        map.addInteraction(radiusFilterCircle);
    }

    if (selectedFilters !== undefined) {
        if (filters !== selectedFilters) {
            setSelectedFilters(filters);
        }
        if (!checkForExistingFilter('radius', filters) && !$('#radiusFilterPanel').length) {
            radiusFilterVectorLayer.getSource().clear();
        }
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

    let timeout;
    const handleHover = (event) => {        
        mapRef.current.forEachFeatureAtPixel(event.pixel, function (feature) {
            if (selectedLocation !== feature) {
                if (previouslyHoveredLocation !== undefined && previouslyHoveredLocation !== feature) {
                    previouslyHoveredLocation.setStyle(undefined);
                }
                setHoveredLocation(feature as Feature<Geometry>);
            }
        });

        if (isIVolunteer) {
            // trigger component on hover to be able to set the radius filter
            timeout = setTimeout(function () {
                setSelectedFilters(selectedFilters);
            }, 250);
        }
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
                clickOnMapMarkerIVol(feature, mapRef.current);
            }
        });
    }

    useEffect( () => {
        if (selectedLocation !== undefined) { // at the beginning no location is selected
            selectedColor = getDtOverlayColor(selectedMetric, selectedLocation, true);

            selectStyle.getFill().setColor(selectedColor);
            selectedLocation.setStyle(selectStyle);
            previouslySelectedLocation = selectedLocation;
            
            // add tooltip information
            const tooltipTitle = document.getElementById('tooltipTitle');
            if (tooltipTitle) {
                if (selectedLocation && !isIVolunteer) {
                    tooltipTitle.innerHTML = selectedLocation.get('name');
                    setTooltipData(selectedLocation, selectedFilters);
                } else {
                    tooltipTitle.innerHTML = '&nbsp;';
                }
            }
        }

        if (hoveredLocation !== undefined) { // at the beginning no location is hovered over
            hoverColor = getDtOverlayColor(selectedMetric, hoveredLocation, false);

            hoverStyle.getFill().setColor(hoverColor)
            hoveredLocation.setStyle(hoverStyle);
            previouslyHoveredLocation = hoveredLocation;

            if (selectedLocation !== undefined) {
                selectStyle.getFill().setColor(selectedColor);
                selectedLocation.setStyle(selectStyle);
            } else {
                // add tooltip information on hover, but only if no location is selected
                const tooltipTitle = document.getElementById('tooltipTitle');
                if (tooltipTitle) {
                    tooltipTitle.innerHTML = hoveredLocation.get('name');
                    setTooltipData(hoveredLocation, selectedFilters);
                }
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
        
        // enable / disable radius filter drawing interaction
        mapRef.current.getInteractions().forEach((interaction) => {
            if (interaction instanceof Draw) {
                interaction.setActive(canDrawRadiusFilterCircle);
            }
        });

        setIconMarkers(isIVolunteer, mapRef.current, zoom, selectedMetric, selectedFilters);
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

const getDtOverlayColor = (selectedMetric: string, countryFeature: any, selectMode: boolean) => {
    let metricMapping = selectedMetric === 'apdex' ? selectedMetric : 'other';
    
    let value;
    for (let i = 0; i < data.length; i++) {
        if (data[i].iso === countryFeature.getId()) {
            value = data[i][selectedMetric];
            break;
        }
    }
    
    if (selectMode === undefined) {
        if (value < Apdex.UNACCEPTABLE) {
            return overlayColorMap[metricMapping].Unacceptable.staticColor;
        } else if (value < Apdex.POOR) {
            return overlayColorMap[metricMapping].Poor.staticColor;
        } else if (value < Apdex.FAIR) {
            return overlayColorMap[metricMapping].Fair.staticColor;
        } else if (value < Apdex.GOOD) {
            return overlayColorMap[metricMapping].Good.staticColor;
        } else if (value < Apdex.EXCELLENT) {
            return overlayColorMap[metricMapping].Excellent.staticColor;
        } else {
            return overlayColorMap.empty.staticColor;
        }
    } else if (selectMode) {
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

const setIconMarkers = (isIVolunteer: boolean, map: Map, zoom: number, selectedMetric: string, selectedFilters: any[]) => {
    let markerDataset = [];
    if (isIVolunteer) {
        map.getLayers().getArray()
                .filter(layer => layer.get('name') === 'LocationMarker')
                .forEach(layer => map.removeLayer(layer));

        markerDataset = getDataSetForMarkers(isIVolunteer, selectedFilters);
        for (let i = 0; i < markerDataset.length; i++) {
            addIconOverlay(isIVolunteer, markerDataset[i], map, selectedMetric);
        }
    } else {
        map.getLayers().getArray()
                .filter(layer => layer.get('name') === 'LocationMarker')
                .forEach(layer => map.removeLayer(layer));


        if (zoom >= ZoomLevel.COUNTRY) {
            markerDataset = getDataSetForMarkers(isIVolunteer, selectedFilters);
            for (let i = 0; i < markerDataset.length; i++) {
                addIconOverlay(isIVolunteer, markerDataset[i], map, selectedMetric);
            }
        }
    }
}

const getDataSetForMarkers = (isIVolunteer: boolean, selectedFilters?: any[]) => {
    if (isIVolunteer) {
        return getFilteredIVolData(getIVolData(), selectedFilters);
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

const clickOnMapMarkerIVol = (feature: any, map: Map) => {
    let markerLayers = map.getLayers().getArray().filter(layer => layer.get('name') === 'LocationMarker');
    for (let i = 0; i < markerLayers.length; i++) {
        let marker = markerLayers[i];
        let markerTaskId = marker.get('source').getFeatures()[0].get('taskid');
        if (markerTaskId = feature.get('taskid')) {
            // get data for taskid
            let data = getDataFromTaskId(markerTaskId);                        

            if (data !== undefined) {
                // show tooltip panel
                let tooltipPanel = document.getElementById('tooltip-panel');
                tooltipPanel.classList.add(styles.iVolTooltipPanel);

                // add data to tooltip
                $('#tooltip-title').text(data.taskname);
                $('#tooltip-taskid').text(data.taskid);
                $('#tooltip-responsible').text(data.coordinator);
                $('#tooltip-city').text(data.address.zip + ' ' + data.address.city);
                
                // calculate urgency based on date
                let { dateFrom } = getDateString(data.date);
                $('#tooltip-date').text(dateFrom.toLocaleString());
                
                let diffDays = getTaskUrgencyDays(dateFrom);
                let urgencyString;
                if (diffDays === 1) {
                    urgencyString = 'morgen';
                } else {
                    urgencyString = 'in ' + diffDays + ' Tagen'
                }

                if (diffDays <= UrgencyDays.SEVERE) {
                    urgencyString += ' - sehr dringend!!';
                } else if (diffDays <= UrgencyDays.HIGH) {
                    urgencyString += ' - dringend!';
                } 
                $('#tooltip-urgency').text(urgencyString);
                
                // add clickhandlers
                $('#close-tooltip').on('click', function() {
                    tooltipPanel.classList.remove(styles.iVolTooltipPanel);
                })
                $('#tooltip-details-link').attr('href', 'ivolunteer_-_taskdetails.html?taskid=' + markerTaskId);
            }
        }
    }
}

const showTooltip = (show: boolean) => {
    if (show) {
        $('#tooltip-panel').show();
    } else {
        $('#tooltip-panel').hide();
    }
}

const setTooltipData = (location, selectedFilters) => {
    // Show Dynatrace-related information
    let values = groupValuesPerLocation(data, 'iso');
    let valueFound = false;
    for (var i = 0; i < values.length; i++) {
        let curElement = values[i];
        if (curElement['iso'] == location.getId()) {
            $('#tooltip_apdex').text(curElement['apdex']);
            $('#tooltip_useractions').text(curElement['useractions'] + '/min');
            $('#tooltip_errors').text(curElement['errors'] + '/min');
            $('#tooltip_loadactions').text(curElement['loadactions'] + 's');
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

    showTooltip(true);
}

export default InteractiveMap;
