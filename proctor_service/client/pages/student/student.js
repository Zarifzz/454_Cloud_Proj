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
  const container = document.getElementById("statusOutput");
  container.innerHTML = ""; // clear old

  const data = await ipcRenderer.invoke("getSubmissionStatus", { testId });

  if (!data || !data.studentId) {
    container.innerHTML = `
      <div class="bg-red-100 text-red-700 p-4 rounded-lg">
        No submission found for this test.
      </div>`;
    return;
  }

  const formattedDate = new Date(data.submittedAt).toLocaleString();

  container.innerHTML = `
    <div class="bg-gray-50 border rounded-xl p-4 shadow-sm">
      <h3 class="text-lg font-semibold mb-2">Submission Details</h3>

      <p><span class="font-medium">Student ID:</span> ${data.studentId}</p>
      <p><span class="font-medium">Submitted At:</span> ${formattedDate}</p>
      <p><span class="font-medium">Score:</span> ${data.score ?? "Not graded"}</p>

      <button 
        class="mt-3 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg"
        onclick="toggleStudentAnswers()"
      >
        Show Answers
      </button>

      <div id="studentAnswersPanel" class="hidden mt-3 p-3 bg-white border rounded-lg">
        ${Object.entries(data.answers)
          .map(
            ([q, a]) => `
              <p class="mb-1"><span class="font-medium">${q}:</span> ${a}</p>
            `
          )
          .join("")}
      </div>
    </div>
  `;
});

function toggleStudentAnswers() {
  const panel = document.getElementById("studentAnswersPanel");
  panel.classList.toggle("hidden");
}



async function loadAvailableTests() {
  const container = document.getElementById("availableTestsContainer");
  container.innerHTML = "<p>Loading tests...</p>";

  try {
    const response = await ipcRenderer.invoke("listAvailableTests");

    if (!response) throw new Error("IPC returned null/undefined");
    if (response.error) throw new Error(response.error);

    const tests = response.tests;
    if (!Array.isArray(tests)) throw new Error("Response.tests is not an array");

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
      const published = metadata.published ? "Yes" : "No";

      const card = document.createElement("div");
      card.className = "border rounded-lg p-4 bg-gray-50 shadow-sm";

      card.innerHTML = `
        <!-- Title -->
        <h3 class="text-lg font-semibold">${title}</h3>

        <!-- Description below title -->
        <p class="text-gray-700 mt-1 mb-3">${description}</p>

        <!-- Two-column layout -->
        <div class="grid grid-cols-2 gap-4">

          <!-- LEFT -->
          <div class="space-y-1">
            <p><strong>Test ID:</strong> ${testId}</p>
            <p><strong>Published:</strong> ${published}</p>
          </div>

          <!-- RIGHT -->
          <div class="space-y-1">
            <p><strong>Duration:</strong> ${duration} minutes</p>
            <p><strong>Available From:</strong> ${availableFrom}</p>
            <p><strong>Available To:</strong> ${availableTo}</p>
          </div>

        </div>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error("[loadAvailableTests] ERROR:", err);
    container.innerHTML =
      `<p style="color:red;">Error loading available tests: ${err.message}</p>`;
  }
}
