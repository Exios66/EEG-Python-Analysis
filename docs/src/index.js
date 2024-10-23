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

// Initialize required polyfills
if (!window.ResizeObserver) {
  import('resize-observer-polyfill').then(ResizeObserver => {
    window.ResizeObserver = ResizeObserver.default;
  });
}

// Polyfill for IntersectionObserver
if (!window.IntersectionObserver) {
  import('intersection-observer').then(() => {
    // IntersectionObserver polyfill loaded
  });
}

// Polyfill for smooth scrolling
if (!('scrollBehavior' in document.documentElement.style)) {
  import('smoothscroll-polyfill').then((smoothscroll) => {
    smoothscroll.polyfill();
  });
}

// Polyfill for CustomEvent
if (typeof window.CustomEvent !== 'function') {
  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: null };
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }
  window.CustomEvent = CustomEvent;
}

// Polyfill for Element.matches
if (!Element.prototype.matches) {
  Element.prototype.matches = 
    Element.prototype.msMatchesSelector || 
    Element.prototype.webkitMatchesSelector;
}

// Polyfill for Element.closest
if (!Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    let el = this;
    do {
      if (el.matches(s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}

// Polyfill for requestAnimationFrame
(function() {
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(callback) {
        return window.setTimeout(callback, 1000 / 60);
      }
    );
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = (
      window.webkitCancelAnimationFrame ||
      window.mozCancelAnimationFrame ||
      window.oCancelAnimationFrame ||
      window.msCancelAnimationFrame ||
      function(id) {
        window.clearTimeout(id);
      }
    );
  }
})();

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Import required dependencies
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { SnackbarProvider } from 'notistack';

// Import local components and config
import App from './App';
import { store } from './store';
import { theme } from './theme';
import ErrorBoundary from './components/ErrorBoundary';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Initialize error monitoring
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 0.2,
    environment: process.env.NODE_ENV,
    beforeSend(event) {
      // Sanitize error data before sending
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      return event;
    }
  });
}

// Render app with all necessary providers and wrappers
root.render(
  <React.StrictMode>
    <ErrorBoundary fallback={<div>Something went wrong. Please refresh the page.</div>}>
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <SnackbarProvider 
              maxSnack={3}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              autoHideDuration={3000}
            >
              <App />
            </SnackbarProvider>
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Register service worker for PWA support with enhanced error handling
serviceWorkerRegistration.register({
  onSuccess: registration => {
    console.log('Service Worker registered successfully:', registration);
  },
  onUpdate: registration => {
    const waitingServiceWorker = registration.waiting;
    if (waitingServiceWorker) {
      // Show update notification to user
      const updateConfirmed = window.confirm(
        'A new version is available! Would you like to update now?'
      );
      
      if (updateConfirmed) {
        waitingServiceWorker.addEventListener('statechange', event => {
          if (event.target.state === 'activated') {
            window.location.reload();
          }
        });
        waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
      }
    }
  },
  onError: error => {
    console.error('Service Worker registration failed:', error);
    Sentry.captureException(error);
  }
});

// Add comprehensive error tracking
window.addEventListener('error', (error) => {
  console.error('Global error:', error);
  
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      tags: {
        errorType: 'global',
        browser: navigator.userAgent,
        timestamp: new Date().toISOString()
      },
      extra: {
        stack: error.error?.stack,
        componentStack: error.error?.componentStack
      }
    });
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise rejection:', event.reason);
  
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(event.reason, {
      tags: {
        errorType: 'unhandledRejection'
      }
    });
  }
});

// Add comprehensive performance monitoring
if (process.env.NODE_ENV === 'production') {
  const reportWebVitals = (metric) => {
    // Log to console in development
    console.log(metric);
    
    // Send to analytics in production
    if (window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
      });
    }
    
    // Send to custom endpoint
    fetch('/api/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        timestamp: new Date().toISOString()
      })
    }).catch(console.error);
  };
  
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(reportWebVitals); // Cumulative Layout Shift
    getFID(reportWebVitals); // First Input Delay
    getFCP(reportWebVitals); // First Contentful Paint
    getLCP(reportWebVitals); // Largest Contentful Paint
    getTTFB(reportWebVitals); // Time to First Byte
  });
}