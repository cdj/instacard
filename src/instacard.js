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
            let instaShort = '';
            for(let s = 0; s < instaUrlSplit.length; s++) {
                if(instaUrlSplit[s] === 'p' && (s + 1) < instaUrlSplit.length) {
                    instaShort = instaUrlSplit[s + 1];
                    break;
                }
                instaShort = instaUrlSplit[s]
            }
            if(!instaShort) {
                return;
            }
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
            tweet.addClass('instaProcessed');

            const text = tweet.text();
            const instaUrl = tweet.find('a[title*="instagr"]').attr('title');
            if (!text || ((text.indexOf("instagr.am") == -1) && (text.indexOf("instagram.com") == -1)) || !instaUrl || instaUrl.length === 0) {
                return;
            }
            $(tweet).parent().parents("div:not([class]),div.instaProcessed").first().addClass('has-instagram');

            const instaUrlSplit = instaUrl.split('/');
            if(instaUrlSplit.length < 6) {
                return;
            }
            clearTimeout(injectScriptWaiter);
            let instaShort = '';
            for(let s = 0; s < instaUrlSplit.length; s++) {
                if(instaUrlSplit[s] === 'p' && (s + 1) < instaUrlSplit.length) {
                    instaShort = instaUrlSplit[s + 1];
                    break;
                }
                instaShort = instaUrlSplit[s]
            }
            if(!instaShort) {
                return;
            }
            let par = tweet;
            if(par.children().length === 1) {
                par = par.children().first();
                if(par.children().length >= 2) {
                    par = par.children().eq(1);
                }
            }
            const width = Math.floor(par.width());

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
                    let insertAfter = par.children();
                    insertAfter = insertAfter.not('[aria-label*="Retweets"],[aria-label*="likes"]');
                    insertAfter.each((n, value) => {
                        if($(value).find('a[href^="https://help.twitter.com/using-twitter/how-to-tweet"]').length) {
                            insertAfter = insertAfter.not($(value).nextAll()).not(value);
                        }
                    });
                    insertAfter.last().after(injectedCode);
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
        let trending;// = streamItemsNew.find('div[aria-label="Timeline\: Trending now"]');
        let timeline;// = streamItemsNew.find('div[aria-label^="Timeline\: "]').not(trending);
        let whoToFollow;// = streamItemsNew.find('aside[aria-label="Who to follow"]');
        // if(trending.length) {
        //     console.log("[instacard] trending", trending);
        // }
        // if(timeline.length) {
        //     console.log("[instacard] timeline", timeline);
        // }
        // if(whoToFollow) {
        //     console.log("[instacard] whoToFollow", whoToFollow);
        // }
        new MutationObserver(() => {
            // if(!trending.length) {
                trending = streamItemsNew.find('div[aria-label="Timeline\: Trending now"]');
            //     if(trending.length) {
            //         console.log("[instacard] trending", trending);
            //     }
            // }
            // if(!timeline.length) {
                timeline = streamItemsNew.find('div[aria-label^="Timeline\: "]').not(trending);
            //     if(timeline.length) {
            //         console.log("[instacard] timeline", timeline);
            //     }
            // }
            // if(!whoToFollow) {
                let whoToFollow = streamItemsNew.find('aside[aria-label="Who to follow"]');
            //     if(whoToFollow) {
            //         console.log("[instacard] whoToFollow", whoToFollow);
            //     }
            // }
            if(timeline.length) {
                timeline.children().addClass("instacard-top");
                timeline.find('.instacard-top div:not([class]) > div[class] h2[aria-level="2"][role="heading"]:not(.instaAdProcessed)').each((n, value) => {
                    if($(value).text() === "Promoted Tweet") {
                        $(value).parents("div:not([class]),div.instaAdProcessed").first().addClass('instacard-ad instaProcessed instaAdProcessed');
                        // console.warn("[instacard] 'Promoted Tweet' ad found", value, value2, par);
                    }
                    $(value).addClass("instaAdProcessed");
                });
                timeline.find(
                    '.instacard-top div:not([class]) > div[class] div:not(.instaAdProcessed) div[aria-haspopup="false"][role="button"][data-focusable="true"][tabindex="0"]:not(.instaAdProcessed,.instaProcessed),' +
                    '.instacard-top div:not([class]) > div[class] div:not(.instaAdProcessed) article[role="article"]:not(.instaAdProcessed,.instaProcessed)'
                ).each((n, value) => {
                    let found = false;
                    $("span,svg", value).each((n2, value2) => {
                        if($(value2).parent().text().indexOf("Promoted by ") === 0 || $(value2).parent().text() === "Promoted") {
                            $(value).parent().parents("div:not([class]),div.instaAdProcessed").first().addClass('instacard-ad instaProcessed instaAdProcessed');
                            // console.warn("[instacard] 'Promoted by' ad found", value, value2, par);
                            found = true;
                            return false;
                        }
                    });
                    if(!found) {
                        addInstaNew($(value));
                        $(value).parent().parents("div:not([class]),div.instaAdProcessed").first().addClass('instaAdProcessed');
                    }
                    $(value).addClass("instaAdProcessed");
                });
            }
            if(trending.length) {
                trending.children().addClass("instacard-top");
                trending.find('.instacard-top div[data-focusable="true"]:not(.instaAdProcessed) > div:last-child').each((n, value) => {
                    const par = $(value).parent();
                    if($(value).text().indexOf("Promoted by ") === 0) {
                        par.addClass('instacard-ad instaAdProcessed');
                    } else {
                        par.addClass('instaAdProcessed');
                    }
                });
            }
        }).observe(streamItemsNew[0], {
            childList: true,
            subtree: true
        });


        const body = $("body");
        new MutationObserver(() => {
            var isDark = body.css("background-color") !== "rgb(255, 255, 255)";
            body.toggleClass('instacardDark', isDark);
        })
        .observe(body[0], {
            attributes: true
        });
        body.addClass('instacard-new');
    }
})();
