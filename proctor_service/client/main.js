// main.js
const { app, BrowserWindow, ipcMain } = require("electron");
const axios = require("axios");
const config = require('./client_config.json');

const API_URL_test = config.API_URLS.test;
const API_URL_AssignRole = config.API_URLS.AssignRole;
const API_URL_UploadTest = config.API_URLS.UploadTest;
const API_URL_PublishTest = config.API_URLS.PublishTest;
const API_URL_ListTests = config.API_URLS.ListTest;
const API_URL_GetSubmissionsForTest = config.API_URLS.GetSubmissionsForTest;
const API_URL_ListAvailableTests = config.API_URLS.ListAvailableTest;
const API_URL_TakeTest = config.API_URLS.TakeTest;
const API_URL_SubmitTest = config.API_URLS.SubmitTest;
const API_URL_GetSubmissionStatus = config.API_URLS.GetSubmissionStatus;

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile("index.html");
}

/* -------------------------------
   CALL TEST LAMBDA
---------------------------------*/
ipcMain.handle("callLambda", async () => {
  try {
    const jwtToken = config.CURR_TOKEN;
    const response = await axios.get(API_URL_test, {
      headers: { Authorization: jwtToken }
    });
    return response.data;
  } catch (error) {
    console.error(error.response ? error.response.data : error);
    return { error: "Error contacting API" };
  }
});

/* -------------------------------
   CALL ADMIN-CREATE LAMBDA
---------------------------------*/
ipcMain.handle("createUser", async (event, userData) => {
  try {
    const jwtToken = config.CURR_TOKEN;
    const response = await axios.post(
      API_URL_AssignRole,
      { email: userData.email, role: userData.role },
      { headers: { Authorization: jwtToken } }
    );
    return response.data;
  } catch (error) {
    console.error(error.response ? error.response.data : error);
    return { error: "Error creating user" };
  }
});

/* -------------------------------
   CALL UPLOADTEST LAMBDA
---------------------------------*/
ipcMain.handle("uploadTest", async (event, data) => {
  try {
    const jwtToken = config.CURR_TOKEN;
    const response = await axios.post(
      API_URL_UploadTest,
      {
        testId: data.testId,
        testJson: data.testJson,
        answersJson: data.answersJson
      },
      { headers: { Authorization: jwtToken } }
    );
    return response.data;
  } catch (error) {
    console.error(error.response ? error.response.data : error);
    return { error: "UploadTest failed" };
  }
});

/* -------------------------------
   CALL PUBLISHTEST LAMBDA
---------------------------------*/
ipcMain.handle("publishTest", async (event, data) => {
  try {
    const jwtToken = config.CURR_TOKEN;
    const response = await axios.post(
      API_URL_PublishTest,
      { testId: data.testId, metadata: data.metadata },
      { headers: { Authorization: jwtToken } }
    );
    return response.data;
  } catch (error) {
    console.error(error.response ? error.response.data : error);
    return { error: "PublishTest failed" };
  }
});

/* -------------------------------
   CALL LISTTESTS LAMBDA
---------------------------------*/
ipcMain.handle("listTests", async () => {
  try {
    const jwtToken = config.CURR_TOKEN;
    const response = await axios.get(API_URL_ListTests, {
      headers: { Authorization: jwtToken }
    });
    return response.data;
  } catch (error) {
    console.error(error.response ? error.response.data : error);
    return { error: "ListTests failed" };
  }
});

/* -------------------------------
   CALL GETSUBMISSIONSFORTEST (Teacher)
---------------------------------*/
ipcMain.handle("getSubmissionsForTest", async (event, testId) => {
  try {
    const jwtToken = config.CURR_TOKEN;
    const url = `${API_URL_GetSubmissionsForTest}?testId=${encodeURIComponent(testId)}`;
    const response = await axios.get(url, { headers: { Authorization: jwtToken } });
    return response.data;
  } catch (error) {
    console.error(error.response ? error.response.data : error);
    return { error: "GetSubmissionsForTest failed" };
  }
});

/* -------------------------------
   CALL LISTAVAILABLETESTS (Student)
---------------------------------*/
ipcMain.handle("listAvailableTests", async () => {
  try {
    const jwtToken = config.CURR_TOKEN;
    const response = await axios.get(API_URL_ListAvailableTests, {
      headers: { Authorization: jwtToken }
    });
    return response.data;
  } catch (error) {
    console.error(error.response ? error.response.data : error);
    return { error: "ListAvailableTests failed" };
  }
});

/* -------------------------------
   CALL TAKETEST (Student)
---------------------------------*/
ipcMain.handle("takeTest", async (event, testId) => {
  try {
    const jwtToken = config.CURR_TOKEN;
    const url = `${API_URL_TakeTest}?testId=${encodeURIComponent(testId)}`;
    const response = await axios.get(url, { headers: { Authorization: jwtToken } });
    return response.data;
  } catch (error) {
    console.error(error.response ? error.response.data : error);
    return { error: "TakeTest failed" };
  }
});

/* -------------------------------
   CALL SUBMITTEST (Student)
   body: { testId, answers }
---------------------------------*/
ipcMain.handle("submitTest", async (event, payload) => {
  try {
    const jwtToken = config.CURR_TOKEN;
    const response = await axios.post(
      API_URL_SubmitTest,
      { testId: payload.testId, answers: payload.answers },
      { headers: { Authorization: jwtToken } }
    );
    return response.data;
  } catch (error) {
    console.error(error.response ? error.response.data : error);
    return { error: "SubmitTest failed" };
  }
});

/* -------------------------------
   CALL GETSUBMISSIONSTATUS (Student)
   Query: ?testId=...
---------------------------------*/
ipcMain.handle("getSubmissionStatus", async (event, testId) => {
  try {
    const jwtToken = config.CURR_TOKEN;
    const url = `${API_URL_GetSubmissionStatus}?testId=${encodeURIComponent(testId)}`;
    const response = await axios.get(url, { headers: { Authorization: jwtToken } });
    return response.data;
  } catch (error) {
    console.error(error.response ? error.response.data : error);
    return { error: "GetSubmissionStatus failed" };
  }
});


app.whenReady().then(createWindow);
