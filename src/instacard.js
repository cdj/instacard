(function () {
    const resolve = (path, obj) => {
        return path.split('.').reduce(function (prev, curr) {
            return prev ? prev[curr] : undefined
        }, obj || self)
    }

    var injectScriptWaiter = null;

    // images for retweets w/ comments
    const addInstaQuote = (tweet) => {
        const text = tweet.find(".QuoteTweet-text").text();
        if (!text || ((text.indexOf("instagr.am") == -1) && (text.indexOf("instagram.com") == -1)) || tweet.find(".QuoteMedia").length) {
            return;
        }

        const instaUrl = tweet.find('[data-expanded-url]').data('expanded-url');
        if (!instaUrl) {
            return;
        }
        const instaUrlSplit = instaUrl.split('/');
        if(instaUrlSplit.length < 5) {
            return;
        }
        clearTimeout(injectScriptWaiter);
        const instaShort = instaUrlSplit[4] || "";
        const width = Math.floor(tweet.find(".QuoteTweet-text").width());

        fetch("https://api.instagram.com/oembed/?url=http://instagr.am/p/" + instaShort + "/&maxwidth="+width+"&omitscript=true")
            .then(response => {
                if (response.status !== 200) {
                    throw Error(`${response.url} has returned ${response.status} status code.`);
                }
                return response.json()
            })
            .then(data => {
                const html = 
                    '<div class="QuoteMedia instacard-q">' +
                        '<div class="QuoteMedia-container js-quote-media-container">' +
                            '<div class="QuoteMedia-singlePhoto">' +
                                '<div class="QuoteMedia-photoContainer js-quote-photo" data-image-url="'+data.thumbnail_url+'" data-element-context="platform_photo_card" style="background-color:rgba(64,64,64,1.0);" data-dominant-color="[64,64,64]">' +
                                '<img data-aria-label-part="" src="'+data.thumbnail_url+'" alt="'+data.title+'" style="height: 100%;left: 50%;transform: translateX(-50%);">' +
                            '</div>' +
                        '</div>' +
                    '</div>';
                tweet.find(".tweet-content").first().prepend(html);

                clearTimeout(injectScriptWaiter);
                injectScriptWaiter = setTimeout(function() {
                    var script = document.createElement('script');
                    script.type = 'text/javascript';
                    script.src = '//www.instagram.com/embed.js';
                    script.setAttribute("async", "");
                    // script.setAttribute("defer", "");
                    document.head.appendChild(script);
                }, 200);
            })
            .catch(reason => {
                console.log(`An unknown error loading of ${instaUrl}. The reason: ${reason}`);
            });
    };

    const addInsta = (tweet) => {
        if (!tweet.hasClass('instaProcessed')) {
            tweet.addClass('instaProcessed');

            const quote = tweet.find(".QuoteTweet");
            if(quote.length) {
                addInstaQuote(quote);
            }

            const text = tweet.find(".js-tweet-text").text();
            if (!text || ((text.indexOf("instagr.am") == -1) && (text.indexOf("instagram.com") == -1))) {
                return;
            }

            const instaUrl = tweet.find('[data-expanded-url]').data('expanded-url');
            if (!instaUrl) {
                return;
            }
            const instaUrlSplit = instaUrl.split('/');
            if(instaUrlSplit.length < 5) {
                return;
            }
            clearTimeout(injectScriptWaiter);
            const instaShort = instaUrlSplit[4] || "";
            const width = Math.floor(tweet.find(".js-tweet-text-container").width());

            fetch("https://api.instagram.com/oembed/?url=http://instagr.am/p/" + instaShort + "/&maxwidth="+width+"&omitscript=true")
                .then(response => {
                    if (response.status !== 200) {
                        throw Error(`${response.url} has returned ${response.status} status code.`);
                    }
                    return response.json()
                })
                .then(data => {
                    const html = data.html;
                    const injectedCode = $("<div/>").html(html).addClass('instacard');
                    const footer = tweet.find('.js-tweet-text-container').first();
                    footer.after(injectedCode);
                    const refUrl = injectedCode.find("a").attr("href") || ('http://instagr.am/p/' + instaShort + '/');
                    const image = $('<a href="'+refUrl+'" target="_blank"><img src="'+data.thumbnail_url+'" alt="'+data.title+'"></a>');
                    injectedCode.find("[data-instgrm-permalink] > div > div").first()
                        .html(image)
                        .css({"padding": 0, "margin-top": 0});

                    clearTimeout(injectScriptWaiter);
                    injectScriptWaiter = setTimeout(function() {
                        var script = document.createElement('script');
                        script.type = 'text/javascript';
                        script.src = '//www.instagram.com/embed.js';
                        script.setAttribute("async", "");
                        // script.setAttribute("defer", "");
                        document.head.appendChild(script);
                    }, 200);
                })
                .catch(reason => {
                    console.log(`An unknown error loading of ${instaUrl}. The reason: ${reason}`);
                });
        }
    };

    const addInstaNew = (tweet) => {
        if (!tweet.hasClass('instaProcessed')) {
            console.log("run");
            tweet.addClass('instaProcessed');

            const text = tweet.text();
            if (!text || ((text.indexOf("instagr.am") == -1) && (text.indexOf("instagram.com") == -1))) {
                return;
            }

            const instaUrl = tweet.find('a[title*="instagr"]').attr('title');
            if (!instaUrl) {
                return;
            }
            const instaUrlSplit = instaUrl.split('/');
            if(instaUrlSplit.length < 5) {
                return;
            }
            clearTimeout(injectScriptWaiter);
            const instaShort = instaUrlSplit[4] || "";
            const width = Math.floor(tweet.find("[aria-label='Tweet actions']").parent().width());
            console.log("url found", instaUrl, instaShort, width);

            fetch("https://api.instagram.com/oembed/?url=http://instagr.am/p/" + instaShort + "/&maxwidth="+width+"&omitscript=true")
                .then(response => {
                    if (response.status !== 200) {
                        throw Error(`${response.url} has returned ${response.status} status code.`);
                    }
                    return response.json();
                })
                .then(data => {
                    const html = 
                        '<a href="' + instaUrl + '" target="_blank">' +
                            '<img class="instathumb" src="' + data.thumbnail_url + '">' +
                        '</a>' +
                        '<p class="instatext"></p>' +
                        '<div class="insta-author">' +
                            '<a href="https://twitter.com/' + data.author_name + '" target="_blank">@' + data.author_name + '</a>' +
                        '</div>';
                    const injectedCode = $("<div/>").html(html).addClass('instacard');
                    injectedCode.find(".instatext").first().text(data.title);
                    const actions = tweet.find("div[lang]").first();
                    if(actions.length) {
                        actions.append(injectedCode)
                    } else {
                        tweet.find("[aria-label='Tweet actions']").first().before(injectedCode);
                    }
                    tweet.find("div.instacard *").css({"background": "", "background-color": "", "color": "", "border": "", "border-radius": "", "box-shadow": ""})
                    const refUrl = injectedCode.find("a").attr("href") || ('http://instagr.am/p/' + instaShort + '/');
                    const image = $('<a href="'+refUrl+'" target="_blank"><img src="'+data.thumbnail_url+'" alt="'+data.title+'"></a>');
                    injectedCode.find("[data-instgrm-permalink] > div > div").first()
                        .html(image)
                        .css({"padding": 0, "margin-top": 0});
                })
                .catch(reason => {
                    console.log(`An unknown error loading of ${instaUrl}. The reason: ${reason}`);
                });
        }
    };

    // single post
    const permalinkOverlay = $("#permalink-overlay");
        if(permalinkOverlay.length) {
        new MutationObserver(() => {
            if (permalinkOverlay.is(":visible")) {
                permalinkOverlay.find(".permalink .permalink-tweet").each((n, value) => {
                    addInsta($(value));
                });
            }
        }).observe(permalinkOverlay[0], {
            attributes: true,
            subtree: true,
        });
    }

    // tweet stream
    const streamItems = $("#stream-items-id");
    const streamItemsNew = $("#react-root");

    if(streamItems.length) {
        console.log("stream", streamItems);
        new MutationObserver(() => {
            streamItems.children('.js-stream-item:not(.instaProcessed)[data-item-type=tweet]').each((n, value) => {
                addInsta($(value));
            });
        }).observe(streamItems[0], {
            childList: true
        });

        streamItems.children('.js-stream-item:not(.instaProcessed)[data-item-type=tweet]').each((n, value) => {
            addInsta($(value));
        });
    } else if(streamItemsNew.length) {
        console.log("new stream", streamItemsNew);
        new MutationObserver(() => {
            streamItemsNew.find('main section article:not(.instaProcessed)').each((n, value) => {
                console.log("tweet");
                addInstaNew($(value));
            });
        }).observe(streamItemsNew[0], {
            childList: true,
            subtree: true
        });

        streamItemsNew.find('main section article:not(.instaProcessed)').each((n, value) => {
            console.log("tweet");
            addInstaNew($(value));
        });

        const body = $("body");
        new MutationObserver(() => {
            var isDark = body.css("background-color") !== "rgb(255, 255, 255)";
            console.log("is dark", isDark, body.css("background-color"));
            body.toggleClass('instacardDark', isDark);
        })
        .observe(body[0], {
            attributes: true
        });
        body.addClass('instacard-new');
    }
})();
