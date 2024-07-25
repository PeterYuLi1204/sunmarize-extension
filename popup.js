// async function getActiveTab() {
//     const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

//     console.log(tab.id)

//     var results = await chrome.scripting.executeScript({
//         target: { tabId: tab.id },
//         files: ["scripts/summarize.js"],
//     });

//     console.log(results[0].result);
// }

// getActiveTab()

chrome.runtime.sendMessage({text: "popup"})