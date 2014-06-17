'use strict';


module.exports = function (grunt) {

    // Load the project's grunt tasks from a directory
    require('grunt-config-dir')(grunt, {
        configDir: require('path').resolve('tasks')
    });

    // Register group tasks
    grunt.registerTask('build', [ 'jshint', 'less', 'copyto', 'i18n' ]);
    grunt.registerTask('test', [ 'jshint', 'mochacli' ]);

};
