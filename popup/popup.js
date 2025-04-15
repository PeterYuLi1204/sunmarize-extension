const summaryList = document.getElementById("summary");
const modelSelection = document.getElementById("model-selection");

// Find the stored model selection or set default value
let model = (await chrome.storage.local.get(["model"])).model;
if (!model) {
  await chrome.storage.local.set({ model: "chatgpt" });
  model = "chatgpt";
}
document.getElementById(model).checked = true;

// Add a handler for model radio buttons to store selected option
modelSelection.addEventListener("change", async (event) => {
  await chrome.storage.local.set({ model: event.target.value });
});

// Create a long-lived connection and initialize the summarization
const port = chrome.runtime.connect({ name: "popup" });
port.postMessage({ content: "Sunmarize" });

// Handle received messages
port.onMessage.addListener((msg) => {
  if (msg.final === true) {
    port.disconnect();
  } else if (msg.content !== undefined) {
    displaySummary(msg.content);
  }
});

let currentPoint;

// Create a new point if it's a delimiter
// Otherwise append text to the current point
function displaySummary(text) {
  if (!currentPoint) {
    currentPoint = document.createElement("li");
    summaryList.appendChild(currentPoint);
  }

  for (const c of text) {
    if (c === ";") {
      currentPoint = document.createElement("li");
      summaryList.appendChild(currentPoint);
    } else {
      currentPoint.textContent +=
        currentPoint.textContent.trim() === "" ? c.toUpperCase() : c;
    }
  }
}
