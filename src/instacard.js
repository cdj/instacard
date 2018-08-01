(function () {
    const resolve = (path, obj) => {
        return path.split('.').reduce(function (prev, curr) {
            return prev ? prev[curr] : undefined
        }, obj || self)
    }

    var injectScriptWaiter = null;

    // const extractInstaInfo = (body) => {
    //     // image
    //     // const reImage = /(?:meta property="og:image" content="(.+)")/imu;
    //     // const imageMatches = body.match(reImage);
    //     var imageUrl = null;
    //     // if (!imageUrl) {
    //     //     throw Error(`No direct url`)
    //     // }

    //     // video
    //     // const reVideo = /(?:meta property="og:video:secure_url" content="(.+)")/imu;
    //     // const videoMatches = body.match(reVideo);
    //     var videoUrl = null;

    //     // additional data
    //     const reSharedData = /(?:window\._sharedData\s=\s(.+?);<\/script>)/imu;
    //     const sharedDataMatches = body.match(reSharedData);
    //     const sharedData = JSON.parse(sharedDataMatches[1] || "{}");
    //     const postType = resolve("entry_data.PostPage.0.graphql.shortcode_media.__typename", sharedData) || null;
    //     const description = resolve("entry_data.PostPage.0.graphql.shortcode_media.edge_media_to_caption.edges.0."
    //         + "node.text", sharedData) || null;
    //     const location = resolve("entry_data.PostPage.0.graphql.shortcode_media.location.name", sharedData) || null;

    //     switch(typeMatches[1]) {
    //         case "GraphSidecar":
    //             imageUrl = [];
    //             const slideshow = resolve("entry_data.PostPage.0.graphql.shortcode_media.edge_sidecar_to_children", sharedData) || null;
    //             for(var i = 0; i < slideshow.length; i++) {
    //                 if(slideshow[i].node.__typename == "GraphImage") {
    //                     imageUrl.push(slideshow[i].node.display_url);
    //                 }
    //             }
    //             break;
    //         case "GraphVideo":
    //             videoUrl = resolve("entry_data.PostPage.0.graphql.shortcode_media.video_url", sharedData) || null;
    //             if(!videoUrl) {
    //                 const reVideo = /(?:meta property="og:video:secure_url" content="(.+)")/imu;
    //                 const videoMatches = body.match(reVideo);
    //                 videoUrl = videoMatches ? videoMatches[1] : null;
    //             }
    //         case "GraphImage":
    //             imageUrl = resolve("entry_data.PostPage.0.graphql.shortcode_media.display_url", sharedData) || null;
    //             if(!imageUrl) {
    //                 const reImage = /(?:meta property="og:image" content="(.+)")/imu;
    //                 const imageMatches = body.match(reImage);
    //                 if (!imageUrl) {
    //                     throw Error(`No direct url`)
    //                 }
    //                 imageUrl = imageMatches ? imageMatches[1] : null;
    //             }
    //             break;
    //     }

    //     return {imageUrl, videoUrl, description, location};
    // };

    // const generateHtml = (instaUrl, instaInfo) => {
    //     if (instaInfo.videoUrl) {
    //         return $("<div>").append(
    //             $("<video>")
    //                 .attr("playsinline", "")
    //                 .attr("poster", instaInfo.imageUrl)
    //                 .attr("preload", "none").attr("src", instaInfo.videoUrl)
    //                 .attr("type", "video/mp4")
    //         ).append(
    //             $("<div>").addClass("video-info").html("click on video to play")
    //         ).html();
    //     } else if(typeof instaInfo.imageUrl === "string") {
    //         return `<a href="${encodeURI(instaUrl)}" rel="nofollow" target="_blank">`
    //             + `<img src="${encodeURI(instaInfo.imageUrl)}"></a>`;
    //     } else {
    //         // var html = "<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https:\/\/www.instagram.com/p/fA9uwTtkSN/" data-instgrm-version="9" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:658px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:8px;"> <div style=" background:#F8F8F8; line-height:0; margin-top:40px; padding:50% 0; text-align:center; width:100%;"> <div style=" background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAMAAAApWqozAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAMUExURczMzPf399fX1+bm5mzY9AMAAADiSURBVDjLvZXbEsMgCES5/P8/t9FuRVCRmU73JWlzosgSIIZURCjo/ad+EQJJB4Hv8BFt+IDpQoCx1wjOSBFhh2XssxEIYn3ulI/6MNReE07UIWJEv8UEOWDS88LY97kqyTliJKKtuYBbruAyVh5wOHiXmpi5we58Ek028czwyuQdLKPG1Bkb4NnM+VeAnfHqn1k4+GPT6uGQcvu2h2OVuIf/gWUFyy8OWEpdyZSa3aVCqpVoVvzZZ2VTnn2wU8qzVjDDetO90GSy9mVLqtgYSy231MxrY6I2gGqjrTY0L8fxCxfCBbhWrsYYAAAAAElFTkSuQmCC); display:block; height:44px; margin:0 auto -44px; position:relative; top:-22px; width:44px;"></div></div> <p style=" margin:8px 0 0 0; padding:0 4px;"> <a href="https://www.instagram.com/p/fA9uwTtkSN/" style=" color:#000; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none; word-wrap:break-word;" target="_blank">Wii Gato (Lipe Sleep)</a></p> <p style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;">A post shared by <a href="https://www.instagram.com/diegoquinteiro/" style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px;" target="_blank"> Diego Moreno Quinteiro</a> (@diegoquinteiro) on <time style=" font-family:Arial,sans-serif; font-size:14px; line-height:17px;" datetime="2013-10-03T18:19:39+00:00">Oct 3, 2013 at 11:19am PDT</time></p></div></blockquote>"
    //     }
    // };

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
                                // '<img data-aria-label-part="" src="'+data.thumbnail_url+'"' +
                                //     'alt="" style="height: 100%; left: -39px;">' +
                                // '<div class="AdaptiveMedia-badge">' +
                                //     '<div class="AdaptiveMedia-badgeText">0:22</div>' +
                                // '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
                // const injectedCode = $("<div/>").html(html).addClass('instacard');
                // const footer = tweet.find('.stream-item-footer');
                // const footer = tweet.find('.QuoteTweet,.stream-item-footer').first();
                tweet.find(".tweet-content").first().prepend(html);

                clearTimeout(injectScriptWaiter);
                injectScriptWaiter = setTimeout(function() {
                    var script = document.createElement('script');
                    script.type = 'text/javascript';
                    script.src = '//www.instagram.com/embed.js';
                    script.setAttribute("async", "");
                    script.setAttribute("defer", "");
                    document.head.appendChild(script);
                }, 150);
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
                    const html = //'<iframe width="'+data.width+'" height="700" src="https://instagram.com/p/'+instaShort+'/embed" frameborder="0"></iframe>';
                        data.html;
                    const injectedCode = $("<div/>").html(html).addClass('instacard');
                    // const footer = tweet.find('.stream-item-footer');
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
                        script.setAttribute("defer", "");
                        document.head.appendChild(script);
                    }, 150);
                })
                .catch(reason => {
                    console.log(`An unknown error loading of ${instaUrl}. The reason: ${reason}`);
                });

            // fetch(instaUrl)
            //     .then(response => {
            //         if (response.status !== 200) {
            //             throw Error(`${response.url} has returned ${response.status} status code.`);
            //         }
            //         return response.text()
            //     })
            //     .then(body => {
            //         return extractInstaInfo(body);
            //     })
            //     .then(instaInfo => {
            //         if (instaInfo.description) {
            //             const tweetText = tweet.find('.tweet-text');
            //             const instaAnchor = tweetText.find('a');
            //             tweetText.text(instaInfo.description
            //                 + (instaInfo.location ? ' @ ' + instaInfo.location : '')
            //                 + ' '
            //             );
            //             instaAnchor.appendTo(tweetText);
            //         }
            //         const html = generateHtml(instaUrl, instaInfo);
            //         const injectedCode = $("<div/>").html(html).addClass('instacard');
            //         const footer = tweet.find('.stream-item-footer');
            //         footer.before(injectedCode);
            //         if (instaInfo.videoUrl) {
            //             tweet.find('video').click((event) => {
            //                 event.target.paused ? event.target.play() : event.target.pause();
            //                 return false;
            //             });
            //         }
            //     })
            //     .catch(reason => {
            //         console.log(`An unknown error loading of ${instaUrl}. The reason: ${reason}`);
            //     });
        }
    };

    // list
    // const doc = $("#doc");
    // new MutationObserver(() => {
    //     doc.find('.js-stream-item[data-item-type=tweet]').each((n, value) => {
    //         addInsta($(value).find('div.tweet').first());
    //     });
    // }).observe(doc[0], {
    //     childList: true,
    //     subtree: true,
    // });

    // single post
    const permalinkOverlay = $("#permalink-overlay");
    const streamItems = $("#stream-items-id");
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
})();
