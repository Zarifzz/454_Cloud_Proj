import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    // Send one-way messages
    send: (channel: string, ...args: any[]) => {
      const validChannels = [
        'navigate-index',
        'navigate-student',
        'navigate-teacher',
        'navigate-admin',
        'navigate-submit-test',
        'enter-proctor-mode',
        'exit-proctor-mode',
      ];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, ...args);
      }
    },

    // Invoke and wait for response
    invoke: (channel: string, ...args: any[]) => {
      const validChannels = [
        // Auth
        'login',
        'logout',
        
        // Admin
        'createUser',
        
        // Teacher
        'uploadTest',
        'publishTest',
        'listTests',
        'getSubmissionsForTest',
        
        // Student
        'listAvailableTests',
        'takeTest',
        'getSubmissionStatus',
        'submitTest',
      ];
      
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
      
      return Promise.reject(new Error(`Invalid IPC channel: ${channel}`));
    },

    // Receive messages from main process
    on: (channel: string, listener: (...args: any[]) => void) => {
      const validChannels = ['fromMain', 'navigate'];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
      }
    },

    // Remove listeners
    removeAllListeners: (channel: string) => {
      ipcRenderer.removeAllListeners(channel);
    },
  },
});

// TypeScript type definitions
declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send: (channel: string, ...args: any[]) => void;
        invoke: (channel: string, ...args: any[]) => Promise<any>;
        on: (channel: string, listener: (...args: any[]) => void) => void;
        removeAllListeners: (channel: string) => void;
      };
    };
  }
}
