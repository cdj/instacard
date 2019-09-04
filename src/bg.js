chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.contentScriptQuery === "getEmbed") {
            // fetch('https://api.instagram.com/oembed/?url=http://instagr.am/p/'+request.instaId+'/&maxwidth='+request.width+'&omitscript=true')
            fetch('https://www.instagram.com/p/' + request.instaId + '/')
                .then(response => {
                    if(response.ok) {
                        return response.text();
                    } else {
                        sendResponse({
                            error: {
                                code: response.status,
                                text: response.statusText || `HTTP Error ${response.status}`
                            }
                        });
                        throw new Error(`HTTP Error ${response.status}`);
                    }
                })
                .then(data => {
                    let found = data.match(/<script type="text\/javascript">window._sharedData = (.*);<\/script>/);
                    if(found && found[1]) {
                        const json = JSON.parse(found[1]);
                        // console.log(json);
                        sendResponse(json.entry_data);
                    }
                })
                .catch(error => {
                    console.warn(error);
                });
            return true;  // Will respond asynchronously.
        }
    }
);

chrome.webRequest.onHeadersReceived.addListener(function(details) {
    // console.log(details);
    let isCSPHeader = false;
    for (var i = 0; details.responseHeaders && i < details.responseHeaders.length; i++) {
        isCSPHeader = /content-security-policy/i.test(details.responseHeaders[i].name);
        if (isCSPHeader) {
            var csp = details.responseHeaders[i].value;
            // img-src 'self' blob: data: https://*.cdn.twitter.com https://ton.twitter.com https://*.twimg.com https://www.google-analytics.com https://www.periscope.tv https://www.pscp.tv https://media.riffsy.com https://*.giphy.com https://*.pscp.tv"
            // img-src https: data: blob:; font-src https: data:;
            csp = csp.replace(/img-src [^;]+;/gi, `img-src 'self' https: data: blob:;`);
            // media-src 'self' blob: https://twitter.com https://*.twimg.com https://*.vine.co https://*.pscp.tv https://*.video.pscp.tv https://*.giphy.com https://media.riffsy.com https://mdhdsnappytv-vh.akamaihd.net https://mpdhdsnappytv-vh.akamaihd.net https://mmdhdsnappytv-vh.akamaihd.net https://smdhdsnappytv-vh.akamaihd.net https://smpdhdsnappytv-vh.akamaihd.net https://smmdhdsnappytv-vh.akamaihd.net https://rmdhdsnappytv-vh.akamaihd.net https://rmpdhdsnappytv-vh.akamaihd.net https://rmmdhdsnappytv-vh.akamaihd.net https://dwo3ckksxlb0v.cloudfront.net
            // media-src 'self' blob: https://www.instagram.com https://*.cdninstagram.com https://*.fbcdn.net;
            csp = csp.replace('media-src', 'media-src https://www.instagram.com https://*.cdninstagram.com https://*.fbcdn.net');
            details.responseHeaders[i].value = csp;
            break;
        }
    }

    return {
        responseHeaders: details.responseHeaders
    };
}, {
    urls: [
        'http://*/*',
        'https://*/*'
    ]
}, ['blocking', 'responseHeaders']);