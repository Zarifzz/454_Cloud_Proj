const { ipcRenderer } = require("electron");

/* -------------------------
   NAVIGATION
-------------------------- */
document.getElementById("backBtn").addEventListener("click", () => {
  ipcRenderer.send("navigate-index");
});


/* -------------------------
   List Available Tests
-------------------------- */
document.getElementById("listAvailableBtn").addEventListener("click", async () => {
  const response = await ipcRenderer.invoke("listAvailableTests");
  document.getElementById("availableTestsOutput").innerText =
    JSON.stringify(response, null, 2);
});


/* -------------------------
   Take Test
-------------------------- */
document.getElementById("takeTestBtn").addEventListener("click", async () => {
  const testId = document.getElementById("takeTestId").value;

  const response = await ipcRenderer.invoke("takeTest", { testId });
  document.getElementById("takeTestOutput").innerText =
    JSON.stringify(response, null, 2);
});

/* -------------------------
   Take Test - Part for seperate Taketest View
-------------------------- */

document.getElementById("openTestPageBtn").addEventListener("click", () => {
  const testId = document.getElementById("takeTestId").value;
  ipcRenderer.send("navigate-submit-test", testId);
});



/* -------------------------
   Check Submission Status
-------------------------- */
document.getElementById("statusBtn").addEventListener("click", async () => {
  const testId = document.getElementById("statusTestId").value;

  const response = await ipcRenderer.invoke("getSubmissionStatus", { testId });
  document.getElementById("statusOutput").innerText =
    JSON.stringify(response, null, 2);
});
