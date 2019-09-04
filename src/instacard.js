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

    const isHighDensity = function() {
        return ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 124dpi), only screen and (min-resolution: 1.3dppx), only screen and (min-resolution: 48.8dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (min-device-pixel-ratio: 1.3)').matches)) || (window.devicePixelRatio && window.devicePixelRatio > 1.3));
    };
    const isRetina = function() {
        return ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx), only screen and (min-resolution: 75.6dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min--moz-device-pixel-ratio: 2), only screen and (min-device-pixel-ratio: 2)').matches)) || (window.devicePixelRatio && window.devicePixelRatio >= 2)) && /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
    }

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

            let $afterMedia = null;

            const existingMedia = $(tweet).find("a[href] div[aria-label='Image'] img[alt='Image'][draggable='false'][src],video[preload='none'][playsinline][src],blockquote.instagram-media");
            if(existingMedia.length > 0) {
                console.debug("instacard - tweet already contains media", tweet, existingMedia);
                $(tweet).addClass('insta-has-media');
                return;
            } else {
                const $tweetText = $(tweet).find(`div[lang="en"][dir="auto"]`);
                const next = $tweetText.next();

                if(next.attr('role') === "group") {
                    // this is the actions - like, retweet, etc
                    $afterMedia = next;
                } else if(next.find(`a[href^="${CSS.escape("https://help.twitter.com/using-twitter/how-to-tweet")}"]`).length > 0) {
                    // this is the date/time div
                    $afterMedia = next;
                } else {
                    console.debug("instacard - tweet probably already contains media", tweet, existingMedia);
                    $(tweet).addClass('insta-probably-has-media');
                    return;
                }
            }
            let par = $afterMedia.parent()[0];
            const width = Math.floor(par.clientWidth);
            console.debug('instacard getEmbed', instaShort, width, existingMedia);
            console.log(tweet.innerHTML);

            chrome.runtime.sendMessage(
                {
                    contentScriptQuery: "getEmbed", 
                    instaId: instaShort,
                    width: width
                },
                data => {
                    if(data.error) {
                        console.warn(data.error);
                        $(tweet).find('a[title*="instagr"]').append(`<span>⚠️</span>`);
                        return;
                    }
                    console.debug('instacard embed data', data);
                    // const apiHtml = $(data.html);
                    // apiHtml.find("a[href]").first().html(`
                    //     <img class="instathumb" src="${data.thumbnail_url}">
                    // `);
                    const scrape = data;
                    const $content = $();
                    
                    for(let p = 0; p < scrape.PostPage.length; p++) {
                        const media = scrape.PostPage[p].graphql.shortcode_media;

                        const injHtml = `
                            <blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/p/${instaShort}/" data-instgrm-version="12">
                                <div class="insta-container"> 
                                    <div class="insta-media-content">
                                        <a href="https://www.instagram.com/${media.owner.username}/" target="_blank">
                                            <div class="insta-header">
                                                <div class="insta-profile-picture">
                                                    <img src="${media.owner.profile_pic_url}" alt="${media.owner.full_name}">
                                                </div>
                                                <div class="insta-details">
                                                    <div class="insta-user">${media.owner.username}</div>
                                                    ${media.location ? `<div class="insta-location">${media.location.name}</div>` : ``}
                                                </div>
                                            </div>
                                        </a>
                                        <div class="insta-media">
                                        </div>
                                    </div>
                                </div>
                            </blockquote>
                        `;

                        const $page = $(injHtml);
                        const $media = $page.find(".insta-media")
                            .attr('data-graph', media.__typename);

                        if(
                            media.viewer_has_liked || 
                            (!media.comments_disabled && media.edge_media_to_parent_comment && media.edge_media_to_parent_comment.count) ||
                            media.viewer_has_saved
                        ) {
                            $page.find(".insta-media-content").append(`
                                <div class="insta-actions">
                                    <div class="insta-heart${media.viewer_has_liked ? ` liked` : ``}">
                                        <div class="insta-heart-container">
                                            <div class="insta-heart-1"></div>
                                            <div class="insta-heart-2"></div>
                                            <div class="insta-heart-3"></div>
                                        </div>
                                    </div>
                                    ${media.comments_disabled ? `` : 
                                    `<div class="insta-comment${media.edge_media_to_parent_comment && media.edge_media_to_parent_comment.count ? ` present`: ``}">
                                        <div class="insta-comment-1"></div>
                                        <div class="insta-comment-2"></div>
                                    </div>`}
                                    <div class="insta-bookmark${media.viewer_has_saved ? `saved` : ``}">
                                        <div class="insta-bookmark-1"></div>
                                        <div class="insta-bookmark-2"></div>
                                        <div class="insta-bookmark-3"></div>
                                    </div>
                                </div>
                            `);
                        }

                        switch(media.__typename) {
                            case "GraphImage":
                                const postLink = document.createElement('a');
                                const img = document.createElement('img');
                                img.crossOrigin = "anonymous";
                                img.src = media.display_url;
                                img.alt = media.accessibility_caption;
                                postLink.appendChild(img);
                                postLink.setAttribute('target', '_blank')
                                postLink.href = `https://www.instagram.com/p/${instaShort}/`;
                                $media.append(postLink);
                                break;
                            case "GraphSidecar":
                                let tallest = 0;
                                media.edge_sidecar_to_children.edges.forEach(el => {
                                    const node = el.node;
                                    const h = width / node.dimensions.width * node.dimensions.height;
                                    if(tallest < h) tallest = h;
                                });
                                for(let c = 0; c < media.edge_sidecar_to_children.edges.length; c++) {
                                    const node = media.edge_sidecar_to_children.edges[c].node;
                                    switch(node.__typename) {
                                        case "GraphImage":
                                            const postGalLink = document.createElement('a');
                                            const imgGal = document.createElement('img');
                                            imgGal.crossOrigin = "anonymous";
                                            imgGal.src = node.display_url;
                                            imgGal.alt = node.accessibility_caption;
                                            postGalLink.appendChild(imgGal);
                                            postGalLink.setAttribute('target', '_blank')
                                            postGalLink.href = `https://www.instagram.com/p/${instaShort}/`;
                                            $media.append(postGalLink);
                                            break;
                                        case "GraphVideo":
                                            const vidGal = document.createElement('video');
                                            vidGal.crossOrigin = "anonymous";
                                            vidGal.preload = "none";
                                            vidGal.setAttribute('playsinline', 'playsinline');
                                            vidGal.setAttribute('controls', 'controls');
                                            vidGal.setAttribute('type', 'video/mp4');
                                            vidGal.poster = media.display_url;
                                            vidGal.src = media.video_url;
                                            $media.append(vidGal);
                                            break;
                                        default:
                                            console.warn("instacard - unknown type in gallery", node);
                                    }
                                }
                                if(media.edge_sidecar_to_children.edges.length > 1) {
                                    const left = $(`<div class="insta-gal-btn insta-gal-left">&lt;</div>`);
                                    const right = $(`<div class="insta-gal-btn insta-gal-right">&gt;</div>`);
                                    left.on('click', (e) => {
                                        e.stopPropagation();
                                        console.log(e, $media[0], $media.scrollLeft);
                                        const container = $media[0];
                                        const galWidth = container.parentElement.scrollWidth;
                                        let nextPosition = Math.round((container.scrollLeft / galWidth) - 1);
                                        if(nextPosition < 0) {
                                            nextPosition = media.edge_sidecar_to_children.edges.length - 1;
                                        }
                                        // container.scrollLeft = nextPosition * galWidth;
                                        $(container).stop(true).animate({scrollLeft: nextPosition * galWidth}, 150);
                                    });
                                    right.on('click', (e) => {
                                        e.stopPropagation();
                                        console.log(e, $media[0], $media.scrollLeft);
                                        const container = $media[0];
                                        const galWidth = container.parentElement.scrollWidth;
                                        let nextPosition = Math.round((container.scrollLeft / galWidth) + 1);
                                        if(nextPosition >= media.edge_sidecar_to_children.edges.length) {
                                            nextPosition = 0;
                                        }
                                        // container.scrollLeft = nextPosition * galWidth;
                                        $(container).stop(true).animate({scrollLeft: nextPosition * galWidth}, 150);
                                    });
                                    $media.append(left).append(right);
                                }
                                break;
                            case "GraphVideo":
                                const vid = document.createElement('video');
                                vid.crossOrigin = "anonymous";
                                vid.preload = "none";
                                vid.setAttribute('playsinline', 'playsinline');
                                vid.setAttribute('controls', 'controls');
                                vid.setAttribute('type', 'video/mp4');
                                vid.poster = media.display_url;
                                vid.src = media.video_url;
                                $media.append(vid);
                                break;
                            default:
                                console.warn("instacard - unknown media", media);
                        }

                        for(let d = 0; d < media.edge_media_to_caption.edges.length; d++) {
                            const $descContainer = $(`
                                <p class="insta-description"> 
                                    <a href="https://www.instagram.com/p/${instaShort}/" target="_blank"></a>
                                </p>
                            `);
                            $descContainer.find("a").text(media.edge_media_to_caption.edges[d].node.text);
                            $page.find(".insta-container").append($descContainer);
                        }
                        console.log("instacard - ready to inject", $afterMedia, $page);

                        $afterMedia.before($page);
                    }
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
    // const tweetParents = [];
    window.tweetParents = [];
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
                console.debug("instacart - removed parent", tweetParents[p]);
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

    window.addEventListener('popstate', function(event) {
        findTweetRoot();
    });
})();
