const { app, BrowserWindow, ipcMain } = require("electron");
const axios = require("axios");

const API_URL = "https://abc123.execute-api.us-west-1.amazonaws.com/dev/hello"; // replace with yours

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });

  win.loadFile("index.html");
}

ipcMain.handle("callLambda", async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data.message;
  } catch (error) {
    console.error(error);
    return "Error contacting API";
  }
});

app.whenReady().then(createWindow);
