function config(name) {
    return require("./grunt_tasks/" + name + ".js");
}

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        jasmine_node: config("jasmine_node"),
        jshint: config("jshint"),
        watch: config("watch")
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-jasmine-node");

    grunt.registerTask("ci", ["jshint", "jasmine_node"]);
    
    // Must disable watch task until codio allows auto-save to be adjusted/turned off
    grunt.registerTask("default", ["jshint", "jasmine_node", "watch"]);
};