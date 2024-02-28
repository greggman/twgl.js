/* eslint-env node */
/* eslint no-console: "off" */
/* eslint quotes: ["error", "single"] */

const path   = require('path');
const fs     = require('fs');
const semver = require('semver');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

//require('webpack-load-plugins')();

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), {encoding: 'utf8'}));
const verDir  = /^(\d+\.)/.exec(pkg.version)[1] + 'x';

function getLicense(pkg) {
  return `@license twgl.js ${pkg.version} Copyright (c) 2015, Gregg Tavares All Rights Reserved.
Available via the MIT license.
see: http://github.com/greggman/twgl.js for details`;
}

const replaceHandlers = {};
function registerReplaceHandler(keyword, handler) {  // eslint-disable-line
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
const replaceParams = (function() {
  const replaceParamsRE = /%\(([^)]+)\)s/g;

  return function(str, params) {
    if (!params.length) {
      params = [params];
    }

    return str.replace(replaceParamsRE, function(match, key) {
      const colonNdx = key.indexOf(':');
      if (colonNdx >= 0) {
        /*
        try {
          const args = hanson.parse("{" + key + "}");
          const handlerName = Object.keys(args)[0];
          const handler = replaceHandlers[handlerName];
          if (handler) {
            return handler(args[handlerName]);
          }
          console.error("unknown substition handler: " + handlerName);
        } catch (e) {
          console.error(e);
          console.error("bad substitution: %(" + key + ")s");
        }
        */
        throw new Error('unsupported');
      } else {
        // handle normal substitutions.
        const keys = key.split('.');
        for (let ii = 0; ii < params.length; ++ii) {
          let obj = params[ii];
          for (let jj = 0; jj < keys.length; ++jj) {
            const key = keys[jj];
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
      console.error('unknown key: ' + key);
      return '%(' + key + ')s';
    });
  };
}());

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  const srcFiles = [
    'src/twgl.js',
    'src/attributes.js',
    'src/draw.js',
    'src/framebuffers.js',
    'src/programs.js',
    'src/textures.js',
    'src/typedarrays.js',
    'src/utils.js',
    'src/vertex-arrays.js',
  ];

  const extraFiles = [
    'src/v3.js',
    'src/m4.js',
    'src/primitives.js',
  ];

  const fullFiles = srcFiles.concat(extraFiles);
  const docsFiles = fullFiles.concat('README.md');

  const idRegex = /^(colorRenderable|textureFilterable|bytesPerElement|numColorComponents|textureFormat)$/;

  const babelOptionsForWebpack = {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: [
            ['@babel/plugin-transform-modules-commonjs', {loose: true}],
          ],
        },
      },
    ],
  };

  const optimization = {
    minimizer: [
      new TerserPlugin({
        extractComments: {
          banner: false, //getLicense(pkg),
        },
        terserOptions: {
          output: {
            comments: /@license/i,
          },
          mangle: {
            properties: {
              keep_quoted: true,
              regex: idRegex,
            },
          },
        },
      }),
    ],
  };

  grunt.initConfig({
    jsdoc: {
      docs: {
        src: docsFiles,
        options: {
          destination: 'docs',
          configure: 'build/jsdoc.conf.json',
          template: './build/jsdoc-template',
          outputSourceFiles: false,
        },
      },
      ts: {
        src: fullFiles,
        options: {
          destination: `dist/${verDir}`,
          configure: 'build/jsdoc.conf.json',
          template: './node_modules/tsd-jsdoc/dist',
          outputSourceFiles: false,
        },
      },
    },
    webpack: {
      full: {
        entry: './src/twgl-full.js',
        mode: 'development',
        devtool: 'source-map',
        plugins: [
          new webpack.BannerPlugin({banner: getLicense(pkg)}),
        ],
        module: babelOptionsForWebpack,
        output: {
          path: path.join(__dirname, `dist/${verDir}`),
          filename: 'twgl-full.js',
          library: 'twgl',
          libraryTarget: 'umd',
          globalObject: 'typeof self !== \'undefined\' ? self : this',
        },
      },
      base: {
        entry: './src/twgl-base.js',
        mode: 'development',
        devtool: 'source-map',
        plugins: [
          new webpack.BannerPlugin({banner: getLicense(pkg)}),
        ],
        module: babelOptionsForWebpack,
        output: {
          path: path.join(__dirname, `dist/${verDir}`),
          filename: 'twgl.js',
          library: 'twgl',
          libraryTarget: 'umd',
          globalObject: 'typeof self !== \'undefined\' ? self : this',
        },
      },
      fullMin: {
        entry: './src/twgl-full.js',
        mode: 'production',
        plugins: [
          new webpack.BannerPlugin({banner: getLicense(pkg)}),
        ],
        optimization,
        module: babelOptionsForWebpack,
        output: {
          path: path.join(__dirname, `dist/${verDir}`),
          filename: 'twgl-full.min.js',
          library: 'twgl',
          libraryTarget: 'umd',
          globalObject: 'typeof self !== \'undefined\' ? self : this',
        },
      },
      baseMin: {
        entry: './src/twgl-base.js',
        mode: 'production',
        plugins: [
          new webpack.BannerPlugin({banner: getLicense(pkg)}),
        ],
        optimization,
        module: babelOptionsForWebpack,
        output: {
          path: path.join(__dirname, `dist/${verDir}`),
          filename: 'twgl.min.js',
          library: 'twgl',
          libraryTarget: 'umd',
          globalObject: 'typeof self !== \'undefined\' ? self : this',
        },
      },
    },
    rollup: {
      options: {
        plugins: [
        ],
        format: 'es',
        indent: '  ',
        banner: () => `/* ${getLicense(pkg)} */`,
      },
      full: {
        src: 'src/twgl-full.js',
        dest: `dist/${verDir}/twgl-full.module.js`,
      },
      base: {
        src: 'src/twgl.js',
        dest: `dist/${verDir}/twgl.module.js`,
      },
    },
    eslint: {
      lib: {
        src: [
          'src/*',
          'test/**/*.js',
          '!test/mocha.js',
          '!test/src/ts/**',
        ],
        options: {
          //configFile: 'build/conf/eslint.json',
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
          //configFile: 'build/conf/eslint-docs.json',
          //rulesdir: ['build/rules'],
        },
      },
    },
    copy: {
      twgl: {
        expand: true,
        cwd: `dist/${verDir}/`,
        src: [
          'twgl.js',
          'twgl.module.js',
          'twgl.d.ts',
          'twgl.js.map',
        ],
        dest: `npm/base/dist/${verDir}/`,
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
    ts: {
      example: {
        src: ['examples/*.ts'],
        options: {
          module: 'umd',
        },
      },
    },
  });

  grunt.registerTask('makeindex', function() {
    const {marked} = require('marked');
    const fs       = require('fs');
    const html = marked.parse(fs.readFileSync('README.md', {encoding: 'utf8'}));
    const template = fs.readFileSync('build/templates/index.template', {encoding: 'utf8'});
    let content = replaceParams(template, {
      content: html,
      license: getLicense(pkg),
      srcFileName: 'README.md',
      title: 'TWGL.js, a tiny WebGL helper library',
      version: pkg.version,
    });
    content = content.replace(/href="http:\/\/twgljs.org\//g, 'href="/');
    fs.writeFileSync('index.html', content);
  });

  function getHeaderVersion(filename) {
    const twglVersionRE = / (\d+\.\d+\.\d+) /;
    return twglVersionRE.exec(fs.readFileSync(filename, {encoding: 'utf8'}))[1];
  }

  function getPackageVersion(filename) {
    return JSON.parse(fs.readFileSync(filename, {encoding: 'utf8'})).version;
  }

  function bump(type) {
    pkg.version = semver.inc(pkg.version, type);
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    const filename = 'bower.json';
    const p = JSON.parse(fs.readFileSync(filename, {encoding: 'utf8'}));
    p.version = pkg.version;
    fs.writeFileSync(filename, JSON.stringify(p, null, 2));
    grunt.config.set('webpack.full.plugins.0', new webpack.BannerPlugin(getLicense(pkg)));
    grunt.config.set('webpack.base.plugins.0', new webpack.BannerPlugin(getLicense(pkg)));
    grunt.config.set('webpack.fullMin.plugins.0', new webpack.BannerPlugin(getLicense(pkg)));
    grunt.config.set('webpack.baseMin.plugins.0', new webpack.BannerPlugin(getLicense(pkg)));
  }

  grunt.registerTask('bumppatchimpl', function() {
    bump('patch');
  });
  grunt.registerTask('bumpminorimpl', function() {
    bump('minor');
  });
  grunt.registerTask('bumpmajorimpl', function() {
    bump('major');
  });

  grunt.registerTask('versioncheck', function() {
    let good = true;
    [
      { filename: `dist/${verDir}/twgl.js`,          fn: getHeaderVersion, },
      { filename: `dist/${verDir}/twgl-full.js`,     fn: getHeaderVersion, },
      { filename: `dist/${verDir}/twgl.min.js`,      fn: getHeaderVersion, },
      { filename: `dist/${verDir}/twgl-full.min.js`, fn: getHeaderVersion, },
      { filename: 'package.json',          fn: getPackageVersion, },
    ].forEach(function(file) {
      const version = file.fn(file.filename);
      if (version !== pkg.version) {
        good = false;
        grunt.log.error('version mis-match in:', file.filename, ' Expected:', pkg.version, ' Actual:', version);
      }
    });
    return good;
  });

  grunt.registerTask('npmpackage', function() {
    const p = JSON.parse(fs.readFileSync('package.json', {encoding: 'utf8'}));
    p.name = 'twgl-base.js';
    p.scripts = {};
    p.devDependencies = {};
    p.main = `dist/${verDir}/twgl.js`;
    p.module = `dist/${verDir}/twgl.module.js`;
    p.files = [
      `dist/${verDir}/twgl.js`,
      `dist/${verDir}/twgl.module.js`,
      `dist/${verDir}/twgl.js.map`,
      `dist/${verDir}/twgl.d.ts`,
    ];
    fs.writeFileSync('npm/base/package.json', JSON.stringify(p, null, 2), {encoding: 'utf8'});
  });

  grunt.registerTask('tsmunge', function() {
    // Fix up syntax and content issues with the auto-generated
    // TypeScript definitions.
    let content = fs.readFileSync(`dist/${verDir}/types.d.ts`, {encoding: 'utf8'});
    // Remove docstrings (Declarations do not by convention include these)
    //content = content.replace(/\/\*\*[\s\S]*?\*\/\s*/g, '');
    // Docs use "?" to represent an arbitrary type; TS uses "any"
    content = content.replace(/\]: \?/g, ']: any');
    // Docs use "constructor"; TS expects something more like "Function"
    content = content.replace(/: constructor/g, ': Function');
    // What docs call an "augmentedTypedArray" is technically an "ArrayBufferView"
    // albeit with a patched-in "push" method.
    content = content.replace(/\bAugmentedTypedArray\b/g, 'ArrayBufferView');
    // Remove every instance of "module:twgl" and "module:twgl/whatever"
    // Except for "module:twgl.(m4|v3|primitives)" which become just "m4.", etc.
    content = content.replace(/module:twgl(\/(m4|v3|primitives))\./g, '$2.');
    content = content.replace(/module:twgl(\/\w+)?\./g, '');
    // Replace "function", "type" declarations with "export function", "export type"
    content = content.replace(/^(\s*)(function|type) /mg, '$1export $2 ');

    // hack for AttachmentOptions. Should really try to fix tsd-jsdoc to handle @mixins
    content = content.replace('export type AttachmentOptions = {', 'export type AttachmentOptions = TextureOptions & {');

    content = content.replace(/(export type TypedArray =.*?;)/, `
    $1

    export type AugmentedTypedArrayHelper = {
        numComponents: number;
        readonly numElements: number;
        /**
         * Push elements into typed array
         */
        push(...elements: (number |  TypedArray | number[])[]): void;
        /**
         * Reset push cursor
         */
        reset(index?: number): void;
    };

    export type AugmentedTypedArray<T extends TypedArray> = T & AugmentedTypedArrayHelper

    `);

    content = content.replace('export function createAugmentedTypedArray(numComponents: number, numElements: number, opt_type: Function): ArrayBufferView;', `\
    export function createAugmentedTypedArray<T extends TypedArrayConstructor>(numComponents: number, numElements: number, type: T): AugmentedTypedArray<InstanceType<T>>;
    export function createAugmentedTypedArray<T extends Float32Array>(numComponents: number, numElements: number): AugmentedTypedArray<Float32Array>;
    `);

    // Break the file down into a list of modules
    const modules = content.match(/^declare module twgl(\/(\w+))? \{[\s\S]*?^\}/mg);
    // Split into core modules and extra (only in twgl-full) modules
    const coreModules = modules.filter(
      (code) => !code.match(/^declare module twgl\/(m4|v3|primitives)/)
    );
    const extraModules = modules.filter(
      (code) => code.match(/^declare module twgl\/(m4|v3|primitives)/)
    );
    // Build code for the core twgl.js output
    const coreContent = coreModules.map((code) => {
      // Get rid of "declare module twgl/whatever" scope
      code = code.replace(/^declare module twgl(\/\w+)? \{([\s\S]*?)^\}/mg, '$2');
      // De-indent the contents of that scope
      code = code.replace(/^ {4}/mg, '');
      // All done
      return code;
    }).join('\n');
    // Build additional code for the extended twgl-full.js output
    const extraContent = extraModules.map((code) => {
      // Fix "declare module twgl/whatever" statements
      return code.replace(/^declare module twgl(\/(\w+))? \{/m,
        'declare module $2 {'
      );
    }).join('\n');
    // Write twgl-full declarations to destination file
    const fullContent = [coreContent, extraContent].join('\n');
    fs.writeFileSync(`dist/${verDir}/twgl-full.d.ts`, fullContent);
    // Write core declarations to destination file
    fs.writeFileSync(`dist/${verDir}/twgl.d.ts`, coreContent);
    // Remove the auto-generated input file
    fs.unlinkSync(`dist/${verDir}/types.d.ts`);
  });

  grunt.registerTask('docs', [
      'eslint:examples',
      'clean:docs',
      'jsdoc:docs',
      'makeindex',
  ]);
  grunt.registerTask('buildts', [
      'jsdoc:ts',
      'tsmunge',
  ]);
  grunt.registerTask('build', [
      'eslint:lib',
      'clean:dist',
      'webpack',
      'rollup',
      'buildts',
      'ts',
      'copy',
      'docs',
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

