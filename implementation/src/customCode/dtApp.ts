import './utils';
import './dynatraceScript';
import ReactDOM from 'react-dom/client';
import React from 'react';
import DynatraceWorldmapApp from './dynatraceScript';

const app = ReactDOM.createRoot(document.getElementById('app'));
app.render(React.createElement(DynatraceWorldmapApp));