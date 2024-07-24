const allPTags = document.getElementsByTagName("p");

var articleText = "";

for (const pTag of allPTags) {
    articleText += pTag.textContent;
}

console.log(articleText);