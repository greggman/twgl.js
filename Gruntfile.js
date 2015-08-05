"use strict";

var fs     = require('fs');
var semver = require('semver');

var license = [
'/**                                                                                       ',
' * @license twgl.js %(version)s Copyright (c) 2015, Gregg Tavares All Rights Reserved.    ',
' * Available via the MIT license.                                                         ',
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

var bower = JSON.parse(fs.readFileSync('bower.json', {encoding: "utf8"}));

module.exports = function(grunt) {

  function setLicense() {
    var s = replaceParams(license, bower);
    grunt.config.set('uglify.min.options.banner', s);
    grunt.config.set('uglify.fullMin.options.banner', s);
    var start = s + fs.readFileSync('build/js/twgl-start.js', {encoding: "utf8"})
    grunt.config.set('requirejs.full.options.wrap.start', start);
    grunt.config.set('requirejs.small.options.wrap.start', start);
  }

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
            start: '<%= rsStart %>',
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
            start: '<%= rsStart %>',
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
          //screwIE8: true,
          banner: '<%= license %>',
          compress: true,
        },
        files: {
          'dist/twgl.min.js': ['dist/twgl.js'],
        },
      },
      fullMin: {
        options: {
          mangle: true,
          //screwIE8: true,
          banner: '<%= license %>',
          compress: true,
        },
        files: {
          'dist/twgl-full.min.js': ['dist/twgl-full.js'],
        },
      },
    },
    eslint: {
      lib: {
        src: [
          'src/*',
        ],
        options: {
          config: 'build/conf/eslint.json',
          //rulesdir: ['build/rules'],
        },
      },
      examples: {
        src: [
          'resources/js',
          'examples/*.html',
          'examples/js',
        ],
        options: {
          config: 'build/conf/eslint.json',
          //rulesdir: ['build/rules'],
        },
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
  grunt.loadNpmTasks('grunt-contrib-eslint');
  grunt.loadNpmTasks('grunt-jsdoc');

  grunt.registerTask('makeindex', function() {
    var marked  = require('marked');
    var fs      = require('fs');
    marked.setOptions({ rawHtml: true });
    var html = marked(fs.readFileSync('README.md', {encoding: 'utf8'}));
    var template = fs.readFileSync('build/templates/index.template', {encoding: 'utf8'});
    var content = replaceParams(template, {
      content: html,
      license: replaceParams(license, bower),
      srcFileName: 'README.md',
      title: 'TWGL.js, a tiny WebGL helper library',
      version: bower.version,
    });
    content = content.replace(/href="http\:\/\/twgljs.org\//g, 'href="/');
    fs.writeFileSync('index.html', content);
  });

  function getHeaderVersion(filename) {
    var twglVersionRE = / (\d+\.\d+\.\d+) /;
    return twglVersionRE.exec(fs.readFileSync(filename, {encoding: "utf8"}))[1];
  }

  function getPackageVersion(filename) {
    return JSON.parse(fs.readFileSync(filename, {encoding: "utf8"})).version;
  }

  grunt.registerTask('bumpversion', function() {
    bower.version = semver.inc(bower.version, 'patch');
    fs.writeFileSync("bower.json", JSON.stringify(bower, null, 2));
    var filename = "package.json";
    var p = JSON.parse(fs.readFileSync(filename, {encoding: "utf8"}));
    p.version = bower.version;
    fs.writeFileSync(filename, JSON.stringify(p, null, 2));
    setLicense();
  });

  grunt.registerTask('versioncheck', function() {
    var fs = require('fs');
    var good = true;
    [
      { filename: 'dist/twgl.js',          fn: getHeaderVersion, },
      { filename: 'dist/twgl-full.js',     fn: getHeaderVersion, },
      { filename: 'dist/twgl.min.js',      fn: getHeaderVersion, },
      { filename: 'dist/twgl-full.min.js', fn: getHeaderVersion, },
      { filename: 'package.json',          fn: getPackageVersion, },
    ].forEach(function(file) {
      var version = file.fn(file.filename);
      if (version !== bower.version) {
        good = false;
        grunt.log.error("version mis-match in:", file.filename, " Expected:", bower.version, " Actual:", version);
      }
    });
    return good;
  });

  grunt.registerTask('docs', ['eslint:examples', 'clean:docs', 'jsdoc', 'makeindex']);
  grunt.registerTask('build', ['eslint:lib', 'clean:dist', 'requirejs', /*'concat',*/ 'uglify']);
  grunt.registerTask('publish', ['bumpversion', 'build', 'docs']);
  grunt.registerTask('default', 'build');

  setLicense();


};

