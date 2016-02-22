module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    cson: {
      glob_to_multiple: {
        expand: true,
        src: ['data/docs.cson'],
        dest: '',
        ext: '.json'
      }
    }
  });

  grunt.loadNpmTasks('grunt-cson');
  grunt.registerTask('default', ['cson']);

};
