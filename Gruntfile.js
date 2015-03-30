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

var replaceHandlers = {};
function registerReplaceHandler(keyword, handler) {
  replaceHandlers[keyword] = handler;
}

/**
 * Replace %(id)s in strings with values in objects(s)
 *
 * Given a string like `"Hello %(name)s from %(user.country)s"`
 * and an object like `{name:"Joe",user:{country:"USA"}}` would
 * return `"Hello Joe from USA"`.
 *
 * @param {string} str string to do replacements in
 * @param {Object|Object[]} params one or more objects.
 * @returns {string} string with replaced parts
 */
var replaceParams = (function() {
  var replaceParamsRE = /%\(([^\)]+)\)s/g;

  return function(str, params) {
    if (!params.length) {
      params = [params];
    }

    return str.replace(replaceParamsRE, function(match, key) {
      var colonNdx = key.indexOf(":");
      if (colonNdx >= 0) {
        try {
          var args = hanson.parse("{" + key + "}");
          var handlerName = Object.keys(args)[0];
          var handler = replaceHandlers[handlerName];
          if (handler) {
            return handler(args[handlerName]);
          }
          console.error("unknown substition handler: " + handlerName);
        } catch (e) {
          console.error(e);
          console.error("bad substitution: %(" + key + ")s");
        }
      } else {
        // handle normal substitutions.
        var keys = key.split('.');
        for (var ii = 0; ii < params.length; ++ii) {
          var obj = params[ii];
          for (var jj = 0; jj < keys.length; ++jj) {
            var key = keys[jj];
            obj = obj[key];
            if (obj === undefined) {
              break;
            }
          }
          if (obj !== undefined) {
            return obj;
          }
        }
      }
      console.error("unknown key: " + key);
      return "%(" + key + ")s";
    });
  };
}());


module.exports = function(grunt) {

  var srcFiles = [
    'src/twgl.js',
  ];

  var thirdPartyFiles = [
  ];

  var extraFiles = [
    'src/v3.js',
    'src/m4.js',
    'src/primitives.js',
  ];

  var docsFiles = srcFiles.concat(extraFiles, 'README.md');
  var libFiles = srcFiles.concat(thirdPartyFiles);
  var fullLibFiles = [].concat(srcFiles, extraFiles, thirdPartyFiles);

  grunt.initConfig({
    jsdoc: {
      docs: {
        src: docsFiles,
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
          'dist/twgl.min.js': libFiles,
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
          'dist/twgl.js': libFiles,
        },
      },
      fullMin: {
        options: {
          mangle: false,
          screwIE8: true,
          banner: license,
          compress: false,
        },
        files: {
          'dist/twgl-full.min.js': fullLibFiles,
        },
      },
      fullMax: {
        options: {
          mangle: false,
          screwIE8: true,
          banner: license,
          compress: false,
        },
        files: {
          'dist/twgl-full.js': fullLibFiles,
        },
      },
    },
    clean: [
      'docs',
      'dist',
    ],
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('makeindex', function() {
    var marked  = require('marked');
    var fs      = require('fs');
    marked.setOptions({ rawHtml: true });
    var html = marked(fs.readFileSync('README.md', {encoding: 'utf8'}));
    var template = fs.readFileSync('templates/index.template', {encoding: 'utf8'});
    var content = replaceParams(template, {
      content: html,
      license: license,
      srcFileName: 'README.md',
      title: 'TWGL.js',
    });
    fs.writeFileSync('index.html', content);
  });

  grunt.registerTask('default', ['clean', 'uglify', 'makeindex', 'jsdoc']);
};

