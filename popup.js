(async () => {
  var response = await chrome.runtime.sendMessage({text: "popup"});

  document.getElementById("summary").innerText = response.result;
})()