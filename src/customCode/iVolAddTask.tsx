import React, { Component, createRef, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import styles from "../customCode/styles/ivolunteerStyle.module.css";
import StaticMap from "./components/map/StaticMap";
import { getIVolData } from "./utils";

class AddTaskApp extends Component {
    mapSelector = 'map_addtask';

    locationRef;

    constructor(props) {
        super(props);

        this.locationRef = createRef();
        
        const selectedGeoDataCallback = (value, lon, lat) => {
            const location = {
              "address": value,
              "longitude": lon,
              "latitude": lat
            }

            this.locationRef.current = location;
        };

        const map = ReactDOM.createRoot(document.getElementById(this.mapSelector)!);        
        map.render(React.createElement(StaticMap, {addTask: true, onSelectedLocation: selectedGeoDataCallback}));

        
        const onChangeInput = () => {
          if (isInputValid()) {
            $('#saveBtn').removeClass(styles.saveBtnDisabled);
            $('#saveBtn').addClass(styles.saveBtn);
            $('#saveBtn').on('click', saveClickHandler);
          } else {
            $('#saveBtn').removeClass(styles.saveBtn);
            $('#saveBtn').addClass(styles.saveBtnDisabled);
            $('#saveBtn').off('click', saveClickHandler);
          }
        }

        $('#taskName_input').on('change', onChangeInput);
        $('#beginDate_input').on('change', onChangeInput);
        $('#startTime_input').on('change', onChangeInput);
        $('#endDateInput').on('change', onChangeInput);
        $('#endTimeInput').on('change', onChangeInput);
        $('#zipcode_input').on('change', onChangeInput);
        $('#priority_input').on('change', onChangeInput);

        const saveClickHandler = () => {
          saveNewTask(this.locationRef.current);
      }
    }

    render() {
        return (
          <></>
        )
      }
}

const saveNewTask = function(mapData) {
  const data = getIVolData();

  let newDataElement;
  let taskName = $('#taskName_input').val();
  let beginDate = $('#beginDate_input').val();
  let startTime = $('#startTime_input').val();
  let endDate = $('#endDateInput').val();
  let endTime = $('#endTimeInput').val();
  let description = $('#description_input').val();
  let street = $('#street_input').val();
  let zipCode = $('#zipcode_input').val();
  let city = $('#city_input').val();
  let priority = +$('#priority_input').val();

  let fullStartDate = new Date(beginDate + 'T' + startTime + 'Z');
  let fullEndDate = endDate !== undefined ? new Date(endDate + 'T' + endTime + 'Z') : new Date(beginDate + 'T' + endTime + 'Z');

  let lastTaskID = data[data.length-1].taskid;
  let newTaskID = lastTaskID + 1;

  let region = mapData !== null ? mapData.address.state : '';
  let country = mapData !== null ? mapData.address.country : '';
  let countryCode = mapData !== null ? mapData.address.country_code : '';
  let lon = mapData !== null ? mapData.longitude : '';
  let lat = mapData !== null ? mapData.latitude : '';

  newDataElement = {
      "address": {
          "street": street,
          "zip": zipCode,
          "city": city,
          "region": region,
          "country": country,
          "country-iso": countryCode,
          "coordinates": [lat, lon]
      },
      "taskname": taskName,
      "taskid": newTaskID,
      "coordinator": "TestUser Coordinator",
      "priority": priority,
      "date": {
          "from": fullStartDate,
          "to": fullEndDate
      },
      "friend": [
      ],
      "description": description,
  };

  let dataExistsAlready = false;
  for (let i = 0; i < data.length; i++) {
      if (compareTaskDataElement(newDataElement, data[i])) {
        dataExistsAlready = true;
      }
  }

  if (!dataExistsAlready) {
    data.push(newDataElement);
    sessionStorage.removeItem('iVolData');
    sessionStorage.setItem('iVolData', JSON.stringify(data));
  }

  location.href='ivolunteer_-_map.html';
};

const isInputValid = () => {
  let taskName = $('#taskName_input').val();
  let beginDate = $('#beginDate_input').val();
  let endDate = $('#endDateInput').val();
  let startTime = $('#startTime_input').val();
  let endTime = $('#endTimeInput').val();
  let zipCode = $('#zipcode_input').val();
  let priority = +$('#priority_input').val();

  let isValid = taskName !== '' && zipCode !== '' && beginDate !== undefined && startTime !== '' && endTime !== '' && priority !== undefined && priority >= 1 && priority <= 3;

  if (isValid) {
      let fullStartDate = new Date(beginDate + 'T' + startTime + 'Z');

      let fullEndDate;
      if (endDate !== undefined) {
        fullEndDate = new Date(endDate + 'T' + endTime + 'Z');
      } else {
        fullEndDate = new Date(beginDate + 'T' + endTime + 'Z');
      }

      isValid = isValid && fullStartDate <= fullEndDate;
  }
  
  return isValid;
}

const compareTaskDataElement = (obj1, obj2) => {
  // deep-compare full data element except taskid
  let isEqual: boolean = 
      obj1.taskname === obj2.taskname 
      && obj1.coordinator === obj2.coordinator 
      && obj1.priority === obj2.priority 
      && obj1.description === obj2.description
      && JSON.stringify(obj1.date) === JSON.stringify(obj2.date)
      && JSON.stringify(obj1.friend.sort()) === JSON.stringify(obj2.friend.sort())
      && JSON.stringify(obj1.address) === JSON.stringify(obj2.address);
  
  return isEqual;
}

export default AddTaskApp;