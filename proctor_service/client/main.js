const { app, BrowserWindow, ipcMain } = require("electron");
const axios = require("axios");
const config = require('./client_config.json');


const API_URL = config.API_URLS.test; // replace with yours

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
    // Replace with the JWT you got from Cognito login
    const jwtToken = config.CURR_TOKEN;
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: jwtToken
      }
    });

    return response.data.message; // or just response.data if you want full response
  } catch (error) {
    console.error(error.response ? error.response.data : error);
    return "Error contacting API";
  }
});


app.whenReady().then(createWindow);
