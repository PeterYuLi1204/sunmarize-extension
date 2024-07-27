import {apiKey} from "/config.js"

async function summarizeText(text) {
  const prompt = `Summarize the following article while ignoring information about the outlet and author and return only a list of the main points:${text}`;
  const apiURL = 'https://api.openai.com/v1/chat/completions';
  const model = "gpt-4o-mini"
  const max_tokens = 2000

  const response = await fetch(apiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      "model": model,
      "messages": [{"role": "user", "content": prompt}],
      "max_tokens": max_tokens
    })
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status ${response.status}`);
  }

  const result = await response.json();
  
  const summary = result.choices[0]["message"]["content"];

  return summary;
}

const handleSummarize = async (sendResponse) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["/scripts/contentScript.js"],
    });

    var articleText = results[0].result;

    const summary = await summarizeText(articleText)

    sendResponse({result: summary});
} 

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.text === "popup") {
    handleSummarize(sendResponse)
  }

  return true;
});