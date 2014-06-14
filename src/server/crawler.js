/**
 * Entry point for all invocations of the crawler (both HTTP and command-line).
 **/
var SiteParser = require("./site-parser");

exports.crawl = function(domain) {
    if (domain.indexOf("http") !== 0) {
        domain = "http://" + domain;
    }
    
    if (domain.charAt(domain.length-1) === "/") {
        domain = domain.substr(0, domain.length-1);
    }

    var siteParser = new SiteParser(domain);
    return siteParser.start();
};