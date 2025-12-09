import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import * as api from './api';

let mainWindow: BrowserWindow | null = null;
let isProctorMode = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../public/icon.png'),
    title: 'ProctorSecure',
  });

  const startUrl =
    process.env.ELECTRON_START_URL ||
    (isDev ? 'http://127.0.0.1:5174' : path.join(__dirname, '../dist/index.html'));

  if (startUrl.startsWith('http')) {
    mainWindow.loadURL(startUrl);
  } else {
    mainWindow.loadFile(startUrl);
  }

  // Open DevTools in development
  if (isDev && process.env.ELECTRON_START_URL) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('close', (event: Electron.Event) => {
    if (isProctorMode) {
      event.preventDefault();
    }
  });
}

// =====================================================
// IPC Handlers - Auth
// =====================================================

ipcMain.handle('login', async (event, { email, password }) => {
  try {
    const response = await api.login(email, password);
    return response;
  } catch (error: any) {
    console.error('IPC login error:', error);
    return { success: false, error: error.message || 'Login failed' };
  }
});

ipcMain.handle('logout', async () => {
  try {
    const response = await api.logout();
    return response;
  } catch (error: any) {
    console.error('IPC logout error:', error);
    return { success: false, error: error.message || 'Logout failed' };
  }
});

// =====================================================
// IPC Handlers - Admin
// =====================================================

ipcMain.handle('createUser', async (event, { email, role }) => {
  try {
    const response = await api.createUser(email, role);
    return response;
  } catch (error: any) {
    console.error('IPC createUser error:', error);
    return { error: error.message || 'Failed to create user' };
  }
});

// =====================================================
// IPC Handlers - Teacher
// =====================================================

ipcMain.handle('uploadTest', async (event, payload) => {
  try {
    const response = await api.uploadTest(payload);
    return response;
  } catch (error: any) {
    console.error('IPC uploadTest error:', error);
    return { error: error.message || 'Failed to upload test' };
  }
});

ipcMain.handle('publishTest', async (event, { testId, metadata }) => {
  try {
    const response = await api.publishTest(testId, metadata);
    return response;
  } catch (error: any) {
    console.error('IPC publishTest error:', error);
    return { error: error.message || 'Failed to publish test' };
  }
});

ipcMain.handle('listTests', async () => {
  try {
    const response = await api.listTests();
    return response;
  } catch (error: any) {
    console.error('IPC listTests error:', error);
    return { error: error.message || 'Failed to list tests' };
  }
});

ipcMain.handle('getSubmissionsForTest', async (event, { testId }) => {
  try {
    const response = await api.getSubmissionsForTest(testId);
    return response;
  } catch (error: any) {
    console.error('IPC getSubmissionsForTest error:', error);
    return { error: error.message || 'Failed to fetch submissions' };
  }
});

// =====================================================
// IPC Handlers - Student
// =====================================================

ipcMain.handle('listAvailableTests', async () => {
  try {
    const response = await api.listAvailableTests();
    return response;
  } catch (error: any) {
    console.error('IPC listAvailableTests error:', error);
    return { error: error.message || 'Failed to list available tests' };
  }
});

ipcMain.handle('takeTest', async (event, { testId }) => {
  try {
    const response = await api.takeTest(testId);
    return response;
  } catch (error: any) {
    console.error('IPC takeTest error:', error);
    return { error: error.message || 'Failed to load test' };
  }
});

ipcMain.handle('getSubmissionStatus', async (event, { testId }) => {
  try {
    const response = await api.getSubmissionStatus(testId);
    return response;
  } catch (error: any) {
    console.error('IPC getSubmissionStatus error:', error);
    return { error: error.message || 'Failed to check submission status' };
  }
});

ipcMain.handle('submitTest', async (event, { testId, answers }) => {
  try {
    const response = await api.submitTest(testId, answers);
    return response;
  } catch (error: any) {
    console.error('IPC submitTest error:', error);
    return { error: error.message || 'Failed to submit test' };
  }
});

// =====================================================
// IPC Handlers - Navigation & Proctoring
// =====================================================

ipcMain.on('navigate-index', () => {
  if (mainWindow) {
    mainWindow.webContents.send('navigate', '/');
  }
});

ipcMain.on('navigate-student', () => {
  if (mainWindow) {
    mainWindow.webContents.send('navigate', '/student');
  }
});

ipcMain.on('navigate-teacher', () => {
  if (mainWindow) {
    mainWindow.webContents.send('navigate', '/teacher');
  }
});

ipcMain.on('navigate-admin', () => {
  if (mainWindow) {
    mainWindow.webContents.send('navigate', '/admin');
  }
});

ipcMain.on('navigate-submit-test', (event, testId) => {
  if (mainWindow) {
    mainWindow.webContents.send('navigate', `/test/${testId}`);
  }
});

ipcMain.on('enter-proctor-mode', () => {
  if (!mainWindow) return;
  isProctorMode = true;
  mainWindow.setFullScreen(true);
  mainWindow.setKiosk(true);
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  console.log('Entered proctor mode');
});

ipcMain.on('exit-proctor-mode', () => {
  if (!mainWindow) return;
  isProctorMode = false;
  mainWindow.setKiosk(false);
  mainWindow.setFullScreen(false);
  mainWindow.setAlwaysOnTop(false);
  console.log('Exited proctor mode');
});

// =====================================================
// App Lifecycle
// =====================================================

// Create window when app is ready
app.whenReady().then(createWindow);

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Re-create window when dock icon is clicked (macOS)
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
