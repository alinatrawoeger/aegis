import './utils';
import './ivolunteerScript';
import ReactDOM from 'react-dom/client';
import IVolunteerWorldmapApp from './ivolunteerScript';
import React from 'react';

const app = ReactDOM.createRoot(document.getElementById('app'));
app.render(React.createElement(IVolunteerWorldmapApp));