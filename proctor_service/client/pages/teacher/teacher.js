const { ipcRenderer } = require("electron");



// Auto load Tests
window.addEventListener("DOMContentLoaded", () => {
  loadTests();
});



document.getElementById("backBtn").addEventListener("click", () => {
  ipcRenderer.send("navigate-index");
});


async function loadJSON(input) {

  const file = input.files[0];
  if (!file) return null;
  return JSON.parse(await file.text());

}



document.getElementById("uploadTestBtn").addEventListener("click", async () => {

  const output = document.getElementById("uploadOutput");
  const testId = document.getElementById("testIdInput").value;
  const testJson = await loadJSON(document.getElementById("testJsonFile"));
  const answersJson = await loadJSON(document.getElementById("answersJsonFile"));


  try {

    const response = await ipcRenderer.invoke("uploadTest", {
      testId,
      testJson,
      answersJson,
    });


    if (response.error) {
      output.innerText = `Error: ${response.error}`;

    } else {
      output.innerHTML = `
        ${response.message} <br>
        <strong>Test ID:</strong> ${response.testId}
      `;

    }
  } catch (err) {
    
    output.innerText = `Exception: ${err.message}`;
  }

});






document.getElementById("publishTestBtn").addEventListener("click", async () => {

  const output = document.getElementById("publishOutput");
  const testId = document.getElementById("publishTestId").value;
  const durationMinutes = Number(document.getElementById("publishDuration").value);

  const availableFrom = new Date(document.getElementById("publishFrom").value).toISOString();
  const availableTo = new Date(document.getElementById("publishTo").value).toISOString();

  const metadata = {
    published: true,
    durationMinutes,
    availableFrom,
    availableTo
  };

  try {
    const response = await ipcRenderer.invoke("publishTest", {
      testId, metadata 
    });

    if (response.error) {
      output.innerText = `Error: ${response.error}`;

    } else {

      output.innerHTML = `
        ${response.message} <br>
        <strong>Test ID:</strong> ${response.testId} 
      `;
    }
  } catch (err) {

    console.error("ERROR:", err);
    output.innerText = `Exception: ${err.message}`;
  }

});



//Refresh listing tests

document.getElementById("refreshTestsBtn").addEventListener("click", () => {
  loadTests();
});



document.getElementById("viewSubsBtn").addEventListener("click", async () => {

  const testId = document.getElementById("submissionsTestId").value;
  const output = document.getElementById("subsOutput");

  output.innerHTML = `<p>Loading...</p>`;

  const result = await ipcRenderer.invoke("getSubmissionsForTest", { testId });


  if (!result || result.error) {
    output.innerHTML = `<p class="text-red-600">Error loading submissions.</p>`;
    return;
  }

  const { submissions } = result;

  if (!submissions || submissions.length === 0) {
    output.innerHTML = `
      <div class="p-4 bg-gray-50 border rounded-lg text-gray-700">
        No submissions found for this test.
      </div>
    `;
    return;
  }


  // Build UI
  let html = `
    <div class="bg-white shadow rounded-xl p-4 space-y-4 border">

      <h3 class="text-lg font-semibold">Submissions for Test: 
        <span class="text-blue-600">${result.testId}</span>
      </h3>

      <p class="text-gray-700">
        <strong>Total Submissions:</strong> ${result.count}
      </p>

      <div class="space-y-3">
  `;


  // For each submission
  submissions.forEach((sub, index) => {
    const answersHtml = Object.entries(sub.answers).map(([q, a]) => `<li><strong>${q}:</strong> ${a}</li>`).join("");

    html += `
      <details class="border rounded-lg p-3 bg-gray-50">
        <summary class="cursor-pointer font-medium text-blue-700">
          Student ID: ${sub.studentId}
        </summary>

        <div class="mt-3 space-y-2 ml-3">
          <p><strong>Submitted At:</strong> ${new Date(sub.submittedAt).toLocaleString()}</p>

          <p><strong>Answers:</strong></p>
          <ul class="list-disc ml-6 text-gray-800">
            ${answersHtml}
          </ul>
        </div>
      </details>
    `;

  });


  html += `
      </div>
    </div>
  `;

  output.innerHTML = html;
});



//Load Tests and inject DOM
async function loadTests() {
  const container = document.getElementById("testsContainer");
  container.innerHTML = "<p>Loading tests...</p>";

  try {

    const response = await ipcRenderer.invoke("listTests");

    if (!response) throw new Error("IPC returned null");
    if (response.error) throw new Error(response.error);
    if (!Array.isArray(response.tests))
      throw new Error("Response.tests");


    const tests = response.tests;


    if (tests.length === 0) {
      container.innerHTML = "<p>No tests found.</p>";
      return;
    }


    container.innerHTML = "";

    tests.forEach((testObj, idx) => {
     
      const testId = testObj.testId || "UNKNOWN";
      const title = testObj.title || "Untitled";
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
      card.className = "border rounded-lg p-4 bg-gray-50 shadow-sm";

      // Build card
      card.innerHTML = `
        
        <h3 class="text-lg font-semibold">${title}</h3>

        
        <p class="text-gray-700 mt-1 mb-3">${description}</p>

        <div class="grid grid-cols-2 gap-4">

          <div class="space-y-1">
            <p><strong>Test ID:</strong> ${testId}</p>
            <p><strong>Published:</strong> ${published}</p>
          </div>

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
    console.error("error:", err);
    container.innerHTML = `<p style="color:red;">Error loading tests: ${err.message}</p>`;
    
  }
}