import {apiKey} from "/config.js"

// Retrieve all text from article
async function retrieveText() {
  // Find the active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Call Chrome API to run content script
  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["/scripts/contentScript.js"],
  });

  // Return article text
  let articleText = results[0].result;
  return articleText;
} 

// Make API request and return ReadableStream
async function fetchSummaryPoints(text) {
  // Parameters
  const format = "Ignore information about the outlet, author, and unrelated news stories and summarize the article into as few points as possible while remaining accurate and return only the main points without prefixes, first letter capitalized, and with a semicolon character separating each point";
  const apiURL = 'https://api.openai.com/v1/chat/completions';
  const model = "gpt-4o-mini";

  // API call using fetch (OpenAI SDK not accessible in browser)
  const response = await fetch(apiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      "model": model,
      "messages": [{"role": "system", "content": format}, {"role": "user", "content": text}],
      "stream": true
    })
  })
  
  // Check if the API call was successful
  if (!response.ok) {
    port.postMessage({final: true, content: `HTTP error! Status ${response.status}`});
    return null;
  }

  return response.body.getReader();
}

// Send summary to the popup as it's being decoded
async function streamResults(reader, port) {
  const decoder = new TextDecoder();

  // Read chunks until complete
  while (true) {
    // Read the next chunk from the stream
    const { value, done } = await reader.read();
    if (done) break;

    // Decode the data as a string
    const chunk = decoder.decode(value, { stream: true });

    // Split the string into lines and parse as JSON
    for (const line of chunk.split("data: ")) {
      if (line.startsWith("{")) {
        const text = JSON.parse(line)["choices"][0]["delta"]["content"];
        port.postMessage({final: false, content: text});
      }
    }
  }

  // Send a message to close the port
  port.postMessage({final: true});
}

// Handle inital message from popup
chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(async (msg) => {
    if (msg.content === "Sunmarize") {
      const articleText = await retrieveText();
      const reader = await fetchSummaryPoints(articleText, port);
      if (reader !== null) {
        streamResults(reader, port);
      }
    }
  });
})