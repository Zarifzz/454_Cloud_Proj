// pages/index.js
const { ipcRenderer } = require("electron");

document.getElementById("goAdmin").addEventListener("click", () => {
  ipcRenderer.send("navigate-admin");
});

document.getElementById("goTeacher").addEventListener("click", () => {
  ipcRenderer.send("navigate-teacher");
});

