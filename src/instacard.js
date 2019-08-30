(function () {
    const findReactComponent = function(el) {
        for (const key in el) {
          if (key.startsWith('__reactInternalInstance$')) {
            const fiberNode = el[key];
      
            return fiberNode && fiberNode.return && fiberNode.return.stateNode;
          }
        }
        return null;
    };

    const resolve = (path, obj) => {
        return path.split('.').reduce(function (prev, curr) {
            return prev ? prev[curr] : undefined
        }, obj || self)
    };

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
            });
    };

    const addInstaNew = (tweet) => {

        const text = tweet.innerText;
        if(/\/\/(www.)?((instagram.com)|(instagr.am))\/p\/[A-Za-z0-9]+/gi.test(text)) {
            const instaUrl = $(tweet).find('a[title*="instagr"]').attr('title');
            const instaUrlSplit = instaUrl.split('?')[0].split('/');
            if(instaUrlSplit.length < 6) return;
            clearTimeout(injectScriptWaiter);
            let instaShort = '';
            for(let s = 0; s < instaUrlSplit.length; s++) {
                if(instaUrlSplit[s] === 'p' && (s + 1) < instaUrlSplit.length) {
                    instaShort = instaUrlSplit[s + 1];
                    break;
                }
                instaShort = instaUrlSplit[s];
            }
            if(!instaShort) {
                return;
            }
            let actionbar = $('div[role="group"]', tweet).last();
            let par = actionbar.parent()[0];
            const width = Math.floor(par.clientWidth);

            console.debug('instacard getEmbed', instaShort, width);

            chrome.runtime.sendMessage(
                {
                    contentScriptQuery: "getEmbed", 
                    instaId: instaShort,
                    width: width
                },
                data => {
                    console.debug('instacard embed data', data);
                    const apiHtml = $(data.html);
                    apiHtml.find("a[href]").first().html(`
                        <img class="instathumb" src="${data.thumbnail_url}">
                    `);
                    // const injectedCode = $(`
                    //     <div class="instacard-photo">
                    //         <a href="${instaUrl}" target="_blank">
                    //             <img class="instathumb" src="${data.thumbnail_url}">
                    //         </a>
                    //         <p class="instatext"></p>
                    //         <div class="insta-author">
                    //             <a href="https://www.instagram.com/${data.author_name}" target="_blank">@${data.author_name}</a>
                    //         </div>
                    //     </div>
                    // `);
                    // injectedCode.find(".instatext").text(data.title);
                    // injectedCode.find("*")
                    //     .css({
                    //         "background": "", 
                    //         "background-color": "", 
                    //         "color": "", 
                    //         "border": "", 
                    //         "border-radius": "", 
                    //         "box-shadow": ""
                    //     });
                    // let insertAfter = $(par).children();
                    // insertAfter = insertAfter.not('[aria-label*="Retweets"],[aria-label*="likes"]');
                    // insertAfter.each((n, value) => {
                    //     if($(value).find('a[href^="https://help.twitter.com/using-twitter/how-to-tweet"]').length) {
                    //         insertAfter = insertAfter.not($(value).nextAll()).not(value);
                    //     }
                    // });
                    // insertAfter.last().after(injectedCode);
                    // actionbar.before(injectedCode);
                    actionbar.before(apiHtml);
                    // $(tweet).find("div.instacard-photo *")
                    //     .css({
                    //         "background": "", 
                    //         "background-color": "", 
                    //         "color": "", 
                    //         "border": "", 
                    //         "border-radius": "", 
                    //         "box-shadow": ""
                    //     });
                    // const refUrl = injectedCode.find("a").attr("href") || ('http://instagr.am/p/' + instaShort + '/');
                    // const image = $('<a href="'+refUrl+'" target="_blank"><img src="'+data.thumbnail_url+'" alt="'+data.title+'"></a>');
                    // injectedCode.find("[data-instgrm-permalink] > div > div").first()
                    //     .html(image)
                    //     .css({"padding": 0, "margin-top": 0});
                });
        } else {
            return;
        }
    };

    // tweet stream
    const streamItemsNew = $("#react-root");
    const processTweet = function(tweet) {
        try {
            const comp = findReactComponent(tweet);
            if(comp) {
                if(comp.props && comp.props.id && typeof comp.props.id === 'string' && comp.props.id.indexOf('promoted') >= 0) {
                    console.info("instacard remove promoted - react", tweet);
                    tweet.classList.add('insta-promo-react');
                }
            } else {
                const promoIcons = tweet.querySelectorAll('[d="M20.75 2H3.25C2.007 2 1 3.007 1 4.25v15.5C1 20.993 2.007 22 3.25 22h17.5c1.243 0 2.25-1.007 2.25-2.25V4.25C23 3.007 21.993 2 20.75 2zM17.5 13.504c0 .483-.392.875-.875.875s-.875-.393-.875-.876V9.967l-7.547 7.546c-.17.17-.395.256-.62.256s-.447-.086-.618-.257c-.342-.342-.342-.896 0-1.237l7.547-7.547h-3.54c-.482 0-.874-.393-.874-.876s.392-.875.875-.875h5.65c.483 0 .875.39.875.874v5.65z"]');
                if(promoIcons.length > 0) {
                    console.info("instacard remove promoted - icon", tweet);
                    tweet.classList.add('insta-promo-icon');
                } else if(tweet.innerText.indexOf('Promoted') >= 0) {
                    console.info("instacard remove promoted - innerText", tweet);
                    tweet.classList.add('insta-promo-innertext');
                }
            }
        } catch(ex) {
            console.warn("insta-promo scan error", ex);
        }
        if(!tweet.classList.contains('insta-promo')) {
            try {
                addInstaNew(tweet);
            } catch(ex) {
                console.warn("insta-gram scan error", ex);
            }
        }
        tweet.classList.add('instacard');
        tweet.classList.remove('insta-scanning');
    };
    const tweetParents = [];
    const scanTweets = function() {
        for(let p = 0; p < tweetParents.length; p++) {
            const tweetsToScan = $(tweetParents[p]).children().not(".insta-scanning,.instacard").addClass('insta-scanning');
            if(tweetsToScan.length === 0) continue;
            console.info("instacard - mutation, scanning " + tweetsToScan.length + " tweets");
            tweetsToScan.each((index, tweet) => {
                processTweet(tweet);
            });
        }
    };
    const findTweetRoot = function() {
        let timelines = $('div[aria-label^="Timeline\: "]', streamItemsNew)
            .not('[aria-label="Timeline\: Trending now"]');
        if(timelines.length > 0) {
            timelines = timelines.not('.instacard-top')
                .filter(function() {
                    return $(".instacard-top", this).length === 0;
                });
            if(timelines.length === 0) return;

            let tweetParent = timelines.children().first();
            while(tweetParent && tweetParent.children().length > 0 && tweetParent.children().first()[0].style.cssText) {
                tweetParent = tweetParent.children().first();
            }

            const newParents = [];
            tweetParent.each(function(index, element) {
                if(tweetParents.indexOf(element) < 0) {
                    tweetParents.push(element);
                }
                newParents.push(element);
            }).addClass("instacard-top");

            if(newParents.length > 0) {
                console.info("instacard - found new tweet parents: ", newParents.length);
                for(let p = 0; p < newParents.length; p++) {
                    // observe this tweet parent - tweets will be loading under it
                    new MutationObserver(scanTweets)
                        .observe(newParents[p], {
                            childList: true,
                            attributes: false,
                            subtree: false
                        });
                }
                scanTweets(); // process existing tweets
            } else {
                console.debug("instacard - couldn't find tweet root, retrying...", tweetParent);
                findTweetRootRetry = setTimeout(findTweetRoot, 200);
            }
        } else {
            console.debug("instacard - couldn't find timeline, retrying...", timelines);
            findTweetRootRetry = setTimeout(findTweetRoot, 300);
        }
    };

    findTweetRoot(); // initialize everything by finding first tweet parents

    // if the react root has mutations, check that all the tweet parents are still valid, otherwise look for them again
    new MutationObserver(() => {
        let removed = 0;
        for(let p = tweetParents.length - 1; p >= 0; p--) {
            if(!tweetParents[p] || !tweetParents[p].parentElement) {
                tweetParents.splice(p, 1);
                removed++;
            }
        }
        if(removed > 0 || tweetParents.length === 0) {
            findTweetRoot();
        }
    }).observe(streamItemsNew[0], {
        childList: true,
        attributes: false,
        subtree: true
    });
})();
