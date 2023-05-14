import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// eslint-disable-next-line import/no-unresolved
import { registerSW } from 'virtual:pwa-register'
import * as Sentry from '@sentry/react'
import ReactGA from 'react-ga'
import { ViewportProvider } from '@contexts/viewport'

const TRACKING_ID = import.meta.env.VITE_GA_MESUREMENT_ID || 'G-038PZRTCKQ' // OUR_TRACKING_ID
ReactGA.initialize(TRACKING_ID)
ReactGA.pageview(window.location.pathname)
console.log(TRACKING_ID)
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
})

// add this to prompt for a refresh
registerSW({
  onOfflineReady() {},
})
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ViewportProvider>
      <App />
    </ViewportProvider>
  </React.StrictMode>
)
// document.querySelector('meta[name="theme-color"]').setAttribute('content', '#123456');
