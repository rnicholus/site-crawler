/**
 * Performs operations on a specific page/url
 **/
var cheerio = require("cheerio"),
    CrawlerError = require("./error"),
    RSVP = require("rsvp"),
	request = require("request");

var PageParser = function(domain) {
    // Get a parsed version of an HTML page, 
    // given a path relative to the domain associated with this instance.
    // Promissory with the cheerio parsed DOM passed to the success handler.
    this.getDom = function(path) {
        if (path.indexOf("http") !== 0) {
            if (path.indexOf("/") === 0) {
                path = path.substr(1);
            }
            path = domain + "/" + path;
        }
                
        return new RSVP.Promise(function(resolve, reject) {
            request(path, function(error, res, body) {
                if (error) {
					reject(error);
                }
                else if (res.statusCode < 200 || res.statusCode > 299) {
                    reject("Response code of " + res.statusCode);
                }
                else {
	                resolve(cheerio.load(body));                    
                }
            });
        });
    };
    
    // Examines an array of URLs and returns only those that are on the same domain 
    // as the one associated with this instance.  Returned URLs are also 
    // formatted to be relative to the domain.
    this.getSameOriginUrls = function(urls) {
        var sameOriginUrls = [];
        urls.forEach(function(url) {
            if (new RegExp("^" + domain + "[^:]*$").test(url)) {
                url = url.substr(domain.length);
            }

            url = url.trim();
            if (url.length === 0) {
                url = "/";
            }
            
            if (url.indexOf("http") < 0 && url.indexOf("//") !== 0) {
                sameOriginUrls.push(url);
            }
        }); 
        
        return sameOriginUrls;
    };
};

// Given a cheerio parsed DOM, returns any valid URLs associated with anchors and iframes on the page.
PageParser.prototype.getLinks = function($) {
    var links = [];

    $("A[href], IFRAME[src]").each(function() {
        var url = $(this).attr("href") || $(this).attr("src");

        /* jshint scripturl:true */
        if (url != null && url.indexOf("#") !== 0 && url.indexOf("mailto:") !== 0 && url.indexOf("javascript:") !== 0) {
            var hashIndex = url.indexOf("#");
            if (hashIndex > 0) {
                url = url.substr(0, hashIndex);
            }
            
            if (links.indexOf(url) < 0) {
				links.push(url);         
            }
        }
    });

    return links;    
};

// Given a cheerio-parsed DOM, returns any paths that represent static resources, such as CSS files, videos, etc.
PageParser.prototype.getResources = function($) {
    var resources = [];

    $("VIDEO[src], AUDIO[src], TRACK[src], SOURCE[src], IFRAME[src], IMG[src], SCRIPT[src], LINK[href]").each(function() {
        var url = $(this).attr("href") || $(this).attr("src");

        if (url.indexOf("#") !== 0 && resources.indexOf(url) < 0) {
			resources.push(url);            
        }
    });

    return resources;    
};

module.exports = PageParser;