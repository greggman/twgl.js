"use strict";

const path   = require('path');
const fs     = require('fs');
const semver = require('semver');
const webpack = require('webpack');

var plugins = require('webpack-load-plugins')();

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), {encoding: 'utf8'}));
const verDir  = /^(\d+\.)/.exec(pkg.version)[1] + 'x';

function getLicense(pkg) {
  return `@license twgl.js ${pkg.version} Copyright (c) 2015, Gregg Tavares All Rights Reserved.
Available via the MIT license.
see: http://github.com/greggman/twgl.js for details`;
}

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

  require('load-grunt-tasks')(grunt);

  var srcFiles = [
    'src/twgl.js',
    'src/attributes.js',
    'src/draw.js',
    'src/framebuffers.js',
    'src/programs.js',
    'src/textures.js',
    'src/typedarrays.js',
    'src/vertex-arrays.js',
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
//          template: 'build/jsdoc-template/template',
          template: './node_modules/minami',
          outputSourceFiles: false,
        },
      },
    },
    webpack: {
      full: {
        entry: './src/twgl-full.js',
        plugins: [
          new webpack.BannerPlugin(getLicense(pkg)),
        ],
        module: {
          loaders: [
            {
              test: /\.js$/,
              loader: 'babel-loader',
              query: {
                presets: ['stage-0', 'es2015'],
              },
            },
          ],
        },
        output: {
          path: path.join(__dirname, `dist/${verDir}`),
          filename: 'twgl-full.js',
          library: 'twgl',
          libraryTarget: 'umd',
        },
      },
      base: {
        entry: './src/twgl-base.js',
        plugins: [
          new webpack.BannerPlugin(getLicense(pkg)),
        ],
        module: {
          loaders: [
            {
              test: /\.js$/,
              loader: 'babel-loader',
              query: {
                presets: ['stage-0', 'es2015'],
              },
            },
          ],
        },
        output: {
          path: path.join(__dirname, `dist/${verDir}`),
          filename: 'twgl.js',
          library: 'twgl',
          libraryTarget: 'umd',
        },
      },
      fullMin: {
        entry: './src/twgl-full.js',
        plugins: [
          new webpack.BannerPlugin(getLicense(pkg)),
          new webpack.optimize.UglifyJsPlugin({
            compress: {
              warnings: false,
            },
            //mangle: true,
            mangle: {
              props: {
                ignore_quoted: true,
                //regex: /^((?!(createElement|getContext)).)*$/,
                regex: /^(colorRenderable|textureFilterable|bytesPerElement|numColorComponents|textureFormat)$/,
              },
            },
          }),
        ],
        module: {
          loaders: [
            {
              test: /\.js$/,
              loader: 'babel-loader',
              query: {
                presets: ['stage-0', 'es2015'],
              },
            },
          ],
        },
        output: {
          path: path.join(__dirname, `dist/${verDir}`),
          filename: 'twgl-full.min.js',
          library: 'twgl',
          libraryTarget: 'umd',
        },
      },
      baseMin: {
        entry: './src/twgl-base.js',
        plugins: [
          new webpack.BannerPlugin(getLicense(pkg)),
          new webpack.optimize.UglifyJsPlugin({
            compress: {
              warnings: false,
            },
            //mangle: true,
            mangle: {
              props: {
                ignore_quoted: true,
                //regex: /^((?!(createElement|getContext)).)*$/,
                regex: /^(colorRenderable|textureFilterable|bytesPerElement|numColorComponents|textureFormat)$/,
              },
            },
          }),
        ],
        module: {
          loaders: [
            {
              test: /\.js$/,
              loader: 'babel-loader',
              query: {
                presets: ['stage-0', 'es2015'],
              },
            },
          ],
        },
        output: {
          path: path.join(__dirname, `dist/${verDir}`),
          filename: 'twgl.min.js',
          library: 'twgl',
          libraryTarget: 'umd',
        },
      },
    },
    eslint: {
      lib: {
        src: [
          'src/*',
        ],
        options: {
          configFile: 'build/conf/eslint.json',
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
          configFile: 'build/conf/eslint-docs.json',
          //rulesdir: ['build/rules'],
        },
      },
    },
    copy: {
      twgl: {
        src: `dist/${verDir}/twgl.js`,
        dest: `npm/base/dist/${verDir}/twgl.js`,
      },
      readme: {
        src: 'README.md',
        dest: 'npm/base/README.md',
      },
    },
    browserify: {
      example: {
        files: {
          'examples/js/browserified-example.js': ['examples/js/browserify-example.js'],
        },
      },
    },
    clean: {
      dist: [ `dist/${verDir}` ],
      docs: [ 'docs' ],
    },
  });

  grunt.registerTask('makeindex', function() {
    var marked  = require('marked');
    var fs      = require('fs');
    marked.setOptions({ rawHtml: true });
    var html = marked(fs.readFileSync('README.md', {encoding: 'utf8'}));
    var template = fs.readFileSync('build/templates/index.template', {encoding: 'utf8'});
    var content = replaceParams(template, {
      content: html,
      license: getLicense(pkg),
      srcFileName: 'README.md',
      title: 'TWGL.js, a tiny WebGL helper library',
      version: pkg.version,
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

  function bump(type) {
    pkg.version = semver.inc(pkg.version, type);
    fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2));
    var filename = "bower.json";
    var p = JSON.parse(fs.readFileSync(filename, {encoding: "utf8"}));
    p.version = pkg.version;
    fs.writeFileSync(filename, JSON.stringify(p, null, 2));
    grunt.config.set('webpack.full.plugins.0', new webpack.BannerPlugin(getLicense(pkg)));
    grunt.config.set('webpack.base.plugins.0', new webpack.BannerPlugin(getLicense(pkg)));
    grunt.config.set('webpack.fullMin.plugins.0', new webpack.BannerPlugin(getLicense(pkg)));
    grunt.config.set('webpack.baseMin.plugins.0', new webpack.BannerPlugin(getLicense(pkg)));
  }

  grunt.registerTask('bumppatchimpl', function() { bump('patch'); });
  grunt.registerTask('bumpminorimpl', function() { bump('minor'); });
  grunt.registerTask('bumpmajorimpl', function() { bump('major'); });

  grunt.registerTask('versioncheck', function() {
    var fs = require('fs');
    var good = true;
    [
      { filename: `dist/${verDir}/twgl.js`,          fn: getHeaderVersion, },
      { filename: `dist/${verDir}/twgl-full.js`,     fn: getHeaderVersion, },
      { filename: `dist/${verDir}/twgl.min.js`,      fn: getHeaderVersion, },
      { filename: `dist/${verDir}/twgl-full.min.js`, fn: getHeaderVersion, },
      { filename: 'package.json',          fn: getPackageVersion, },
    ].forEach(function(file) {
      var version = file.fn(file.filename);
      if (version !== pkg.version) {
        good = false;
        grunt.log.error("version mis-match in:", file.filename, " Expected:", pkg.version, " Actual:", version);
      }
    });
    return good;
  });

  grunt.registerTask('npmpackage', function() {
    var p = JSON.parse(fs.readFileSync('package.json', {encoding: "utf8"}));
    p.name = "twgl-base.js";
    p.scripts = {};
    p.devDependencies = {};
    p.main = `dist/${verDir}/twgl.js`;
    p.files = [ `dist/${verDir}/twgl.js` ];
    fs.writeFileSync("npm/base/package.json", JSON.stringify(p, null, 2), {encoding: "utf8"});
  });

  grunt.registerTask('docs', [
      'eslint:examples',
      'clean:docs',
      'jsdoc',
      'makeindex',
  ]);
  grunt.registerTask('build', [
      'eslint:lib',
      'clean:dist',
      'webpack',
      'copy',
      'npmpackage',
  ]);
  grunt.registerTask('bumppatch', [
      'eslint:lib',
      'eslint:examples',
      'bumppatchimpl',
      'build',
      'browserify',
      'docs',
  ]);
  grunt.registerTask('bumpminor', [
      'eslint:lib',
      'eslint:examples',
      'bumpminorimpl',
      'build',
      'browserify',
      'docs',
  ]);
  grunt.registerTask('bumpmajor', [
      'eslint:lib',
      'eslint:examples',
      'bumpmajorimpl',
      'build',
      'browserify',
      'docs',
  ]);
  grunt.registerTask('default', 'build');
};

