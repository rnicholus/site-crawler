describe("PageParser", function() {
    beforeEach(function() {
	    this.PageParser = require("./../../src/server/page-parser");        
    }); 

    describe("getSameOriginUrlsUrls (no port on domain)", function() {
        beforeEach(function() {
            this.pageParser = new this.PageParser("http://www.domain.com");
        });

        it("doesn't remove same-origin URLs", function(){
            expect(this.pageParser.getSameOriginUrls(["http://www.domain.com"])).toEqual(["/"]);
            expect(this.pageParser.getSameOriginUrls(["http://www.domain.com/test"])).toEqual(["/test"]);
            expect(this.pageParser.getSameOriginUrls(["/test"])).toEqual(["/test"]);
            expect(this.pageParser.getSameOriginUrls(["test.html"])).toEqual(["test.html"]);
        });

        it("removes different-origin URLs", function() {
            expect(this.pageParser.getSameOriginUrls(["http://domain.com"])).toEqual([]);
            expect(this.pageParser.getSameOriginUrls(["https://www.domain.com"])).toEqual([]);
            expect(this.pageParser.getSameOriginUrls(["http://www.domain.co"])).toEqual([]);
            expect(this.pageParser.getSameOriginUrls(["http://www.domain.com:8080"])).toEqual([]);
            expect(this.pageParser.getSameOriginUrls(["//somecdn.com/foobar"])).toEqual([]);
        });
    });

    describe("getSameOriginUrls (port on domain)", function() {
        beforeEach(function() {
            this.pageParser = new this.PageParser("http://www.domain.com:8080");
        });

        it("doesn't remove same-origin URLs", function(){
            expect(this.pageParser.getSameOriginUrls(["http://www.domain.com:8080"])).toEqual(["/"]);
            expect(this.pageParser.getSameOriginUrls(["http://www.domain.com:8080/test"])).toEqual(["/test"]);
            expect(this.pageParser.getSameOriginUrls(["/test"])).toEqual(["/test"]);
            expect(this.pageParser.getSameOriginUrls(["test.html"])).toEqual(["test.html"]);
        });

        it("removes different-origin URLs", function() {
            expect(this.pageParser.getSameOriginUrls(["http://domain.com:8080"])).toEqual([]);
            expect(this.pageParser.getSameOriginUrls(["https://www.domain.com:8080"])).toEqual([]);
            expect(this.pageParser.getSameOriginUrls(["http://www.domain.co:8080"])).toEqual([]);
            expect(this.pageParser.getSameOriginUrls(["http://www.domain.com:8081"])).toEqual([]);
        });
    });

    describe("getLinks - simple page", function() {
        beforeEach(function(done) {
            var cheerio = require("cheerio"),
                fs = require("fs");

            fs.readFile(__dirname + "/simple-page.html", "utf8", function(err, data) {
                this.$ = cheerio.load(data);
                done();
            }.bind(this));
        });

        it("only returns the links", function() {
            expect(this.PageParser.prototype.getLinks(this.$)).toEqual([
                "http://www.yahoo.com/", 
                "../../index.html", 
                "http://google.com", 
                "http://foo.bar.com"
            ]);	    
        });
    });

    describe("getResources - simple page", function() {
        beforeEach(function(done) {
            var cheerio = require("cheerio"),
                fs = require("fs");

            fs.readFile(__dirname + "/simple-page.html", "utf8", function(err, data) {
                this.$ = cheerio.load(data);
                done();
            }.bind(this));
        });

        it("only returns the resources", function() {
            expect(this.PageParser.prototype.getResources(this.$)).toEqual([
                "/en-US/",
                "script.com",
                "example/prettypicture.jpg", 
                "http://video.com", 
                "/test/resources/big_buck_bunny.mp4", 
                "/test/resources/big_buck_bunny.ogv", 
                "http://audio.com",
                "foo.ogg",
                "foo.en.vtt",
                "foo.sv.vtt",
                "http://foo.bar.com"
            ]);	    
        });
    });

    describe("getDom", function() { 
        beforeEach(function() {
            this.nock = require("nock");
            this.pageParser = new this.PageParser("http://www.domain.com");
        });

        it("passes the proper path to the request function, successful result", function(done) {
            var request = this.nock("http://www.domain.com")
                    .get("/foo/bar")
                    .reply(200, "<div id='hi'></div>");

            this.pageParser.getDom("/foo/bar").then(function($) {
                request.done();
                expect($("div").attr("id")).toBe("hi");
                done();
            });
        });

        it("passes the proper path to the request function, failure result", function(done) {
            var request = this.nock("http://www.domain.com")
                    .get("/foo/bar")
                    .reply(404);

            this.pageParser.getDom("/foo/bar").then(
                function() {
                },

                function failure(reason) {
                    request.done();
                    expect(reason).toBeTruthy();
                    done();
                }
            );
        });
    });  	  
});
