chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.contentScriptQuery === "getEmbed") {
            fetch('https://api.instagram.com/oembed/?url=http://instagr.am/p/'+request.instaId+'/&maxwidth='+request.width+'&omitscript=true')
                .then(response => response.json())
                .then(data => sendResponse(data))
                .catch(error => console.warn(error));
            return true;  // Will respond asynchronously.
        }
    }
);
