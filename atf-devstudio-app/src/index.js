import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { registerServiceWorker, checkForInstallPrompt } from './utils/pwaRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Register the service worker for offline capabilities
registerServiceWorker();

// Check if the app can be installed as a PWA
checkForInstallPrompt();

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
