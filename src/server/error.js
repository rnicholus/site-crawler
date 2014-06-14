/**
 * Custom Error
 **/
var CrawlerError = function(message) {
    this.message = "[site-crawler]: " + message;
    console.error(this.message);
};

CrawlerError.prototype = new Error();

module.exports = CrawlerError;