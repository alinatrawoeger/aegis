import React from 'react';
import ReactDOM from 'react-dom/client';
import './ivolunteerScript';
import IVolunteerWorldmapApp from './ivolunteerScript';
import TaskDetailsApp from './iVolTaskDetails';
import './utils';

// Map page
let appElement = document.getElementById('app');
if (appElement !== null) {
    const app = ReactDOM.createRoot(appElement);
    app.render(React.createElement(IVolunteerWorldmapApp));
}

// Task details page
appElement = document.getElementById('taskdetails');
if (appElement !== null) {
    const app = ReactDOM.createRoot(appElement);
    app.render(React.createElement(TaskDetailsApp));
}