(async () => {
  // Send message using Chrome API to trigger background script
  var response = await chrome.runtime.sendMessage({text: "popup"});

  // Change text in popup HTML
  document.getElementById("summary").innerText = response.result;
})()