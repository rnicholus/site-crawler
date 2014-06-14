/**
 * Used to track any pages encountered by the crawler.
 **/
var pages = {};

exports.failed = function(path) {
  	pages[path].error = true;  
};

exports.get = function() {
    return pages;
};

exports.isRegistered = function(page) {
  	return !!pages[page];  
};

exports.register = function(path) {
    pages[path] = {
        links: [],
        resources: []
    };            
};

exports.reset = function() {
   pages = {}; 
};

exports.setLinks = function(path, links) {
    pages[path].links = links;
};

exports.setResources = function(path, resources) {
    pages[path].resources = resources;
};