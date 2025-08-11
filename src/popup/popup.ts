import { ModelOption } from "../constants/config.js";

const summaryList = document.getElementById("summary");
const modelSelection = document.getElementById("model-selection");
if (!summaryList || !modelSelection) {
  throw new Error("Failed to find summary or model selection elements");
}

let model: ModelOption = (await chrome.storage.local.get(["model"])).model;
if (!model) {
  await chrome.storage.local.set({ model: ModelOption.OPENAI });
  model = ModelOption.OPENAI;
}

const modelElement = document.getElementById(model) as HTMLInputElement;
if (modelElement) {
  modelElement.checked = true;
}

modelSelection.addEventListener("change", async (event) => {
  const value = ((event.target as HTMLInputElement)?.value) as ModelOption;
  await chrome.storage.local.set({ model: value });
  summaryList.innerHTML = "";
  runSummary();
});

function displaySummary(text: string) {
  summaryList!.textContent += text;
  // let currentPoint = summaryList!.lastElementChild || createNewPoint();

  // for (const c of text) {
  //   if (c === ";") {
  //     currentPoint = createNewPoint();
  //   } else {
  //     currentPoint.textContent +=
  //       currentPoint.textContent.trim() === "" ? c.toUpperCase() : c;
  //   }
  // }
}

// function createNewPoint() {
//   const newPoint = document.createElement("li");
//   summaryList!.appendChild(newPoint);
//   return newPoint;
// }

// Create a long-lived connection and initialize the summarization
function runSummary() {
  const port = chrome.runtime.connect(undefined, { name: "popup" });
  port.postMessage({ content: "Sunmarize" });

  // Handle received messages
  port.onMessage.addListener((msg) => {
    if (msg.final === true) {
      port.disconnect();
    } else if (msg.content !== undefined) {
      displaySummary(msg.content);
    }
  });
}

runSummary();
