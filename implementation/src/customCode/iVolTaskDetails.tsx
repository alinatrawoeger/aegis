import React from "react";
import { Component } from "react";
import { getDataFromTaskId, getUrlParameter } from './utils';


class TaskDetailsApp extends Component {
    constructor(props) {
        super(props);

        let taskId = getUrlParameter('taskId');
        if (taskId !== undefined) {
            let data = getDataFromTaskId(taskId);

            if (data !== undefined) {
                // set data into fields
                $('#taskdetails-title').text(data.taskname);
                $('#taskdetails-description').text(data.description);
                $('#taskdetails-date').text(data.date);
                $('#taskdetails-address').text(data.address.zip + ' ' + data.address.city + ', ' + data.address.street);
            }
        }
    }

    render() {
        return (
          <></>
        )
      }
}

export default TaskDetailsApp;