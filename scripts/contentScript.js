(function () {
    // Find all p tags from active tab (similar to Chrome's reading mode)
    const allPTags = document.getElementsByTagName("p");

    let articleText = "";

    // Combine all article text together
    for (const pTag of allPTags) {
        articleText += " " + pTag.textContent;
    }

    return articleText;
})();