describe("SiteParser", function() {
    beforeEach(function() {
        var rewire = require("rewire");

        this.RSVP = require("rsvp");
        this.SiteParser = rewire("./../../src/server/site-parser");
        this.PageParser = jasmine.createSpy("PageParser");
        this.pages = require("./../../src/server/pages");
        this.SiteParser.__set__({
            "PageParser": this.PageParser
        });    
    });

    describe("readPathAndDescendents", function() {
        describe("leaf path", function() {
            beforeEach(function() {
                this.parser = jasmine.createSpyObj("pageParser", ["getDom", "getLinks", "getResources", "getSameOriginUrls"]);
                this.getDomDeferred = this.RSVP.defer();
            });

            it("handles success", function(done) {
                var resources = ["style.css"],
                    links = [],
                    cheerioDom = "test";

                this.pages.register("/");

                this.parser.getDom.andReturn(this.getDomDeferred.promise);
                this.parser.getResources.andReturn(resources);
                this.parser.getLinks.andReturn(links);
                this.parser.getSameOriginUrls.andReturn(links);
                this.getDomDeferred.resolve(cheerioDom);            

                this.SiteParser.prototype.readPathAndDescendents("/", this.parser).then(
                    function() {
                        expect(this.pages.get()).toEqual({
                            "/": {
                                resources: ["style.css"],
                                links: []
                            }
                        });

                        expect(this.parser.getDom).toHaveBeenCalledWith("/");
                        expect(this.parser.getResources).toHaveBeenCalledWith(cheerioDom);
                        expect(this.parser.getLinks).toHaveBeenCalledWith(cheerioDom);
                        expect(this.parser.getSameOriginUrls).toHaveBeenCalledWith(links);
                        expect(this.parser.getDom.callCount).toBe(1);

                        done();                
                    }.bind(this));
            });

            it("handles failure", function(done) {
                this.pages.register("/");

                this.parser.getDom.andReturn(this.getDomDeferred.promise);
                this.getDomDeferred.reject("oops!");            

                this.SiteParser.prototype.readPathAndDescendents("/", this.parser).then(
                    function() {
                        expect(this.pages.get()).toEqual({
                            "/": {
                                resources: [],
                                links: [],
                                error: true
                            }
                        });
                        expect(this.parser.getDom.callCount).toBe(1);

                        done();
                    }.bind(this));
            });
        });

        describe("some links to follow", function() {
            beforeEach(function() {
                this.parser = jasmine.createSpyObj("pageParser", ["getDom", "getLinks", "getResources", "getSameOriginUrls"]);
                this.getDomDeferred = this.RSVP.defer();
            });

            it("handles success", function(done) {
                var resources = ["style.css"],
                    links = ["test.html"],
                    cheerioDom = "test";

                this.pages.register("/");

                this.parser.getDom.andReturn(this.getDomDeferred.promise);
                this.parser.getResources.andReturn(resources);
                this.parser.getLinks.andReturn(links);
                this.parser.getSameOriginUrls.andReturn(links);
                this.getDomDeferred.resolve(cheerioDom);            

                this.SiteParser.prototype.readPathAndDescendents("/", this.parser).then(
                    function() {
                        expect(this.parser.getDom.callCount).toBe(2);
                        expect(this.parser.getDom.calls[0].args[0]).toBe("/");
                        expect(this.parser.getDom.calls[1].args[0]).toBe("test.html");

                        expect(this.pages.get()).toEqual({
                            "/": {
                                resources: ["style.css"],
                                links: ["test.html"]
                            },
                            "test.html": {
                                resources: ["style.css"],
                                links: ["test.html"]
                            }
                        });

                        expect(this.parser.getResources).toHaveBeenCalledWith(cheerioDom);
                        expect(this.parser.getLinks).toHaveBeenCalledWith(cheerioDom);
                        expect(this.parser.getSameOriginUrls).toHaveBeenCalledWith(links);

                        done();                
                    }.bind(this));
            });
        });
    });
});