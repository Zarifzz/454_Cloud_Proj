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
document.getElementById("refreshAvailableTestsBtn").addEventListener("click", () => {
  loadAvailableTests();
});

window.addEventListener("DOMContentLoaded", () => {
  loadAvailableTests();
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


//Load AvaiableTests
async function loadAvailableTests() {
  const container = document.getElementById("availableTestsContainer");
  container.innerHTML = "<p>Loading tests...</p>";

  try {
    const response = await ipcRenderer.invoke("listAvailableTests");

    if (!response) throw new Error("IPC returned null/undefined");
    if (response.error) throw new Error(response.error);

    // Expecting: { tests: [...] }
    if (!Array.isArray(response.tests))
      throw new Error("Response.tests is not an array");

    const tests = response.tests;

    if (tests.length === 0) {
      container.innerHTML = "<p>No available tests.</p>";
      return;
    }

    container.innerHTML = "";

    tests.forEach((testObj) => {
      const testId = testObj.testId || "UNKNOWN";
      const title = testObj.title || "Untitled Test";
      const description = testObj.description || "No description";

      const metadata = testObj.metadata || {};

      const duration = metadata.durationMinutes ?? "N/A";
      const availableFrom = metadata.availableFrom
        ? new Date(metadata.availableFrom).toLocaleString()
        : "N/A";
      const availableTo = metadata.availableTo
        ? new Date(metadata.availableTo).toLocaleString()
        : "N/A";
    

      const card = document.createElement("div");
      card.className = "test-card";

      card.innerHTML = `
        <h3>${title}</h3>

        <p><strong>Test ID:</strong> ${testId}</p>
        <p><strong>Description:</strong> ${description}</p>

        <p><strong>Duration:</strong> ${duration} minutes</p>
        <p><strong>Available From:</strong> ${availableFrom}</p>
        <p><strong>Available To:</strong> ${availableTo}</p>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error("[loadAvailableTests] ERROR:", err);
    container.innerHTML =
      `<p style="color:red;">Error loading available tests: ${err.message}</p>`;
  }
}
