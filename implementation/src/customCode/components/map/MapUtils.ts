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
import { ZoomLevel } from "../../utils";
import markerGreen from "./img/marker-green.png";
import markerRed from "./img/marker-red.png";
import markerYellow from "./img/marker-yellow.png";

export const createMap = (target: string, zoom: ZoomLevel, lon: number, lat: number, isIVolunteer: boolean, overlayLayer?: VectorLayer<VectorSource<Geometry>>) => {
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
export const addIconOverlay = (isIVolunteer: boolean, markerData: any, map: Map, selectedMetric: string) => {
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