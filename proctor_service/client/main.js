const { app, BrowserWindow, ipcMain } = require("electron");
const axios = require("axios");
const config = require('./client_config.json');


const API_URL_test = config.API_URLS.test; // replace with yours

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });

  win.loadFile("index.html");
}

/* -------------------------------
   CALL TEST LAMBDA 
---------------------------------*/
ipcMain.handle("callLambda", async () => {
  try {
    // Replace with the JWT you got from Cognito login
    const jwtToken = config.CURR_TOKEN;
    const response = await axios.get(API_URL_test, {
      headers: {
        Authorization: jwtToken
      }
    });

    //TODO: see what the response.data looks like when you get to here 
    return response.data.message; // or just response.data if you want full response


  } catch (error) {
    console.log(error);
    console.error(error.response ? error.response.data : error);
    return "Error contacting API";
  }
});


/* -------------------------------
   CALL ADMIN-CREATE LAMBDA (NEW)
   This sends: email, role
---------------------------------*/

const API_URL_AssignRole = config.API_URLS.AssignRole;

ipcMain.handle("createUser", async (event, userData) => {
  try {
    const jwtToken = config.CURR_TOKEN;

    const response = await axios.post(
      API_URL_AssignRole,
      {
        email: userData.email,
        role: userData.role
      },
      {
        headers: { Authorization: jwtToken }
      }
    );

    return response.data.message;

  } catch (error) {
    console.error(error.response ? error.response.data : error);
    return { error: "Error creating user" };
  }
});



app.whenReady().then(createWindow);
