/**
 * Handles command-line invocation of the crawler.
 * Passes the domain included on the command line to the crawler.
 **/
var crawler = require("src/server/crawler"),
    CrawlerError = require("src/server/error"),
    domain = process.argv[2]; // domain should be the 1st user-supplied command line arg
    
if (!domain) {
    throw new CrawlerError("No domain argument!");
}

crawler.crawl(domain).then(
    function success(data) {
        console.log("Crawl complete!");
        console.dir(data);
    },
    
    function failure(reason) {
        console.error("Crawl failed! " + reason);
    }
);