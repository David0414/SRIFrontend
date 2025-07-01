import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'leaflet/dist/leaflet.css';
import './index.css'; // ✅ Tu CSS personalizado

import 'bootstrap/dist/css/bootstrap.min.css'; // ✅ Bootstrap CSS




ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
