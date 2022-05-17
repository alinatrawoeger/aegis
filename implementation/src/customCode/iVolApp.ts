import React from 'react';
import ReactDOM from 'react-dom/client';
import './ivolunteerScript';
import IVolunteerWorldmapApp from './ivolunteerScript';
import './utils';

const app = ReactDOM.createRoot(document.getElementById('app'));
app.render(React.createElement(IVolunteerWorldmapApp));