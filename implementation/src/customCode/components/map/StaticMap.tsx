import { Map as OLMap } from 'ol';
import { toLonLat } from 'ol/proj';
import React, { useEffect, useRef, useState } from 'react';
import { ZoomLevel } from '../../utils';
import styles from "./Map.module.css";
import { addIconOverlay, createMap, defaultLatitude, defaultLongitude, setIconMarker } from './MapUtils';

type StaticMapProps= {
    dataRow?: any;
    addTask?: boolean;
}

const StaticMap: React.FC<StaticMapProps> = ({ dataRow, addTask }) => {

    const [ map, setMap ] = useState<OLMap>()

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
        } else {
            addIconOverlay(true, dataRow, initialMap, 'urgency');
        }

        // save map for later use
        setMap(initialMap)
    }, [])

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
        // var lon = $('#u408').text(coordinate[0] + ' / ' + coordinate[1]);
        findAddressByCoordinates(coordinate[0], coordinate[1]);
    }
    
    const findAddressByCoordinates = (lon, lat) => {
        fetch('http://nominatim.openstreetmap.org/reverse?format=json&lon=' + lon + '&lat=' + lat).then(function(response) {
            return response.json();
        }).then(function(json) {
            let addressData = json.address;
    
            // optional street value
            let street = addressData.road;
            let houseNumber = addressData.house_number;
            if (street !== undefined) {
                street += houseNumber !== undefined ? ' ' + houseNumber : '';
                $('#street_input').val(street);
            }
    
            $('#zipcode_input').val(addressData.postcode);
            $('#city_input').val(addressData.city);
    
            mapRef.current.getLayers().getArray()
                .filter(layer => layer.get('name') === 'LocationMarker')
                .forEach(layer => mapRef.current.removeLayer(layer));
            setIconMarker(lon, lat, mapRef.current, undefined, undefined);
        });
    }

    return (
        <>
            <div ref={mapElement} className={styles.container_staticmap}></div>
        </>
    );
}

export default StaticMap;