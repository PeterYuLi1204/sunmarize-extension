(async () => {
  // Send message using Chrome API to trigger background script
  var response = await chrome.runtime.sendMessage({text: "popup"});

  // Turn response into an array of strings
  const summaryPoints = response.result.split('\n');

  console.log(summaryPoints)
  console.log(response.result)

  // Find the unordered list element in HTML and add to it
  const summaryList = document.getElementById("summary")
  for (point of summaryPoints) {
    const listItem = document.createElement('li');
    listItem.textContent = point;
    summaryList.appendChild(listItem);
  }
})()