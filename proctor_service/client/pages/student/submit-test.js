const { ipcRenderer } = require("electron");

let currentTestId = null;
let testData = null;
let timerInterval = null;
let timeLeft = 0; // in seconds

window.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("enter-proctor-mode");
});

/* -------------------------
   RECEIVE testId ON LOAD
-------------------------- */
ipcRenderer.on("load-test", async (event, testId) => {
  await loadTest(testId);
});

/* -------------------------
   LOAD TEST FROM LAMBDA
-------------------------- */
async function loadTest(testId) {
  const titleEl = document.getElementById("testTitle");
  const errorBox = document.getElementById("errorBox");
  const form = document.getElementById("testForm");
  const submitOutput = document.getElementById("submitOutput");

  try {
    const r = await ipcRenderer.invoke("takeTest", { testId });

    /* ---- HANDLE LAMBDA ERROR ---- */
    if (r.error) {
      stopTimer();
      errorBox.classList.remove("hidden");
      errorBox.innerText = r.error;
      titleEl.innerText = "";
      form.innerHTML = "";
      submitOutput.innerText = "";
      return;
    }

    /* ---- CLEAR ERRORS ---- */
    errorBox.classList.add("hidden");
    errorBox.innerText = "";

    testData = r.test;
    currentTestId = r.testId;

    titleEl.innerText = testData.title || "Test";

    /* ---- RENDER QUESTIONS ---- */
    form.innerHTML = "";
    for (const q of testData.questions) {
      const div = document.createElement("div");
      div.innerHTML = `
        <p class="font-semibold mb-1">${q.question}</p>
        ${q.choices
          .map(
            (choice) => `
              <label class="block mb-1">
                <input type="radio" name="${q.id}" value="${choice}">
                ${choice}
              </label>`
          )
          .join("")}
      `;
      form.appendChild(div);
    }

    /* ---- START TIMER AFTER TEST LOADS ---- */
    if (r.metadata && r.metadata.durationMinutes) {
      startTimer(r.metadata.durationMinutes * 60); // convert minutes to seconds
    }

  } catch (err) {
    stopTimer();
    errorBox.classList.remove("hidden");
    errorBox.innerText = err.message || "Unknown error.";
    form.innerHTML = "";
  }
}

/* -------------------------
   SUBMIT TEST
-------------------------- */
async function submitTest() {
  const output = document.getElementById("submitOutput");

  if (!testData || !currentTestId) {
    output.innerText = "No test loaded.";
    exitAfterSubmit();
    return;
  }

  const form = document.getElementById("testForm");
  const formData = new FormData(form);

  const answers = {};
  for (const q of testData.questions) {
    answers[q.id] = formData.get(q.id) || null;
  }

  stopTimer();

  try {
    const response = await ipcRenderer.invoke("submitTest", {
      testId: currentTestId,
      answers
    });

    output.innerText = response.message;
  } catch (err) {
    output.innerText = err.message;
  } finally {
    // After submission, exit proctor mode and navigate back
    exitAfterSubmit();
  }
}

document.getElementById("submitBtn").addEventListener("click", submitTest);

/* -------------------------
   EXIT PROCTOR MODE + NAVIGATE
-------------------------- */
function exitAfterSubmit() {
  ipcRenderer.send("exit-proctor-mode");
  ipcRenderer.send("navigate-student");
}

/* -------------------------
   TIMER FUNCTIONS
-------------------------- */
function startTimer(seconds) {
  stopTimer(); // clear any existing timer
  timeLeft = seconds;

  const timerDisplay = document.getElementById("timerDisplay");

  timerInterval = setInterval(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;

    timerDisplay.innerText = `Time Remaining: ${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerDisplay.innerText = "Time is up! Submitting test...";
      submitTest(); // auto-submit and exit
    }

    timeLeft--;
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}
