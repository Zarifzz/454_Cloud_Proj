// main.js
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");


const backend = require("./backend.js");

let win;
let isProctorMode = false;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,       
      contextIsolation: false
    }, 

    fullscreen: false,
    kiosk: false 

  });

  win.loadFile("pages/index.html");

  //dev tools
  win.webContents.openDevTools();
  
  win.on("close", (e) => {
    if (isProctorMode) e.preventDefault();
  });

  win.on("minimize", (e) => {
    if (isProctorMode) e.preventDefault();
  });


}

app.whenReady().then(createWindow);

/* ------------------------------------------
   NAVIGATION EVENTS
------------------------------------------- */
ipcMain.on("navigate-admin", () => {
  win.loadFile("pages/admin/admin.html");
});

ipcMain.on("navigate-index", () => {
  win.loadFile("pages/index.html");
});

ipcMain.on("navigate-teacher", () => {
  win.loadFile("pages/teacher/teacher.html");
});

ipcMain.on("navigate-student", () => {
  win.loadFile("pages/student/student.html");
});

ipcMain.on("navigate-submit-test", (event, testId) => {
  win.loadFile("pages/student/submit-test.html");


  win.webContents.once("did-finish-load", () => {
    win.webContents.send("load-test", testId);
  });
});

//PROCTOR MODE

ipcMain.on("enter-proctor-mode", () => {
  if (!win) return;

  isProctorMode = true;

  win.setFullScreen(true);
  win.setKiosk(true);
  win.setAlwaysOnTop(true, "screen-saver");
});

ipcMain.on("exit-proctor-mode", () => {
  if (!win) return;

  isProctorMode = false;

  win.setKiosk(false);
  win.setFullScreen(false);
  win.setAlwaysOnTop(false);
});


/* ------------------------------------------
   CONNECT FRONTEND → backend.js
------------------------------------------- */
//Admin
ipcMain.handle("createUser", backend.createUser);

// Teachers
ipcMain.handle("uploadTest", backend.uploadTest);
ipcMain.handle("publishTest", backend.publishTest);
ipcMain.handle("listTests", backend.listTests);
ipcMain.handle("getSubmissionsForTest", backend.getSubmissionsForTest);

//Students
ipcMain.handle("listAvailableTests", backend.listAvailableTests);
ipcMain.handle("takeTest", backend.takeTest);
ipcMain.handle("getSubmissionStatus", backend.getSubmissionStatus);
ipcMain.handle("submitTest", backend.submitTest);





