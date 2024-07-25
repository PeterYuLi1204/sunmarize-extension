function getArticleText() {
    const allPTags = document.getElementsByTagName("p");

    var articleText = "";

    for (const pTag of allPTags) {
        articleText += " " + pTag.textContent;
    }

    return articleText;
}

function summarize() {
    
}

getArticleText();