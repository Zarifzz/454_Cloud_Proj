// main.js
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

// Load backend.js (your API calls)
const backend = require("./backend.js");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,        // allows require(), ipcRenderer
      contextIsolation: false
    }
  });

  win.loadFile("pages/index.html");
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


/* ------------------------------------------
   CONNECT FRONTEND → backend.js
------------------------------------------- */
ipcMain.handle("createUser", backend.createUser);

// Teachers
ipcMain.handle("uploadTest", backend.uploadTest);
ipcMain.handle("publishTest", backend.publishTest);
ipcMain.handle("listTests", backend.listTests);
ipcMain.handle("getSubmissionsForTest", backend.getSubmissionsForTest);

