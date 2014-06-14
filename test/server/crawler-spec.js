describe("crawler", function() {
    beforeEach(function() {
		var rewire = require("rewire");
        
    	this.crawler = rewire("./../../src/server/crawler");
        this.SiteParser = jasmine.createSpy("SiteParser");
        this.crawler.__set__({
            "SiteParser": this.SiteParser
        });    
    });
    
    it("strips a trailing slash of the passed domain", function() {
        this.SiteParser.prototype.start = function() {};
        this.crawler.crawl("http://foo.bar/");
        
        expect(this.SiteParser).toHaveBeenCalledWith("http://foo.bar");
    });

    it("defaults to http", function() {
        this.SiteParser.prototype.start = function() {};
        this.crawler.crawl("foo.bar");
        
        expect(this.SiteParser).toHaveBeenCalledWith("http://foo.bar");
    });
});