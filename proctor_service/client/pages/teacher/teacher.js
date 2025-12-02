const { ipcRenderer } = require("electron");

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


/* -------------------------
   List Tests
-------------------------- */
document.getElementById("listTestsBtn").addEventListener("click", async () => {
  const result = await ipcRenderer.invoke("listTests");
  document.getElementById("testsOutput").innerText =
    JSON.stringify(result, null, 2);
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
