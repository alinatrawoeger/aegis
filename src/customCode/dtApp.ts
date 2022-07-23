import React from 'react';
import ReactDOM from 'react-dom/client';
import './dynatraceScript';
import DynatraceWorldmapApp from './dynatraceScript';
import './utils';

const app = ReactDOM.createRoot(document.getElementById('app'));
app.render(React.createElement(DynatraceWorldmapApp));