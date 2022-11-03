import { Map as OLMap } from 'ol';
import { toLonLat } from 'ol/proj';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ZoomLevel } from '../../utils';
import markerBlue from "./img/pinpoint-location-blue_600.svg";
import styles from "./Map.module.css";
import { addIconOverlay, createMap, defaultLatitude, defaultLongitude, setIconMarker } from './MapUtils';

type StaticMapProps= {
    dataRow?: any;
    addTask?: boolean;
    onSelectedLocation?: (value, lon, lat) => void
}

const StaticMap: React.FC<StaticMapProps> = ({ dataRow, addTask, onSelectedLocation }) => {

    const [ map, setMap ] = useState<OLMap>()
    const [ selectedLocation, setSelectedLocation ] = useState<any>();

    const mapElement = useRef();
    const mapRef = useRef<OLMap>(); // map object for later use
    mapRef.current = map;

    // initialize map and markers
    useEffect( () => {
        // create map
        let lon = addTask ? defaultLongitude : dataRow.address.coordinates[1];
        let lat = addTask ? defaultLatitude : dataRow.address.coordinates[0];

        let zoom = addTask ? ZoomLevel.COUNTRY : ZoomLevel.DETAIL

        const initialMap = createMap(mapElement.current, zoom, lon, lat, true, undefined);

        if (addTask) {
            initialMap.on('click', selectLocation);
            $('#zipcode_input').on('keyup', onChangeZipCode);
            $('#street_input').on('keyup', onChangeZipCode);
            $('#city_input').on('keyup', onChangeZipCode);
        } else {
            addIconOverlay(true, dataRow, initialMap, 'detail');
            
            // initially collapse map
            let element = document.getElementById('map_taskdetails');
            let collapseBtn = document.getElementById('collapseMap');
            element.classList.add(styles.hideMap);
            collapseBtn.classList.add(styles.collapsedMapBtn);
        }

        // save map for later use
        setMap(initialMap)
    }, [])

    // pass selected location outside for saving address data
    const updateSelectedLocation = useCallback(
        (value, lon, lat) => {
            setSelectedLocation(value);
            onSelectedLocation(value, lon, lat);
        },
        [selectedLocation, onSelectedLocation],
    );

    if (!addTask) {
        if (mapRef.current !== undefined) {
            $('#collapseMap').on('click', function() {
                let element = document.getElementById('map_taskdetails');
                let collapseBtn = document.getElementById('collapseMap');
               
                if (element.classList.contains(styles.hideMap)) {
                    element.classList.remove(styles.hideMap);
                    collapseBtn.classList.remove(styles.collapsedMapBtn);
                } else {
                    element.classList.add(styles.hideMap);
                    collapseBtn.classList.add(styles.collapsedMapBtn);
                }
            });
        }
    }

    const selectLocation = (event) => {
        var coordinate = toLonLat(event.coordinate).map(function(val) {
            return val.toFixed(6);
        });
        findAddressByCoordinates(coordinate[0], coordinate[1], mapRef.current);
    }

    var timeout;
    const onChangeZipCode = () => {
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            let street = $('#street_input').val();
            let zipCode = $('#zipcode_input').val();
            let city = $('#city_input').val();
    
            const addressString = 'Austria ' + street + ' ' + zipCode + ' ' + city;
            const addressSanitized = addressString.split(' ').join('+');
            findCoordinatesByAddress(addressSanitized, mapRef.current);
        }, 1500);
    }
    
    const findAddressByCoordinates = (lon, lat, map) => {
        fetch('https://nominatim.openstreetmap.org/reverse?format=json&lon=' + lon + '&lat=' + lat).then(function(response) {
            return response.json();
        }).then(function(json) {
            $('#street_input').val('');
            $('#zipcode_input').val('');
            $('#city_input').val('');

            let addressData = json.address;
    
            // optional street value
            let street = addressData.road;
            let houseNumber = addressData.house_number;
            if (street !== undefined) {
                street += houseNumber !== undefined ? ' ' + houseNumber : '';
                $('#street_input').val(street);
            } 
            
            // city can be saved either under city, county or state
            let city = addressData.city;
            if (city === undefined) {
                city = addressData.village;
            }
            if (city === undefined) {
                city = addressData.town;
            }
            if (city === undefined) {
                city = addressData.county;
            }
            if (city === undefined) {
                city = addressData.state;
            }
            $('#city_input').val(city);
            
            $('#zipcode_input').val(addressData.postcode);

            map.getLayers().getArray()
                .filter(layer => layer.get('name') === 'LocationMarker')
                .forEach(layer => map.removeLayer(layer));
            setIconMarker(lon, lat, map, undefined, markerBlue);

            updateSelectedLocation(addressData, lon, lat);
        });
    }

    const findCoordinatesByAddress = (address, map) => {
        fetch('https://nominatim.openstreetmap.org/?format=json&limit=1&addressdetails=1&q=' + address).then(function(response) {
            return response.json();
        }).then(function(json) {
            let lon = json[0].lon;
            let lat = json[0].lat;
            let addressData = json[0].address;
    
            map.getLayers().getArray()
                .filter(layer => layer.get('name') === 'LocationMarker')
                .forEach(layer => map.removeLayer(layer));
            setIconMarker(lon, lat, map, undefined, markerBlue);

            updateSelectedLocation(addressData, lon, lat);
        });
    }

    return (
        <>
            <div ref={mapElement} className={styles.container_staticmap}></div>
        </>
    );
}

export default StaticMap;