module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    jshint: {
      files: {
        src: [
          'lib/**/*.js',
          'test/**/*.js',
          'indexjs',
          'Gruntfile.js'
        ]
      },
      options: {
        jshintrc: '.jshintrc'
      }
    }
  });

  grunt.registerTask('default', ['jshint']);
};
