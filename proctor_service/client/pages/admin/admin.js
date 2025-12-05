// pages/admin/admin.js
const { ipcRenderer } = require("electron");

document.getElementById("createUserBtn").addEventListener("click", async () => {
  const email = document.getElementById("emailInput").value.trim();
  const role = document.getElementById("roleSelect").value;

  const result = await ipcRenderer.invoke("createUser", { email, role });

  document.getElementById("createUserOutput").innerText =
    JSON.stringify(result, null, 2);
});

document.getElementById("backHome").addEventListener("click", () => {
  ipcRenderer.send("navigate-index");
});
