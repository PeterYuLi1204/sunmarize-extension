chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.text === "popup") {
    (async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["contentScript.js"],
      });

      console.log(results[0].result);
    })();

    return true;
  }
});