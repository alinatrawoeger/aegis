import React from "react";
import { Component } from "react";
import ReactDOM from "react-dom/client";
import InteractiveMap from "./components/map/Map";
import StaticMap from "./components/map/StaticMap";
import { getDataFromTaskId, getUrlParameter } from './utils';

class TaskDetailsApp extends Component {
    mapSelector = 'map_taskdetails'

    constructor(props) {
        super(props);

        let taskId = getUrlParameter('taskId');
        if (taskId !== undefined) {
            let data = getDataFromTaskId(taskId);

            if (data !== undefined) {
                // set data into fields
                let date = new Date(data.date);

                $('#taskdetails-title').text(data.taskname);
                $('#taskdetails-description').text(data.description);
                $('#taskdetails-date').text(date.toLocaleDateString() + ', ' + date.toLocaleTimeString());
                $('#taskdetails-address').text(data.address.zip + ' ' + data.address.city + ', ' + data.address.street);
            }

            const map = ReactDOM.createRoot(document.getElementById('map_taskdetails')!);
            map.render(React.createElement(StaticMap, { dataRow: data }));
        }
    }

    render() {
        return (
          <></>
        )
      }
}

export default TaskDetailsApp;