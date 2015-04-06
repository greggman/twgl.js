"use strict";

var license = [
'/**                                                                                       ',
' * @license twgl.js Copyright (c) 2015, Gregg Tavares All Rights Reserved.                ',
' * Available via the MIT.                                                                 ',
' * see: http://github.com/greggman/twgl.js for details                                    ',
' */                                                                                       ',
'/**                                                                                       ',
' * @license almond 0.3.1 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.',
' * Available via the MIT or new BSD license.                                              ',
' * see: http://github.com/jrburke/almond for details                                      ',
' */                                                                                       ',
'',
].map(function(s) { return s.replace(/\s+$/, ''); }).join("\n");

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
          configure: 'build/jsdoc.conf.json',
          template: 'build/jsdoc-template/template',
        },
      },
    },
    requirejs: {
      full: {
        options: {
          baseUrl: "./",
          name: "node_modules/almond/almond.js",
          include: "build/js/twgl-includer-full",
          out: "dist/twgl-full.js",
          optimize: "none",
          wrap: {
            startFile: 'build/js/twgl-start.js',
            endFile: 'build/js/twgl-end.js',
          },
          paths: {
            twgl: 'src',
          }
        },
      },
      small: {
        options: {
          baseUrl: "./",
          name: "node_modules/almond/almond.js",
          include: "build/js/twgl-includer",
          out: "dist/twgl.js",
          optimize: "none",
          wrap: {
            startFile: 'build/js/twgl-start.js',
            endFile: 'build/js/twgl-end.js',
          },
          paths: {
            twgl: 'src',
          }
        },
      },
    },
    uglify: {
      min: {
        options: {
          mangle: true,
          screwIE8: true,
          banner: license,
          compress: true,
        },
        files: {
          'dist/twgl.min.js': ['dist/twgl.js'],
        },
      },
      fullMin: {
        options: {
          mangle: true,
          screwIE8: true,
          banner: license,
          compress: true,
        },
        files: {
          'dist/twgl-full.min.js': ['dist/twgl-full.js'],
        },
      },
    },
    eslint: {
      target: [
        'src',
        'resources/js',
        'examples/js',
      ],
      options: {
        config: 'build/conf/eslint.json',
        rulesdir: ['build/rules'],
      },
    },
    clean: {
      docs: [ 'docs' ],
      dist: [ 'dist' ],
    },
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-jsdoc');

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
    content = content.replace(/href="http\:\/\/twgljs.org\//g, 'href="/');
    fs.writeFileSync('index.html', content);
  });

  grunt.registerTask('docs', ['clean:docs', 'jsdoc', 'makeindex']);
  grunt.registerTask('default', ['eslint', 'clean:dist', 'requirejs', /*'concat',*/ 'uglify']);
};

