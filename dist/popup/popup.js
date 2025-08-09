"use strict";
const summaryList = document.getElementById("summary");
const modelSelection = document.getElementById("model-selection");
let model = (await chrome.storage.local.get(["model"])).model;
if (!model) {
    await chrome.storage.local.set({ model: "chatgpt" });
    model = "chatgpt";
}
document.getElementById(model).checked = true;
modelSelection.addEventListener("change", async (event) => {
    await chrome.storage.local.set({ model: event.target.value });
    summaryList.innerHTML = "";
    runSummary();
});
function displaySummary(text) {
    let currentPoint = summaryList.lastElementChild || createNewPoint();
    for (const c of text) {
        if (c === ";") {
            currentPoint = createNewPoint();
        }
        else {
            currentPoint.textContent +=
                currentPoint.textContent.trim() === "" ? c.toUpperCase() : c;
        }
    }
}
function createNewPoint() {
    const newPoint = document.createElement("li");
    summaryList.appendChild(newPoint);
    return newPoint;
}
// Create a long-lived connection and initialize the summarization
function runSummary() {
    const port = chrome.runtime.connect({ name: "popup" });
    port.postMessage({ content: "Sunmarize" });
    // Handle received messages
    port.onMessage.addListener((msg) => {
        if (msg.final === true) {
            port.disconnect();
        }
        else if (msg.content !== undefined) {
            displaySummary(msg.content);
        }
    });
}
runSummary();
