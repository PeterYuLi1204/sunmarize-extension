import { openaiApiKey, geminiApiKey } from "/config.js";

const PROMPT =
  "Summarize the provided news article by extracting its core factual content into 2 to 8 main points. Prioritize accuracy and relevance to the article's primary topic. Exclude any references to the news outlet, author, or unrelated stories. Format each point as a full sentence separated by semicolons. Example: 'Climate change impacts coastal cities;New policy aims to reduce emissions by 2030;Scientists urge immediate action'";

async function retrieveText() {
  // Find the active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Call Chrome API to run content script
  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["/scripts/contentScript.js"],
  });

  const articleText = results[0].result;
  return articleText;
}

async function getSelectedModel() {
  const model = (await chrome.storage.local.get(["model"])).model;

  if (model === "chatgpt") {
    return {
      apiURL: "https://api.openai.com/v1/chat/completions",
      model: "gpt-4o-mini",
      apiKey: openaiApiKey,
    };
  }

  if (model === "gemini") {
    return {
      apiURL:
        "https://generativelanguage.googleapis.com/v1beta:chatCompletions",
      model: "gemini-2.0-flash-exp",
      apiKey: geminiApiKey,
    };
  }
}

async function summarize(text, { apiURL, model, apiKey }) {
  const response = await fetch(apiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "developer", content: PROMPT },
        { role: "user", content: text },
      ],
      stream: true,
    }),
  });

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

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(async (msg) => {
    if (msg.content === "Sunmarize") {
      const articleText = await retrieveText();
      const reader = await summarize(articleText, await getSelectedModel());
      if (reader !== null) {
        streamResults(reader, port);
      }
    }
  });
});
