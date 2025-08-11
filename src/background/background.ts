import { ModelOption, MODEL_CONFIGS, PROMPT } from "../constants/config.js";
import { ModelConfig } from "../constants/interfaces.js";

async function retrieveText() {
  // Find the active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.id) {
    throw new Error("No active tab found");
  }

  // Call Chrome API to run content script
  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content/contentScript.js"],
  });

  const articleText = results[0].result;
  return articleText;
}

async function getSelectedModel() {
  const model: ModelOption = (await chrome.storage.local.get(["model"])).model;
  const modelConfig = MODEL_CONFIGS[model];
  if (!modelConfig) {
    throw new Error("Invalid model configuration");
  }

  return modelConfig;
}

async function summarize(
  text: string,
  port: chrome.runtime.Port,
  { apiURL, model, apiKey }: ModelConfig
) {
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

  if (!response.ok || !response.body) {
    port.postMessage({
      final: true,
      content: `HTTP error! Status ${response.status}`,
    });
    return null;
  }

  return response.body.getReader();
}

// Send summary to the popup as it's being decoded
async function streamResults(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  port: chrome.runtime.Port
) {
  const decoder = new TextDecoder();

  // Read chunks until complete
  while (true) {
    // Read the next chunk from the stream
    const { value, done } = await reader.read();
    if (done) break;

    // Decode the data as a string
    const chunk = decoder.decode(value, { stream: true });
    console.log("Received chunk:", chunk);

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
      const reader = await summarize(articleText, port, await getSelectedModel());
      if (reader !== null) {
        streamResults(reader, port);
      }
    }
  });
});
