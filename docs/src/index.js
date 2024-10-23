import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './index.css';
import App from './App';
import store from './store';
import theme from './theme';
import { ErrorBoundary } from './components/ErrorBoundary';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Initialize any required polyfills
if (!window.ResizeObserver) {
  import('resize-observer-polyfill').then(ResizeObserver => {
    window.ResizeObserver = ResizeObserver.default;
  });
}

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render app with all necessary providers and wrappers
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Register service worker for PWA support
serviceWorkerRegistration.register({
  onUpdate: registration => {
    const waitingServiceWorker = registration.waiting;
    if (waitingServiceWorker) {
      waitingServiceWorker.addEventListener('statechange', event => {
        if (event.target.state === 'activated') {
          window.location.reload();
        }
      });
      waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  }
});

// Add error tracking
window.addEventListener('error', (error) => {
  console.error('Global error:', error);
  // Here you could add error reporting service integration
});

// Add performance monitoring
if (process.env.NODE_ENV === 'production') {
  const reportWebVitals = (metric) => {
    console.log(metric); // Replace with actual reporting logic
  };
  
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(reportWebVitals);
    getFID(reportWebVitals);
    getFCP(reportWebVitals);
    getLCP(reportWebVitals);
    getTTFB(reportWebVitals);
  });
}