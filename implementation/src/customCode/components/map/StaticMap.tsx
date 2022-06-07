import { Map as OLMap } from 'ol';
import React, { useEffect, useRef, useState } from 'react';
import { ZoomLevel } from '../../utils';
import styles from "./Map.module.css";
import { addIconOverlay, createMap } from './MapUtils';

type StaticMapProps= {
    dataRow: any;
}

const StaticMap: React.FC<StaticMapProps> = ({ dataRow }) => {

    const [ map, setMap ] = useState<OLMap>()

    const mapElement = useRef();
    const mapRef = useRef<OLMap>(); // map object for later use
    mapRef.current = map;

    // initialize map and markers
    useEffect( () => {
        // create map
        const initialMap = createMap(mapElement.current, ZoomLevel.DETAIL, dataRow.address.coordinates[1], dataRow.address.coordinates[0], true, undefined);

        addIconOverlay(true, dataRow, initialMap, 'urgency');

        // save map for later use
        setMap(initialMap)
    }, [])

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
    
            console.log(element.classList);
        });
    }

    return (
        <>
            <div ref={mapElement} className={styles.container_staticmap}></div>
        </>
    );
}

export default StaticMap;