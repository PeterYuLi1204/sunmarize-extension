const allPTags = document.getElementsByTagName("p");

console.log(allPTags)

for (const pTag of allPTags) {
    console.log(pTag.textContent)
}