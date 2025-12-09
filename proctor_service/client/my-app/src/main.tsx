import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/globals.css';

declare global {
  interface Window {
    electron?: {
      ipcRenderer: {
        send: (channel: string, ...args: any[]) => void;
        invoke: (channel: string, ...args: any[]) => Promise<any>;
        on: (channel: string, listener: (event: unknown, ...args: any[]) => void) => void;
        removeAllListeners: (channel: string) => void;
      };
    };
  }
}

if (window.electron?.ipcRenderer) {
  window.electron.ipcRenderer.on('navigate', (_event, path: string) => {
    if (typeof path === 'string') {
      window.history.pushState({}, '', path)
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  })
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
