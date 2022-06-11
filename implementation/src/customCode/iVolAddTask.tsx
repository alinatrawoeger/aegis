import React, { Component } from "react";
import ReactDOM from "react-dom/client";
import StaticMap from "./components/map/StaticMap";

class AddTaskApp extends Component {
    mapSelector = 'map_addtask';

    constructor(props) {
        super(props);

        const map = ReactDOM.createRoot(document.getElementById(this.mapSelector)!);
        map.render(React.createElement(StaticMap, {addTask: true}));

        $('').on('click', function() {

        });
    }

    render() {
        return (
          <></>
        )
      }
}

export default AddTaskApp;