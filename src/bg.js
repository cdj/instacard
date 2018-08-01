chrome.webRequest.onHeadersReceived.addListener(
    details => {
        let idCSPHeader = details.responseHeaders.findIndex(header => /content-security-policy/i.test(header.name));
        if(-1 != idCSPHeader) {
            details.responseHeaders[idCSPHeader].value = details.responseHeaders[idCSPHeader].value.replace(
                "img-src", "img-src https://*.cdninstagram.com http://*.instagram.com http://instagram.com");
            details.responseHeaders[idCSPHeader].value = details.responseHeaders[idCSPHeader].value.replace(
                "media-src", "media-src https://*.cdninstagram.com http://*.instagram.com http://instagram.com");
            details.responseHeaders[idCSPHeader].value = details.responseHeaders[idCSPHeader].value.replace(
                "connect-src", "connect-src https://*.instagram.com https://instagram.com http://*.instagram.com http://instagram.com");
            details.responseHeaders[idCSPHeader].value = details.responseHeaders[idCSPHeader].value.replace(
                "script-src", "script-src https://*.instagram.com https://www.instagram.com  https://instagram.com http://*.instagram.com http://instagram.com");
                // https://www.instagram.com/static/bundles/base/EmbedSDK.js/cc9f6203a0cc.js
            details.responseHeaders[idCSPHeader].value = details.responseHeaders[idCSPHeader].value.replace(
                "frame-src", "frame-src https://*.instagram.com https://instagram.com http://*.instagram.com http://instagram.com");
            details.responseHeaders[idCSPHeader].value = details.responseHeaders[idCSPHeader].value.replace(
                "frame-ancestors", "frame-ancestors https://*.instagram.com https://instagram.com http://*.instagram.com http://instagram.com http://*.twitter.com http://twitter.com https://*.twitter.com https://twitter.com");
            // details.responseHeaders[idCSPHeader].value = details.responseHeaders[idCSPHeader].value.replace(
            //     "twitter:", "twitter: https://*.instagram.com https://instagram.com http://*.instagram.com http://instagram.com");
        }
        for(var i = details.responseHeaders.length-1; i >= 0; --i) {
            var header = details.responseHeaders[i].name.toLowerCase();
            if(details.responseHeaders[i].name.toLowerCase().indexOf('frame-options') >= 0) {
                details.responseHeaders.splice(i, 1); // Remove header
                break;
            }
        }
        return {
            responseHeaders: details.responseHeaders,
        };
    },
    {
        urls: ["*://twitter.com/*", "*://instagram.com/*", "*://*.instagram.com/*"],
        types: ["main_frame", "sub_frame"],
    },
    [
        "blocking",
        "responseHeaders",
    ]
);
