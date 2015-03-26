"use strict";

var license = [
'/*                                                                         ',
' * Copyright 2015, Gregg Tavares.                                          ',
' * All rights reserved.                                                    ',
' *                                                                         ',
' * Redistribution and use in source and binary forms, with or without      ',
' * modification, are permitted provided that the following conditions are  ',
' * met:                                                                    ',
' *                                                                         ',
' *     * Redistributions of source code must retain the above copyright    ',
' * notice, this list of conditions and the following disclaimer.           ',
' *     * Redistributions in binary form must reproduce the above           ',
' * copyright notice, this list of conditions and the following disclaimer  ',
' * in the documentation and/or other materials provided with the           ',
' * distribution.                                                           ',
' *     * Neither the name of Gregg Tavares. nor the names of his           ',
' * contributors may be used to endorse or promote products derived from    ',
' * this software without specific prior written permission.                ',
' *                                                                         ',
' * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS     ',
' * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT       ',
' * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR   ',
' * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT    ',
' * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,   ',
' * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT        ',
' * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,   ',
' * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY   ',
' * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT     ',
' * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE   ',
' * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.    ',
' */                                                                        ',
].map(function(s) { return s.trim(); }).join("\n");

module.exports = function(grunt) {

  var srcFiles = [
    'src/primitives.js',
    //'src/webgl-2d-math.js',
    //'src/webgl-3d-math.js',
    'src/webgl-utils.js',
  ]

  grunt.initConfig({
    jsdoc: {
      docs: {
        src: srcFiles.concat('docs.md'),
        options: {
          destination: 'docs',
          configure: 'jsdoc.conf.json',
          template: 'node_modules/ink-docstrap/template',
        },
      },
    },
    uglify: {
      min: {
        options: {
          mangle: false,
          screwIE8: true,
          banner: license,
          compress: true,
        },
        files: {
          'build/twgl.min.js': srcFiles,
        },
      },
      max: {
        options: {
          mangle: false,
          screwIE8: true,
          banner: license,
          compress: false,
        },
        files: {
          'build/twgl.js': srcFiles,
        },
      },
    },
    clean: [
      'docs',
      'build',
    ],
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['clean', 'uglify', 'jsdoc']);
};

