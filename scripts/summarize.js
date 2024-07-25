// fetch('config.json')
//     .then(response => response.json)
//     .then(config => {
//         const apiKey = config.apiKey;
        
//         const allPTags = document.getElementsByTagName("p");

//         var articleText = "";

//         for (const pTag of allPTags) {
//             articleText += " " + pTag.textContent;
//         }
        
//         console.log(articleText)

//         console.log(apiKey)
//     })
//     .catch(error => console.error('API Key could not be fetched', error))

const configUrl = chrome.runtime.getURL('config.json');

fetch(configUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error("Bad Network Response");
        }
        return response.json();
    })
    .then(config => {
        console.log(config.apiKey)
    })
    .catch(error => {
        console.error('Error fetching config', error)
    })