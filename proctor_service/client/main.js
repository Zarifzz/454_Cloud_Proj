// main.js
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

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
    kiosk: false, 
    menuBarVisible: false

  });

  win.loadFile("pages/login.html");

  //dev tools
  win.webContents.openDevTools();
  
  win.on("close", (e) => {
    if (isProctorMode) e.preventDefault();
  });

  win.on("minimize", (e) => {
    if (isProctorMode) e.preventDefault();
  });


  win.on("blur", () => {
    win.webContents.send("focusLostSig");
  });




}
app.whenReady().then(() => {
  createWindow()
});

//PROCTOR MODE

ipcMain.on("enter-proctor-mode", () => {
  if (!win) return;

  isProctorMode = true;

  win.setKiosk(true);
  win.setFullScreen(true);
  win.setAlwaysOnTop(true, "screen-saver");

 
});

ipcMain.on("exit-proctor-mode", () => {
  if (!win) return;

  isProctorMode = false;

  win.setKiosk(false);
  win.setFullScreen(false);
  win.setAlwaysOnTop(false);
  
});

//WRITE TO JSON
ipcMain.on("save-token", (event, newToken) => {
  const configPath = path.join(__dirname, "client_config.json");


  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

  
  config.CURR_TOKEN = newToken;

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");

  console.log("JWT Save works");
});

//WRITE TO JSON
ipcMain.on("clear-token", (event) => {
  const configPath = path.join(__dirname, "client_config.json");


  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

  
  config.CURR_TOKEN = "";

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");

  console.log("JWT Clears");
});



//NAV

ipcMain.on("navigate-admin", () => {
  win.loadFile("pages/admin/admin.html");
});

ipcMain.on("navigate-index", () => {
  win.loadFile("pages/index.html");
});

ipcMain.on("navigate-login", () => {
  win.loadFile("pages/login.html");
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





