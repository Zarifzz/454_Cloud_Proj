const { ipcRenderer } = require("electron");

let currentTestId = null;
let testData = null;

/* -------------------------
   RECEIVE testId ON LOAD
-------------------------- */
ipcRenderer.on("load-test", async (event, testId) => {
  await loadTest(testId);
});

/* -------------------------
   BACK NAVIGATION
-------------------------- */
document.getElementById("backBtn").addEventListener("click", () => {
  ipcRenderer.send("navigate-student");
});

/* -------------------------
   LOAD TEST FROM LAMBDA
-------------------------- */
async function loadTest(testId) {
  try {
    const r = await ipcRenderer.invoke("takeTest", { testId });

    if (r.error) {
      document.getElementById("testTitle").innerText = "Error loading test";
      document.getElementById("testForm").innerHTML = "";
      document.getElementById("submitOutput").innerText = r.error;
      return;
    }

    // Normalize structure: r.test contains the actual test
    testData = r.test;
    currentTestId = r.testId;

    document.getElementById("testTitle").innerText = testData.title || "Test";

    const form = document.getElementById("testForm");
    form.innerHTML = "";

    for (const q of testData.questions) {
      const div = document.createElement("div");
      div.innerHTML = `
        <p><strong>${q.question}</strong></p>
        ${q.choices
          .map(
            (choice) =>
              `<label><input type="radio" name="${q.id}" value="${choice}"> ${choice}</label><br>`
          )
          .join("")}
        <br>
      `;
      form.appendChild(div);
    }
  } catch (err) {
    console.error("loadTest error:", err);
    document.getElementById("testTitle").innerText = "Failed to load test";
    document.getElementById("submitOutput").innerText = err.message;
  }
}

/* -------------------------
   SUBMIT TEST
-------------------------- */
document.getElementById("submitBtn").addEventListener("click", async () => {
  if (!testData || !currentTestId) {
    document.getElementById("submitOutput").innerText = "No test loaded";
    return;
  }

  const form = document.getElementById("testForm");
  const formData = new FormData(form);

  const answers = {};
  for (const q of testData.questions) {
    answers[q.id] = formData.get(q.id) || null; // handle unanswered questions
  }

  try {
    const response = await ipcRenderer.invoke("submitTest", {
      testId: currentTestId,
      answers
    });

    document.getElementById("submitOutput").innerText =
      JSON.stringify(response, null, 2);
  } catch (err) {
    console.error("submitTest error:", err);
    document.getElementById("submitOutput").innerText = err.message;
  }
});
