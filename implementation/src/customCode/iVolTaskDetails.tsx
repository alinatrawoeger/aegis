import React, { Component } from "react";
import ReactDOM from "react-dom/client";
import { getDateString } from "./components/map/MapUtils";
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
                let { dateString } = getDateString(data.date);

                $('#taskdetails-title').text(data.taskname);
                $('#taskdetails-description').text(data.description);
                $('#taskdetails-date').text(dateString);
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