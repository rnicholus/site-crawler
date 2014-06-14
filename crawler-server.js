/**
 * Starts an HTTP server that waits for a GET request with a domain value 
 * and responds with JSON representing all parsed pages on the domain.
 **/
var express = require("express"),
    crawler = require("src/server/crawler"),
    app = express();

app.use("/", express.static("src/client"));

app.get("/map", function(request, response) {
    var domain = request.query.domain;

    if (!domain) {
        response.send(400, "Invalid domain");
    }
    else {
        crawler.crawl(domain).then(
            function success(data) {
                console.log("Crawl complete!");
                response.send(200, JSON.stringify(data));
            },

            function failure(reason) {
                console.error("Crawl failed! " + reason);
                response.send(500, reason);
            }
        );
    }
});

app.listen(9000);
console.log("Crawler server started on port %s", 9000);