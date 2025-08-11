(function () {
  const selectedText = window.getSelection()?.toString();
  if (selectedText) {
    return selectedText;
  }

  const allPTags = document.getElementsByTagName("p");
  let articleText = "";
  for (const pTag of allPTags) {
    articleText += " " + pTag.textContent;
  }
  return articleText;
})();
