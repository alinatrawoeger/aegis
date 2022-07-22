import { Feature, Map, View } from 'ol';
import { defaults as defaultControls } from 'ol/control';
import OverviewMap from 'ol/control/OverviewMap';
import Geometry from 'ol/geom/Geometry';
import Point from 'ol/geom/Point';
import { defaults, DragRotateAndZoom } from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat, transform } from 'ol/proj';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { Icon, Style } from 'ol/style';
import dtFilters from "../../data/dt_filters";
import { DurationLength, PriorityLevels, UrgencyDays, ZoomLevel } from "../../utils";
import markerRed_severe from "./img/criticalevent-red_800.svg";
import markerBlue from "./img/pinpoint-location-blue_600.svg";
import markerGreen_low from "./img/pinpoint-location-green_400.svg";
import markerGreen_medium from "./img/pinpoint-location-green_600.svg";
import markerGreen_high from "./img/pinpoint-location-green_900.svg";
import markerRed_low from "./img/pinpoint-location-red_300.svg";
import markerRed_medium from "./img/pinpoint-location-red_500.svg";
import markerRed_high from "./img/pinpoint-location-red_800.svg";
import markerYellow_low from "./img/pinpoint-location-yellow_300.svg";
import markerYellow_medium from "./img/pinpoint-location-yellow_500.svg";
import markerYellow_high from "./img/pinpoint-location-yellow_700.svg";

// test data (coordinates of the center of Austria)
export const defaultLongitude = 14.12456;
export const defaultLatitude = 47.59397;

export const createMap = (target: string, zoom: ZoomLevel, lon: number, lat: number, isIVolunteer: boolean, overlayLayer?: VectorLayer<VectorSource<Geometry>>) => {
    var mapLayer = new TileLayer({
        source: new OSM()
    });
    var view = new View({
        center: fromLonLat([lon, lat]),
        zoom: zoom,
        enableRotation: false
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

export const addIconOverlay = (isIVolunteer: boolean, markerData: any, map: Map, selectedMetric: string) => {
    let { longitude, latitude } = isIVolunteer ?  getCoordinatesForCityIVol(markerData) : getCoordinatesForCityDt(markerData.city);
    
    let iconSource = '';
    if (isIVolunteer) {
        if (selectedMetric === 'urgency') {
            let diffDays = getTaskUrgencyDays(new Date(markerData.date.from));
            if (diffDays <= UrgencyDays.SEVERE) {
                iconSource = markerRed_severe;
            } else if (diffDays <= UrgencyDays.HIGH) {
                iconSource = markerRed_high;
            } else if (diffDays <= UrgencyDays.MEDIUM) {
                iconSource = markerRed_medium;
            } else {
                iconSource = markerRed_low;
            }
        } else if (selectedMetric === 'priority') {
            let priority = markerData.priority;
            if (priority === PriorityLevels.HIGH) {
                iconSource = markerYellow_high;
            } else if (priority === PriorityLevels.MEDIUM) {
                iconSource = markerYellow_medium;
            } else {
                iconSource = markerYellow_low;
            }
        } else if (selectedMetric === 'duration') {
            let duration = getTaskDurationLength(markerData.date.from, markerData.date.to);
            if (duration <= DurationLength.SHORT) {
                iconSource = markerGreen_high;
            } else if (duration <= DurationLength.MEDIUM) {
                iconSource = markerGreen_medium;
            } else {
                iconSource = markerGreen_low;
            }
        } else {
            iconSource = markerBlue;
        }
    } else {
        iconSource = markerRed_high;
    }

    if (iconSource != '') {
        let markerId = isIVolunteer ? markerData.taskid : undefined;
        setIconMarker(longitude, latitude, map, markerId, iconSource);
    }
}

export const setIconMarker = (lon: number, lat: number, map: Map, markerId?: string, iconSource?: any) => {
    const iconFeature = new Feature({
        geometry: new Point(transform([lon, lat], 'EPSG:4326', 'EPSG:3857')),
        name: 'LocationMarkerFeature',
        population: 4000,
        rainfall: 500,
      });
      if (markerId !== undefined) {
        iconFeature.set('taskid', markerId);
      }     

      if (iconSource === undefined) {
          iconSource = markerRed_high;
      }
      const iconStyle = new Style({
        image: new Icon({
          anchor: [0.5, 1],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          scale: [0.1, 0.1],
          src: iconSource
        }),
      });
      iconFeature.setStyle(iconStyle);
      
      const vectorSource = new VectorSource({
        features: [iconFeature],
        wrapX: false,
      });
      
      
      const iconVectorLayer = new VectorLayer({
        source: vectorSource,
        properties: {
            name: 'LocationMarker'
        }
      });

      map.addLayer(iconVectorLayer);
}

export const getCoordinatesForCityIVol = (markerData: any) => {
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

export const getDateString = (date) => {
    let dateFrom = new Date(date.from);
    let timeOffset = dateFrom.getTimezoneOffset();
    dateFrom.setHours(dateFrom.getHours() + (timeOffset/60)); //timeOffset is a negative number, therefore we need to add it 
    
    let dateTo;
    if (date.to !== '') {
        dateTo = new Date(date.to);
        dateTo.setHours(dateTo.getHours() + (timeOffset/60));
    }

    let dateString = dateFrom.toLocaleDateString() + ', ' + dateFrom.toLocaleTimeString();
    dateString += dateTo !== undefined ? ' bis ' + dateTo.toLocaleDateString() + ', ' + dateTo.toLocaleTimeString() : "";

    return { dateFrom, dateTo, dateString };
}

export const getTaskUrgencyDays = (date) => {
    let currentDate = new Date().getTime();
    const diffTime = Math.abs(currentDate - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

const getTaskDurationLength = (dateFrom, dateTo) => {
    let dateFromTime = new Date(dateFrom).getTime();
    let dateToTime;
    if (dateTo !== '') {
        dateToTime = new Date(dateTo).getTime();
    } else {
        dateToTime = dateFromTime;
    }

    const diffTime = Math.abs(dateFromTime - dateToTime);
    const durationLength = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return durationLength;
}