// Create a long-lived connection and initialize the summarization
const port = chrome.runtime.connect({name: "popup"});
port.postMessage({content: "Sunmarize"});

// Handle received messages
port.onMessage.addListener((msg) => {
  if (msg.final === true) {
    port.disconnect();
  } else if (msg.content !== undefined) {
    displaySummary(msg.content);
  } 
});

const summaryList = document.getElementById("summary");
let currentPoint;

// Create a new point if it's a delimiter
// Otherwise append text to the current point
function displaySummary(text) {
  if (!currentPoint) {
    currentPoint = document.createElement('li');
    summaryList.appendChild(currentPoint);
  }

  for (const c of text) {
    if (c === ";") {
      currentPoint = document.createElement('li');
      summaryList.appendChild(currentPoint);
    } else {
      currentPoint.textContent += currentPoint.textContent.trim() === "" ? c.toUpperCase() : c;
    }
  }
}