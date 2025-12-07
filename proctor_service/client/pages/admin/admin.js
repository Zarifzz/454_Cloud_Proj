// pages/admin/admin.js
const { ipcRenderer } = require("electron");

document.getElementById("createUserBtn").addEventListener("click", async () => {
  const email = document.getElementById("emailInput").value.trim();
  const role = document.getElementById("roleSelect").value;

  const result = await ipcRenderer.invoke("createUser", { email, role });

  const output = document.getElementById("createUserOutput");

  if (result.error) {
    output.innerText = `Error: ${result.error}`;
  } 
  else {
    output.innerText = 
      `${result.message}\n` +
      `Email: ${result.email}\n` +
      `Role: ${result.role}`;
  }

});



document.getElementById("backBtn").addEventListener("click", () => {
  ipcRenderer.send("navigate-index");
});
