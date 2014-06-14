/**
 * Controller that parses all same-origin pages on a given domain.
 **/
var PageParser = require("./page-parser"),
    pages = require("./pages"),
    RSVP = require("rsvp");

var SiteParser = function(domain) {
    
    // Start parsing at the root of the domain.
    this.start = function() {
        pages.reset();
        
        return new RSVP.Promise(function(resolve, reject) {
            var pageParser = new PageParser(domain);

            pages.register("/");

            this.readPathAndDescendents("/", pageParser).then(
                function() {
                    resolve(pages.get());
                },
                function(reason) {
                    reject(reason);
                }
            );
        }.bind(this));
    };
};

// Recursively read the passed path and all child same-origin paths.
// Promissory.  A failure to parse a specific page will not result 
// in a rejection of the promise, so that parsing can continue with other pages.
// TODO normalize uplevel path links (i.e. ../../docs/index.html)
SiteParser.prototype.readPathAndDescendents = function(path, parser) {
    var siteParser = this;
    
    return new RSVP.Promise(function(resolve, reject) {
        
        parser.getDom(path).then(
            function success(cheerioDom) {
                var pending = [],
               		resources = parser.getResources(cheerioDom),
               		links = parser.getLinks(cheerioDom);

                links = parser.getSameOriginUrls(links);
                pages.setResources(path, resources);
                pages.setLinks(path, links);

                links.forEach(function(link) {
                    if (!pages.isRegistered(link)) {
                        pages.register(link);
	                    pending.push(siteParser.readPathAndDescendents(link, parser));
                    }
                });
                
                if (pending.length === 0) {
                    resolve();
                }
                else {
                    RSVP.all(pending).then(resolve, reject);
                }
            },

            function failure(reason) {
                console.error("Failed to parse '" + path + "' due to " + reason);
                pages.failed(path);
                resolve();
            }
        );        
    });
};

module.exports = SiteParser;