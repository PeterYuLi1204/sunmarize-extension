import { openaiApiKey, geminiApiKey } from "/config.js";

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
  const articleText = results[0].result;
  return articleText;
}

// Make API request and return ReadableStream
async function openaiSummarize(text) {
  // Parameters
  const instructions =
    "Summarize the provided news article by extracting its core factual content into 2-5 main points. Prioritize accuracy and relevance to the article's primary topic. Exclude any references to the news outlet, author, or unrelated stories. Format each point as follows: Start with a capital letter, use plain text (no markdown), omit ending punctuation, and separate points with semicolons. Example: 'Climate change impacts coastal cities;New policy aims to reduce emissions by 2030;Scientists urge immediate action'.";
  const apiURL = "https://api.openai.com/v1/chat/completions";
  const model = "gpt-4o-mini";

  // API call using fetch (OpenAI SDK not accessible in browser)
  const response = await fetch(apiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "developer", content: instructions },
        { role: "user", content: text },
      ],
      stream: true,
    }),
  });

  // Check if the API call was successful
  if (!response.ok) {
    port.postMessage({
      final: true,
      content: `HTTP error! Status ${response.status}`,
    });
    return null;
  }

  return response.body.getReader();
}

async function geminiSummarize(text) {
  const instructions =
    "Summarize the provided news article by extracting its core factual content into 2-5 main points. Prioritize accuracy and relevance to the article's primary topic. Exclude any references to the news outlet, author, or unrelated stories. Format each point as follows: Start with a capital letter, use plain text (no markdown), omit ending punctuation, and separate points with semicolons. Example: 'Climate change impacts coastal cities;New policy aims to reduce emissions by 2030;Scientists urge immediate action'.";
  const apiURL =
    "https://generativelanguage.googleapis.com/v1beta:chatCompletions";
  const model = "gemini-2.0-flash-exp";

  const response = await fetch(apiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${geminiApiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "developer", content: instructions },
        { role: "user", content: text },
      ],
      stream: true,
    }),
  });

  // Check if the API call was successful
  if (!response.ok) {
    port.postMessage({
      final: true,
      content: `HTTP error! Status ${response.status}`,
    });
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
        port.postMessage({ final: false, content: text });
      }
    }
  }

  // Send a message to close the port
  port.postMessage({ final: true });
}

// Handle inital message from popup
chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(async (msg) => {
    if (msg.content === "Sunmarize") {
      const articleText = await retrieveText();
      const reader = await openaiSummarize(articleText);
      // const reader = await geminiSummarize(articleText);
      if (reader !== null) {
        streamResults(reader, port);
      }
    }
  });
});
