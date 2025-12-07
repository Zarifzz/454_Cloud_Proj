const { ipcRenderer } = require("electron");



// Auto load Tests
window.addEventListener("DOMContentLoaded", () => {
  loadTests();
});


/* -------------------------
   Navigation
-------------------------- */
document.getElementById("backBtn").addEventListener("click", () => {
  ipcRenderer.send("navigate-index");
});

/* -------------------------
   Helper: Read JSON file
-------------------------- */
async function loadJSON(input) {
  const file = input.files[0];
  if (!file) return null;
  return JSON.parse(await file.text());
}

/* -------------------------
   Upload Test
-------------------------- */
document.getElementById("uploadTestBtn").addEventListener("click", async () => {
  const testId = document.getElementById("testIdInput").value;
  const testJson = await loadJSON(document.getElementById("testJsonFile"));
  const answersJson = await loadJSON(document.getElementById("answersJsonFile"));

  const response = await ipcRenderer.invoke("uploadTest", {
    testId,
    testJson,
    answersJson,

  });

  document.getElementById("uploadOutput").innerText =
    JSON.stringify(response, null, 2);
});

/* -------------------------
   Publish Test
-------------------------- */
document.getElementById("publishTestBtn").addEventListener("click", async () => {
  const testId = document.getElementById("publishTestId").value;
  const durationMinutes = Number(document.getElementById("publishDuration").value);

  const availableFrom = new Date(document.getElementById("publishFrom").value).toISOString();
  const availableTo = new Date(document.getElementById("publishTo").value).toISOString();

  console.log(availableFrom, availableTo);

  const metadata = {
    published: true,
    durationMinutes,
    availableFrom,
    availableTo
  };

  const response = await ipcRenderer.invoke("publishTest", { testId, metadata });

  document.getElementById("publishOutput").innerText =
    JSON.stringify(response, null, 2);
});


//Refresh listing tests
document.getElementById("refreshTestsBtn").addEventListener("click", () => {
  loadTests();
});


/* -------------------------
   Submissions for Test
-------------------------- */
document.getElementById("viewSubsBtn").addEventListener("click", async () => {
  const testId = document.getElementById("submissionsTestId").value;

  const result = await ipcRenderer.invoke("getSubmissionsForTest", { testId });

  document.getElementById("subsOutput").innerText =
    JSON.stringify(result, null, 2);
});


//Load Tests and inject DOM
async function loadTests() {
  const container = document.getElementById("testsContainer");
  container.innerHTML = "<p>Loading tests...</p>";

  try {
    
    const response = await ipcRenderer.invoke("listTests");

    if (!response) throw new Error("IPC returned null/undefined");
    if (response.error) throw new Error(response.error);
    if (!Array.isArray(response.tests))
      throw new Error("Response.tests is not an array");

    const tests = response.tests;

    if (tests.length === 0) {
      container.innerHTML = "<p>No tests found.</p>";
      return;
    }

    container.innerHTML = "";

    tests.forEach((testObj, idx) => {
     
      const testId = testObj.testId || "UNKNOWN";
      const title = testObj.title || "Untitled Test";
      const description = testObj.description || "No description";
      const metadata = testObj.metadata;

      const duration = metadata?.durationMinutes ?? "N/A";
      const availableFrom = metadata?.availableFrom
        ? new Date(metadata.availableFrom).toLocaleString()
        : "N/A";
      const availableTo = metadata?.availableTo
        ? new Date(metadata.availableTo).toLocaleString()
        : "N/A";

      const published = metadata?.published === true ? "Yes" : "No";

      const card = document.createElement("div");
      card.className = "test-card";

      card.innerHTML = `
        <h3>${title}</h3>

        <p><strong>Test ID:</strong> ${testId}</p>
        <p><strong>Description:</strong> ${description}</p>

        <p><strong>Published:</strong> ${published}</p>
        <p><strong>Duration:</strong> ${duration} minutes</p>
        <p><strong>Available From:</strong> ${availableFrom}</p>
        <p><strong>Available To:</strong> ${availableTo}</p>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error("[loadTests] ERROR:", err);
    container.innerHTML = `<p style="color:red;">Error loading tests: ${err.message}</p>`;
  }
}
