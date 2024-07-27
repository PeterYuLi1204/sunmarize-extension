import {apiKey} from "/config.js"

async function summarizeText(text) {
  // Variables
  const format = "Ignore information about the outlet, author, and unrelated news stories and summarize the article into as few points as possible while remaining accurate and return only the main points without prefixes and with a semicolon character separating each one";
  const apiURL = 'https://api.openai.com/v1/chat/completions';
  const model = "gpt-4o-mini"
  const max_tokens = 2000

  // RESTful API call
  const response = await fetch(apiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      "model": model,
      "messages": [{"role": "system", "content": format}, {"role": "user", "content": text}],
      "max_tokens": max_tokens
    })
  })
  
  // Check if call was okay
  if (!response.ok) {
    throw new Error(`HTTP error! status ${response.status}`);
  }

  // Isolate model's response
  const result = await response.json();
  const summary = result.choices[0]["message"]["content"];

  return summary;
}

const handleSummarize = async (sendResponse) => {
  // Find the active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Call Chrome API to run content script
  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["/scripts/contentScript.js"],
  });

  // Feed article text into summarize
  var articleText = results[0].result;
  const summary = await summarizeText(articleText)

  // Send response back to popup script
  sendResponse({result: summary});
} 

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  // Check if message came from popup and send response asynchronously
  if (message.text === "popup") {
    handleSummarize(sendResponse)
  }

  // Return true immediately to signal that there will be a response
  return true;
});