/**
 * @license twgl.js 0.0.25 Copyright (c) 2015, Gregg Tavares All Rights Reserved.
 * Available via the MIT license.
 * see: http://github.com/greggman/twgl.js for details
 */
/**
 * @license almond 0.3.1 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.twgl = factory();
    }
}(this, function () {

/**
 * @license almond 0.3.1 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                //Lop off the last part of baseParts, so that . matches the
                //"directory" and not name of the baseName's module. For instance,
                //baseName of "one/two/three", maps to "one/two/three.js", but we
                //want the directory, "one/two" for this normalization.
                name = baseParts.slice(0, baseParts.length - 1).concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("node_modules/almond/almond.js", function(){});

/*
 * Copyright 2015, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of his
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


define('twgl/twgl',[], function () {
  /**
   * The main TWGL module.
   *
   * @module twgl
   */

  var error = window.console && window.console.error ? window.console.error.bind(window.console) : function() { };
  // make sure we don't see a global gl
  var gl = undefined;  // eslint-disable-line
  var defaultAttribPrefix = "";
  var defaultTextureColor = new Uint8Array([128, 192, 255, 255]);
  var defaultTextureOptions = {};

  /* DataType */
  var BYTE                           = 0x1400;
  var UNSIGNED_BYTE                  = 0x1401;
  var SHORT                          = 0x1402;
  var UNSIGNED_SHORT                 = 0x1403;
  var INT                            = 0x1404;
  var UNSIGNED_INT                   = 0x1405;
  var FLOAT                          = 0x1406;

  /* PixelFormat */
  var DEPTH_COMPONENT                = 0x1902;
  var ALPHA                          = 0x1906;
  var RGB                            = 0x1907;
  var RGBA                           = 0x1908;
  var LUMINANCE                      = 0x1909;
  var LUMINANCE_ALPHA                = 0x190A;

  /* Framebuffer Object. */
  var RGBA4                          = 0x8056;
  var RGB5_A1                        = 0x8057;
  var RGB565                         = 0x8D62;
  var DEPTH_COMPONENT16              = 0x81A5;
  var STENCIL_INDEX                  = 0x1901;
  var STENCIL_INDEX8                 = 0x8D48;
  var DEPTH_STENCIL                  = 0x84F9;
  var COLOR_ATTACHMENT0              = 0x8CE0;
  var DEPTH_ATTACHMENT               = 0x8D00;
  var STENCIL_ATTACHMENT             = 0x8D20;
  var DEPTH_STENCIL_ATTACHMENT       = 0x821A;

  /* TextureWrapMode */
  var REPEAT                         = 0x2901;  // eslint-disable-line
  var CLAMP_TO_EDGE                  = 0x812F;
  var MIRRORED_REPEAT                = 0x8370;  // eslint-disable-line

  /* TextureMagFilter */
  var NEAREST                        = 0x2600;  // eslint-disable-line
  var LINEAR                         = 0x2601;

  /* TextureMinFilter */
  var NEAREST_MIPMAP_NEAREST         = 0x2700;  // eslint-disable-line
  var LINEAR_MIPMAP_NEAREST          = 0x2701;  // eslint-disable-line
  var NEAREST_MIPMAP_LINEAR          = 0x2702;  // eslint-disable-line
  var LINEAR_MIPMAP_LINEAR           = 0x2703;  // eslint-disable-line

  /**
   * Sets the default texture color.
   *
   * The default texture color is used when loading textures from
   * urls. Because the URL will be loaded async we'd like to be
   * able to use the texture immediately. By putting a 1x1 pixel
   * color in the texture we can start using the texture before
   * the URL has loaded.
   *
   * @param {number[]} color Array of 4 values in the range 0 to 1
   * @memberOf module:twgl
   */
  function setDefaultTextureColor(color) {
    defaultTextureColor = new Uint8Array([color[0] * 255, color[1] * 255, color[2] * 255, color[3] * 255]);
  }

  /**
   * Sets the default attrib prefix
   *
   * When writing shaders I prefer to name attributes with `a_`, uniforms with `u_` and varyings with `v_`
   * as it makes it clear where they came from. But, when building geometry I prefer using unprefixed names.
   *
   * In otherwords I'll create arrays of geometry like this
   *
   *     var arrays = {
   *       position: ...
   *       normal: ...
   *       texcoord: ...
   *     };
   *
   * But need those mapped to attributes and my attributes start with `a_`.
   *
   * @param {string} prefix prefix for attribs
   * @memberOf module:twgl
   */
  function setAttributePrefix(prefix) {
    defaultAttribPrefix = prefix;
  }

  /**
   * Gets a string for gl enum
   *
   * Note: Several enums are the same. Without more
   * context (which function) it's impossible to always
   * give the correct enum.
   *
   * @param {WebGLRenderingContext} gl A WebGLRenderingContext
   * @param {number} value the value of the enum you want to look up.
   */
  var glEnumToString = (function() {
    var enums;

    function init(gl) {
      if (!enums) {
        enums = {};
        Object.keys(gl).forEach(function(key) {
          if (typeof gl[key] === 'number') {
            enums[gl[key]] = key;
          }
        });
      }
    }

    return function glEnumToString(gl, value) {
      init();
      return enums[value] || ("0x" + value.toString(16));
    };
  }());

  /**
   * Creates a webgl context.
   * @param {HTMLCanvasElement} canvas The canvas tag to get
   *     context from. If one is not passed in one will be
   *     created.
   * @return {WebGLRenderingContext} The created context.
   */
  function create3DContext(canvas, opt_attribs) {
    var names = ["webgl", "experimental-webgl"];
    var context = null;
    for (var ii = 0; ii < names.length; ++ii) {
      try {
        context = canvas.getContext(names[ii], opt_attribs);
      } catch(e) {}  // eslint-disable-line
      if (context) {
        break;
      }
    }
    return context;
  }

  /**
   * Gets a WebGL context.
   * @param {HTMLCanvasElement} canvas a canvas element.
   * @param {WebGLContextCreationAttirbutes} [opt_attribs] optional webgl context creation attributes
   * @memberOf module:twgl
   */
  function getWebGLContext(canvas, opt_attribs) {
    var gl = create3DContext(canvas, opt_attribs);
    return gl;
  }

  /**
   * Error Callback
   * @callback ErrorCallback
   * @param {string} msg error message.
   * @memberOf module:twgl
   */

  function addLineNumbers(src) {
    return src.split("\n").map(function(line, ndx) {
      return (ndx + 1) + ": " + line;
    }).join("\n");
  }

  /**
   * Loads a shader.
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
   * @param {string} shaderSource The shader source.
   * @param {number} shaderType The type of shader.
   * @param {module:twgl.ErrorCallback} opt_errorCallback callback for errors.
   * @return {WebGLShader} The created shader.
   */
  function loadShader(gl, shaderSource, shaderType, opt_errorCallback) {
    var errFn = opt_errorCallback || error;
    // Create the shader object
    var shader = gl.createShader(shaderType);

    // Load the shader source
    gl.shaderSource(shader, shaderSource);

    // Compile the shader
    gl.compileShader(shader);

    // Check the compile status
    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      // Something went wrong during compilation; get the error
      var lastError = gl.getShaderInfoLog(shader);
      errFn(addLineNumbers(shaderSource) + "\n*** Error compiling shader: " + lastError);
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  /**
   * Creates a program, attaches shaders, binds attrib locations, links the
   * program and calls useProgram.
   * @param {WebGLShader[]} shaders The shaders to attach
   * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
   * @param {module:twgl.ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
   *        on error. If you want something else pass an callback. It's passed an error message.
   * @return {WebGLProgram?} the created program or null if error.
   * @memberOf module:twgl
   */
  function createProgram(
      gl, shaders, opt_attribs, opt_locations, opt_errorCallback) {
    var errFn = opt_errorCallback || error;
    var program = gl.createProgram();
    shaders.forEach(function(shader) {
      gl.attachShader(program, shader);
    });
    if (opt_attribs) {
      opt_attribs.forEach(function(attrib,  ndx) {
        gl.bindAttribLocation(
            program,
            opt_locations ? opt_locations[ndx] : ndx,
            attrib);
      });
    }
    gl.linkProgram(program);

    // Check the link status
    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        // something went wrong with the link
        var lastError = gl.getProgramInfoLog(program);
        errFn("Error in program linking:" + lastError);

        gl.deleteProgram(program);
        return null;
    }
    return program;
  }

  /**
   * Loads a shader from a script tag.
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
   * @param {string} scriptId The id of the script tag.
   * @param {number} [opt_shaderType] The type of shader. If not passed in it will
   *     be derived from the type of the script tag.
   * @param {module:twgl.ErrorCallback} [opt_errorCallback] callback for errors.
   * @return {WebGLShader?} The created shader or null if error.
   */
  function createShaderFromScript(
      gl, scriptId, opt_shaderType, opt_errorCallback) {
    var shaderSource = "";
    var shaderType;
    var shaderScript = document.getElementById(scriptId);
    if (!shaderScript) {
      throw "*** Error: unknown script element" + scriptId;
    }
    shaderSource = shaderScript.text;

    if (!opt_shaderType) {
      if (shaderScript.type === "x-shader/x-vertex") {
        shaderType = gl.VERTEX_SHADER;
      } else if (shaderScript.type === "x-shader/x-fragment") {
        shaderType = gl.FRAGMENT_SHADER;
      } else if (shaderType !== gl.VERTEX_SHADER && shaderType !== gl.FRAGMENT_SHADER) {
        throw "*** Error: unknown shader type";
      }
    }

    return loadShader(
        gl, shaderSource, opt_shaderType ? opt_shaderType : shaderType,
        opt_errorCallback);
  }

  var defaultShaderType = [
    "VERTEX_SHADER",
    "FRAGMENT_SHADER",
  ];

  /**
   * Creates a program from 2 script tags.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext
   *        to use.
   * @param {string[]} shaderScriptIds Array of ids of the script
   *        tags for the shaders. The first is assumed to be the
   *        vertex shader, the second the fragment shader.
   * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
   * @param {module:twgl.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
   *        on error. If you want something else pass an callback. It's passed an error message.
   * @return {WebGLProgram} The created program.
   * @memberOf module:twgl
   */
  function createProgramFromScripts(
      gl, shaderScriptIds, opt_attribs, opt_locations, opt_errorCallback) {
    var shaders = [];
    for (var ii = 0; ii < shaderScriptIds.length; ++ii) {
      var shader = createShaderFromScript(
          gl, shaderScriptIds[ii], gl[defaultShaderType[ii]], opt_errorCallback);
      if (!shader) {
        return null;
      }
      shaders.push(shader);
    }
    return createProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback);
  }

  /**
   * Creates a program from 2 sources.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext
   *        to use.
   * @param {string[]} shaderSourcess Array of sources for the
   *        shaders. The first is assumed to be the vertex shader,
   *        the second the fragment shader.
   * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
   * @param {module:twgl.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
   *        on error. If you want something else pass an callback. It's passed an error message.
   * @return {WebGLProgram} The created program.
   * @memberOf module:twgl
   */
  function createProgramFromSources(
      gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback) {
    var shaders = [];
    for (var ii = 0; ii < shaderSources.length; ++ii) {
      var shader = loadShader(
          gl, shaderSources[ii], gl[defaultShaderType[ii]], opt_errorCallback);
      if (!shader) {
        return null;
      }
      shaders.push(shader);
    }
    return createProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback);
  }

  /**
   * Returns the corresponding bind point for a given sampler type
   */
  function getBindPointForSamplerType(gl, type) {
    if (type === gl.SAMPLER_2D) {
      return gl.TEXTURE_2D;
    }
    if (type === gl.SAMPLER_CUBE) {
      return gl.TEXTURE_CUBE_MAP;
    }
  }

  /**
   * @typedef {Object.<string,function>} Setters
   */

  /**
   * Creates setter functions for all uniforms of a shader
   * program.
   *
   * @see {@link module:twgl.setUniforms}
   *
   * @param {WebGLProgram} program the program to create setters for.
   * @returns {Object.<string, function>} an object with a setter by name for each uniform
   * @memberOf module:twgl
   */
  function createUniformSetters(gl, program) {
    var textureUnit = 0;

    /**
     * Creates a setter for a uniform of the given program with it's
     * location embedded in the setter.
     * @param {WebGLProgram} program
     * @param {WebGLUniformInfo} uniformInfo
     * @returns {function} the created setter.
     */
    function createUniformSetter(program, uniformInfo) {
      var location = gl.getUniformLocation(program, uniformInfo.name);
      var type = uniformInfo.type;
      // Check if this uniform is an array
      var isArray = (uniformInfo.size > 1 && uniformInfo.name.substr(-3) === "[0]");
      if (type === gl.FLOAT && isArray) {
        return function(v) {
          gl.uniform1fv(location, v);
        };
      }
      if (type === gl.FLOAT) {
        return function(v) {
          gl.uniform1f(location, v);
        };
      }
      if (type === gl.FLOAT_VEC2) {
        return function(v) {
          gl.uniform2fv(location, v);
        };
      }
      if (type === gl.FLOAT_VEC3) {
        return function(v) {
          gl.uniform3fv(location, v);
        };
      }
      if (type === gl.FLOAT_VEC4) {
        return function(v) {
          gl.uniform4fv(location, v);
        };
      }
      if (type === gl.INT && isArray) {
        return function(v) {
          gl.uniform1iv(location, v);
        };
      }
      if (type === gl.INT) {
        return function(v) {
          gl.uniform1i(location, v);
        };
      }
      if (type === gl.INT_VEC2) {
        return function(v) {
          gl.uniform2iv(location, v);
        };
      }
      if (type === gl.INT_VEC3) {
        return function(v) {
          gl.uniform3iv(location, v);
        };
      }
      if (type === gl.INT_VEC4) {
        return function(v) {
          gl.uniform4iv(location, v);
        };
      }
      if (type === gl.BOOL) {
        return function(v) {
          gl.uniform1iv(location, v);
        };
      }
      if (type === gl.BOOL_VEC2) {
        return function(v) {
          gl.uniform2iv(location, v);
        };
      }
      if (type === gl.BOOL_VEC3) {
        return function(v) {
          gl.uniform3iv(location, v);
        };
      }
      if (type === gl.BOOL_VEC4) {
        return function(v) {
          gl.uniform4iv(location, v);
        };
      }
      if (type === gl.FLOAT_MAT2) {
        return function(v) {
          gl.uniformMatrix2fv(location, false, v);
        };
      }
      if (type === gl.FLOAT_MAT3) {
        return function(v) {
          gl.uniformMatrix3fv(location, false, v);
        };
      }
      if (type === gl.FLOAT_MAT4) {
        return function(v) {
          gl.uniformMatrix4fv(location, false, v);
        };
      }
      if ((type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) && isArray) {
        var units = [];
        for (var ii = 0; ii < uniformInfo.size; ++ii) {
          units.push(textureUnit++);
        }
        return function(bindPoint, units) {
          return function(textures) {
            gl.uniform1iv(location, units);
            textures.forEach(function(texture, index) {
              gl.activeTexture(gl.TEXTURE0 + units[index]);
              gl.bindTexture(bindPoint, texture);
            });
          };
        }(getBindPointForSamplerType(gl, type), units);
      }
      if (type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) {
        return function(bindPoint, unit) {
          return function(texture) {
            gl.uniform1i(location, unit);
            gl.activeTexture(gl.TEXTURE0 + unit);
            gl.bindTexture(bindPoint, texture);
          };
        }(getBindPointForSamplerType(gl, type), textureUnit++);
      }
      throw ("unknown type: 0x" + type.toString(16)); // we should never get here.
    }

    var uniformSetters = { };
    var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

    for (var ii = 0; ii < numUniforms; ++ii) {
      var uniformInfo = gl.getActiveUniform(program, ii);
      if (!uniformInfo) {
        break;
      }
      var name = uniformInfo.name;
      // remove the array suffix.
      if (name.substr(-3) === "[0]") {
        name = name.substr(0, name.length - 3);
      }
      var setter = createUniformSetter(program, uniformInfo);
      uniformSetters[name] = setter;
    }
    return uniformSetters;
  }

  /**
   * Set uniforms and binds related textures.
   *
   * example:
   *
   *     var programInfo = createProgramInfo(
   *         gl, ["some-vs", "some-fs");
   *
   *     var tex1 = gl.createTexture();
   *     var tex2 = gl.createTexture();
   *
   *     ... assume we setup the textures with data ...
   *
   *     var uniforms = {
   *       u_someSampler: tex1,
   *       u_someOtherSampler: tex2,
   *       u_someColor: [1,0,0,1],
   *       u_somePosition: [0,1,1],
   *       u_someMatrix: [
   *         1,0,0,0,
   *         0,1,0,0,
   *         0,0,1,0,
   *         0,0,0,0,
   *       ],
   *     };
   *
   *     gl.useProgram(program);
   *
   * This will automatically bind the textures AND set the
   * uniforms.
   *
   *     setUniforms(programInfo, uniforms);
   *
   * For the example above it is equivalent to
   *
   *     var texUnit = 0;
   *     gl.activeTexture(gl.TEXTURE0 + texUnit);
   *     gl.bindTexture(gl.TEXTURE_2D, tex1);
   *     gl.uniform1i(u_someSamplerLocation, texUnit++);
   *     gl.activeTexture(gl.TEXTURE0 + texUnit);
   *     gl.bindTexture(gl.TEXTURE_2D, tex2);
   *     gl.uniform1i(u_someSamplerLocation, texUnit++);
   *     gl.uniform4fv(u_someColorLocation, [1, 0, 0, 1]);
   *     gl.uniform3fv(u_somePositionLocation, [0, 1, 1]);
   *     gl.uniformMatrix4fv(u_someMatrix, false, [
   *         1,0,0,0,
   *         0,1,0,0,
   *         0,0,1,0,
   *         0,0,0,0,
   *       ]);
   *
   * Note it is perfectly reasonable to call `setUniforms` multiple times. For example
   *
   *     var uniforms = {
   *       u_someSampler: tex1,
   *       u_someOtherSampler: tex2,
   *     };
   *
   *     var moreUniforms {
   *       u_someColor: [1,0,0,1],
   *       u_somePosition: [0,1,1],
   *       u_someMatrix: [
   *         1,0,0,0,
   *         0,1,0,0,
   *         0,0,1,0,
   *         0,0,0,0,
   *       ],
   *     };
   *
   *     setUniforms(programInfo, uniforms);
   *     setUniforms(programInfo, moreUniforms);
   *
   * @param {(module:twgl.ProgramInfo|Object.<string, function>)} setters a `ProgramInfo` as returned from `createProgramInfo` or the setters returned from
   *        `createUniformSetters`.
   * @param {Object.<string, ?>} values an object with values for the
   *        uniforms.
   *   You can pass multiple objects by putting them in an array or by calling with more arguments.For example
   *
   *     var sharedUniforms = {
   *       u_fogNear: 10,
   *       u_projection: ...
   *       ...
   *     };
   *
   *     var localUniforms = {
   *       u_world: ...
   *       u_diffuseColor: ...
   *     };
   *
   *     twgl.setUniforms(programInfo, sharedUniforms, localUniforms);
   *
   *     // is the same as
   *
   *     twgl.setUniforms(programInfo, [sharedUniforms, localUniforms]);
   *
   *     // is the same as
   *
   *     twgl.setUniforms(programInfo, sharedUniforms);
   *     twgl.setUniforms(programInfo, localUniforms};
   *
   * @memberOf module:twgl
   */
  function setUniforms(setters, values) {  // eslint-disable-line
    setters = setters.uniformSetters || setters;
    var numArgs = arguments.length;
    for (var andx = 1; andx < numArgs; ++andx) {
      var vals = arguments[andx];
      if (Array.isArray(vals)) {
        var numValues = vals.length;
        for (var ii = 0; ii < numValues; ++ii) {
          setUniforms(setters, vals[ii]);
        }
      } else {
        for (var name in vals) {
          var setter = setters[name];
          if (setter) {
            setter(vals[name]);
          }
        }
      }
    }
  }

  /**
   * Creates setter functions for all attributes of a shader
   * program. You can pass this to {@link module:twgl.setBuffersAndAttributes} to set all your buffers and attributes.
   *
   * @see {@link module:twgl.setAttributes} for example
   * @param {WebGLProgram} program the program to create setters for.
   * @return {Object.<string, function>} an object with a setter for each attribute by name.
   * @memberOf module:twgl
   */
  function createAttributeSetters(gl, program) {
    var attribSetters = {
    };

    function createAttribSetter(index) {
      return function(b) {
          gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
          gl.enableVertexAttribArray(index);
          gl.vertexAttribPointer(
              index, b.numComponents || b.size, b.type || gl.FLOAT, b.normalize || false, b.stride || 0, b.offset || 0);
        };
    }

    var numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (var ii = 0; ii < numAttribs; ++ii) {
      var attribInfo = gl.getActiveAttrib(program, ii);
      if (!attribInfo) {
        break;
      }
      var index = gl.getAttribLocation(program, attribInfo.name);
      attribSetters[attribInfo.name] = createAttribSetter(index);
    }

    return attribSetters;
  }

  /**
   * Sets attributes and binds buffers (deprecated... use {@link module:twgl.setBuffersAndAttributes})
   *
   * Example:
   *
   *     var program = createProgramFromScripts(
   *         gl, ["some-vs", "some-fs");
   *
   *     var attribSetters = createAttributeSetters(program);
   *
   *     var positionBuffer = gl.createBuffer();
   *     var texcoordBuffer = gl.createBuffer();
   *
   *     var attribs = {
   *       a_position: {buffer: positionBuffer, numComponents: 3},
   *       a_texcoord: {buffer: texcoordBuffer, numComponents: 2},
   *     };
   *
   *     gl.useProgram(program);
   *
   * This will automatically bind the buffers AND set the
   * attributes.
   *
   *     setAttributes(attribSetters, attribs);
   *
   * Properties of attribs. For each attrib you can add
   * properties:
   *
   * *   type: the type of data in the buffer. Default = gl.FLOAT
   * *   normalize: whether or not to normalize the data. Default = false
   * *   stride: the stride. Default = 0
   * *   offset: offset into the buffer. Default = 0
   *
   * For example if you had 3 value float positions, 2 value
   * float texcoord and 4 value uint8 colors you'd setup your
   * attribs like this
   *
   *     var attribs = {
   *       a_position: {buffer: positionBuffer, numComponents: 3},
   *       a_texcoord: {buffer: texcoordBuffer, numComponents: 2},
   *       a_color: {
   *         buffer: colorBuffer,
   *         numComponents: 4,
   *         type: gl.UNSIGNED_BYTE,
   *         normalize: true,
   *       },
   *     };
   *
   * @param {Object.<string, function>} setters Attribute setters as returned from createAttributeSetters
   * @param {Object.<string, module:twgl.AttribInfo>} buffers AttribInfos mapped by attribute name.
   * @memberOf module:twgl
   * @deprecated use {@link module:twgl.setBuffersAndAttributes}
   */
  function setAttributes(setters, buffers) {
    for (var name in buffers) {
      var setter = setters[name];
      if (setter) {
        setter(buffers[name]);
      }
    }
  }

  /**
   * Sets attributes and buffers including the `ELEMENT_ARRAY_BUFFER` if appropriate
   *
   * Example:
   *
   *     var programInfo = createProgramInfo(
   *         gl, ["some-vs", "some-fs");
   *
   *     var arrays = {
   *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
   *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
   *     };
   *
   *     var bufferInfo = createBufferInfoFromArrays(gl, arrays);
   *
   *     gl.useProgram(programInfo.program);
   *
   * This will automatically bind the buffers AND set the
   * attributes.
   *
   *     setBuffersAndAttributes(gl, programInfo, bufferInfo);
   *
   * For the example above it is equivilent to
   *
   *     gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
   *     gl.enableVertexAttribArray(a_positionLocation);
   *     gl.vertexAttribPointer(a_positionLocation, 3, gl.FLOAT, false, 0, 0);
   *     gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
   *     gl.enableVertexAttribArray(a_texcoordLocation);
   *     gl.vertexAttribPointer(a_texcoordLocation, 4, gl.FLOAT, false, 0, 0);
   *
   * @param {WebGLRenderingContext} gl A WebGLRenderingContext.
   * @param {(module:twgl.ProgramInfo|Object.<string, function>)} setters A `ProgramInfo` as returned from `createProgrmaInfo` Attribute setters as returned from `createAttributeSetters`
   * @param {module:twgl.BufferInfo} buffers a BufferInfo as returned from `createBufferInfoFromArrays`.
   * @memberOf module:twgl
   */
  function setBuffersAndAttributes(gl, programInfo, buffers) {
    setAttributes(programInfo.attribSetters || programInfo, buffers.attribs);
    if (buffers.indices) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    }
  }

  /**
   * @typedef {Object} ProgramInfo
   * @property {WebGLProgram} program A shader program
   * @property {Object<string, function>} uniformSetters object of setters as returned from createUniformSetters,
   * @property {Object<string, function>} attribSetters object of setters as returned from createAttribSetters,
   * @memberOf module:twgl
   */

  /**
   * Creates a ProgramInfo from 2 sources.
   *
   * A ProgramInfo contains
   *
   *     programInfo = {
   *        program: WebGLProgram,
   *        uniformSetters: object of setters as returned from createUniformSetters,
   *        attribSetters: object of setters as returned from createAttribSetters,
   *     }
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext
   *        to use.
   * @param {string[]} shaderSourcess Array of sources for the
   *        shaders or ids. The first is assumed to be the vertex shader,
   *        the second the fragment shader.
   * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
   * @param {module:twgl.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
   *        on error. If you want something else pass an callback. It's passed an error message.
   * @return {module:twgl.ProgramInfo?} The created program.
   * @memberOf module:twgl
   */
  function createProgramInfo(
      gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback) {
    shaderSources = shaderSources.map(function(source) {
      var script = document.getElementById(source);
      return script ? script.text : source;
    });
    var program = createProgramFromSources(gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback);
    if (!program) {
      return null;
    }
    var uniformSetters = createUniformSetters(gl, program);
    var attribSetters = createAttributeSetters(gl, program);
    return {
      program: program,
      uniformSetters: uniformSetters,
      attribSetters: attribSetters,
    };
  }

  /**
   * Resize a canvas to match the size it's displayed.
   * @param {HTMLCanvasElement} canvas The canvas to resize.
   * @param {number} [a] multiplier. So you can pass in `window.devicePixelRatio` if you want to.
   * @return {boolean} true if the canvas was resized.
   * @memberOf module:twgl
   */
  function resizeCanvasToDisplaySize(canvas, multiplier) {
    multiplier = multiplier || 1;
    multiplier = Math.max(1, multiplier);
    var width  = canvas.clientWidth  * multiplier | 0;
    var height = canvas.clientHeight * multiplier | 0;
    if (canvas.width !== width ||
        canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      return true;
    }
    return false;
  }

  function createBufferFromTypedArray(gl, array, type, drawType) {
    if (array instanceof WebGLBuffer) {
      return array;
    }
    type = type || gl.ARRAY_BUFFER;
    var buffer = gl.createBuffer();
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, array, drawType || gl.STATIC_DRAW);
    return buffer;
  }

  function isIndices(name) {
    return name === "indices";
  }

  function getGLTypeForTypedArray(typedArray) {
    if (typedArray instanceof Int8Array)    { return BYTE; }           // eslint-disable-line
    if (typedArray instanceof Uint8Array)   { return UNSIGNED_BYTE; }  // eslint-disable-line
    if (typedArray instanceof Int16Array)   { return SHORT; }          // eslint-disable-line
    if (typedArray instanceof Uint16Array)  { return UNSIGNED_SHORT; } // eslint-disable-line
    if (typedArray instanceof Int32Array)   { return INT; }            // eslint-disable-line
    if (typedArray instanceof Uint32Array)  { return UNSIGNED_INT; }   // eslint-disable-line
    if (typedArray instanceof Float32Array) { return FLOAT; }          // eslint-disable-line
    throw "unsupported typed array type";
  }

  function getTypedArrayTypeForGLType(gl, type) {
    switch (type) {
      case gl.BYTE:           return Int8Array;     // eslint-disable-line
      case gl.UNSIGNED_BYTE:  return Uint8Array;    // eslint-disable-line
      case gl.SHORT:          return Int16Array;    // eslint-disable-line
      case gl.UNSIGNED_SHORT: return Uint16Array;   // eslint-disable-line
      case gl.INT:            return Int32Array;    // eslint-disable-line
      case gl.UNSIGNED_INT:   return Uint32Array;   // eslint-disable-line
      case gl.FLOAT:          return Float32Array;  // eslint-disable-line
      default:
        throw "unknown gl type";
    }
  }

  // This is really just a guess. Though I can't really imagine using
  // anything else? Maybe for some compression?
  function getNormalizationForTypedArray(typedArray) {
    if (typedArray instanceof Int8Array)    { return true; }  // eslint-disable-line
    if (typedArray instanceof Uint8Array)   { return true; }  // eslint-disable-line
    return false;
  }

  function isArrayBuffer(a) {
    return a && a.buffer && a.buffer instanceof ArrayBuffer;
  }

  function guessNumComponentsFromName(name, length) {
    var numComponents;
    if (name.indexOf("coord") >= 0) {
      numComponents = 2;
    } else if (name.indexOf("color") >= 0) {
      numComponents = 4;
    } else {
      numComponents = 3;  // position, normals, indices ...
    }

    if (length % numComponents > 0) {
      throw "can not guess numComponents. You should specify it.";
    }

    return numComponents;
  }

  function makeTypedArray(array, name) {
    if (isArrayBuffer(array)) {
      return array;
    }

    if (isArrayBuffer(array.data)) {
      return array.data;
    }

    if (Array.isArray(array)) {
      array = {
        data: array,
      };
    }

    var Type = array.type;
    if (!Type) {
      if (name === "indices") {
        Type = Uint16Array;
      } else {
        Type = Float32Array;
      }
    }
    return new Type(array.data);
  }

  /**
   * The info for an attribute. This is effectively just the arguments to `gl.vertexAttribPointer` plus the WebGLBuffer
   * for the attribute.
   *
   * @typedef {Object} AttribInfo
   * @property {number} [numComponents] the number of components for this attribute.
   * @property {number} [size] synonym for `numComponents`.
   * @property {number} [type] the type of the attribute (eg. `gl.FLOAT`, `gl.UNSIGNED_BYTE`, etc...) Default = `gl.FLOAT`
   * @property {boolean} [normalized] whether or not to normalize the data. Default = false
   * @property {number} [offset] offset into buffer in bytes. Default = 0
   * @property {number} [stride] the stride in bytes per element. Default = 0
   * @property {WebGLBuffer} buffer the buffer that contains the data for this attribute
   * @memberOf module:twgl
   */

  /**
   * Use this type of array spec when TWGL can't guess the type or number of compoments of an array
   * @typedef {Object} FullArraySpec
   * @property {(number[]|ArrayBuffer)} data The data of the array.
   * @property {number} [numComponents] number of components for `vertexAttribPointer`. Default is based on the name of the array.
   *    If `coord` is in the name assumes `numComponents = 2`.
   *    If `color` is in the name assumes `numComponents = 4`.
   *    otherwise assumes `numComponents = 3`
   * @property {constructor} type The type. This is only used if `data` is a JavaScript array. It is the constructor for the typedarray. (eg. `Uint8Array`).
   * For example if you want colors in a `Uint8Array` you might have a `FullArraySpec` like `{ type: Uint8Array, data: [255,0,255,255, ...], }`.
   * @property {number} [size] synonym for `numComponents`.
   * @property {boolean} [normalize] normalize for `vertexAttribPointer`. Default is true if type is `Int8Array` or `Uint8Array` otherwise false.
   * @property {number} [stride] stride for `vertexAttribPointer`. Default = 0
   * @property {number} [offset] offset for `vertexAttribPointer`. Default = 0
   * @property {string} [attrib] name of attribute this array maps to. Defaults to same name as array + defaultAttribPrefix.
   * @property {string} [name] synonym for `attrib`.
   * @property {string} [attribName] synonym for `attrib`.
   * @memberOf module:twgl
   */

  /**
   * An individual array in {@link module:twgl.Arrays}
   *
   * When passed to {@link module:twgl.createBufferInfoFromArrays} if an ArraySpec is `number[]` or `ArrayBuffer`
   * the types will be guessed based on the name. `indices` will be `Uint16Array`, everything else will
   * be `Float32Array`
   *
   * @typedef {(number[]|ArrayBuffer|module:twgl.FullArraySpec)} ArraySpec
   * @memberOf module:twgl
   */

  /**
   * This is a JavaScript object of arrays by name. The names should match your shader's attributes. If your
   * attributes have a common prefix you can specify it by calling {@link module:twgl.setAttributePrefix}.
   *
   *     Bare JavaScript Arrays
   *
   *         var arrays = {
   *            position: [-1, 1, 0],
   *            normal: [0, 1, 0],
   *            ...
   *         }
   *
   *     Bare TypedArrays
   *
   *         var arrays = {
   *            position: new Float32Array([-1, 1, 0]),
   *            color: new Uint8Array([255, 128, 64, 255]),
   *            ...
   *         }
   *
   * *   Will guess at `numComponents` if not specified based on name.
   *
   *     If `coord` is in the name assumes `numComponents = 2`
   *
   *     If `color` is in the name assumes `numComponents = 4`
   *
   *     otherwise assumes `numComponents = 3`
   *
   * Objects with various fields. See {@link module:twgl.FullArraySpec}.
   *
   *     var arrays = {
   *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
   *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
   *       normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
   *       indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
   *     };
   *
   * @typedef {Object.<string, module:twgl.ArraySpec>} Arrays
   * @memberOf module:twgl
   */


  /**
   * Creates a set of attribute data and WebGLBuffers from set of arrays
   *
   * Given
   *
   *      var arrays = {
   *        position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
   *        texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
   *        normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
   *        color:    { numComponents: 4, data: [255, 255, 255, 255, 255, 0, 0, 255, 0, 0, 255, 255], type: Uint8Array, },
   *        indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
   *      };
   *
   * returns something like
   *
   *      var attribs = {
   *        position: { numComponents: 3, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
   *        texcoord: { numComponents: 2, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
   *        normal:   { numComponents: 3, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
   *        color:    { numComponents: 4, type: gl.UNSIGNED_BYTE, normalize: true,  buffer: WebGLBuffer, },
   *      };
   *
   * notes:
   *
   * *   Arrays can take various forms
   *
   *     Bare JavaScript Arrays
   *
   *         var arrays = {
   *            position: [-1, 1, 0],
   *            normal: [0, 1, 0],
   *            ...
   *         }
   *
   *     Bare TypedArrays
   *
   *         var arrays = {
   *            position: new Float32Array([-1, 1, 0]),
   *            color: new Uint8Array([255, 128, 64, 255]),
   *            ...
   *         }
   *
   * *   Will guess at `numComponents` if not specified based on name.
   *
   *     If `coord` is in the name assumes `numComponents = 2`
   *
   *     If `color` is in the name assumes `numComponents = 4`
   *
   *     otherwise assumes `numComponents = 3`
   *
   * @param {WebGLRenderingContext} gl The webgl rendering context.
   * @param {module:twgl.Arrays} arrays The arrays
   * @return {Object.<string, module:twgl.AttribInfo>} the attribs
   * @memberOf module:twgl
   */
  function createAttribsFromArrays(gl, arrays) {
    var attribs = {};
    Object.keys(arrays).forEach(function(arrayName) {
      if (!isIndices(arrayName)) {
        var array = arrays[arrayName];
        var attribName = array.attrib || array.name || array.attribName || (defaultAttribPrefix + arrayName);
        var typedArray = makeTypedArray(array, arrayName);
        attribs[attribName] = {
          buffer:        createBufferFromTypedArray(gl, typedArray, undefined, array.drawType),
          numComponents: array.numComponents || array.size || guessNumComponentsFromName(arrayName),
          type:          getGLTypeForTypedArray(typedArray),
          normalize:     array.normalize !== undefined ? array.normalize : getNormalizationForTypedArray(typedArray),
          stride:        array.stride || 0,
          offset:        array.offset || 0,
        };
      }
    });
    return attribs;
  }

  /**
   * tries to get the number of elements from a set of arrays.
   */

  var getNumElementsFromNonIndexedArrays = (function() {
    var positionKeys = ['position', 'positions', 'a_position'];

    return function getNumElementsFromNonIndexedArrays(arrays) {
      var key;
      for (var ii = 0; ii < positionKeys.length; ++ii) {
        key = positionKeys[ii];
        if (key in arrays) {
          break;
        }
      }
      if (ii === positionKeys.length) {
        key = Object.keys(arrays)[0];
      }
      var array = arrays[key];
      var length = array.length || array.data.length;
      var numComponents = array.numComponents || guessNumComponentsFromName(key, length);
      var numElements = length / numComponents;
      if (length % numComponents > 0) {
        throw "numComponents " + numComponents + " not correct for length " + length;
      }
      return numElements;
    };
  }());

  /**
   * @typedef {Object} BufferInfo
   * @property {number} numElements The number of elements to pass to `gl.drawArrays` or `gl.drawElements`.
   * @property {WebGLBuffer} [indices] The indices `ELEMENT_ARRAY_BUFFER` if any indices exist.
   * @property {Object.<string, module:twgl.AttribInfo>} attribs The attribs approriate to call `setAttributes`
   * @memberOf module:twgl
   */


  /**
   * Creates a BufferInfo from an object of arrays.
   *
   * This can be passed to {@link module:twgl.setBuffersAndAttributes} and to
   * {@link module:twgl:drawBufferInfo}.
   *
   * Given an object like
   *
   *     var arrays = {
   *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
   *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
   *       normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
   *       indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
   *     };
   *
   *  Creates an BufferInfo like this
   *
   *     bufferInfo = {
   *       numElements: 4,        // or whatever the number of elements is
   *       indices: WebGLBuffer,  // this property will not exist if there are no indices
   *       attribs: {
   *         a_position: { buffer: WebGLBuffer, numComponents: 3, },
   *         a_normal:   { buffer: WebGLBuffer, numComponents: 3, },
   *         a_texcoord: { buffer: WebGLBuffer, numComponents: 2, },
   *       },
   *     };
   *
   *  The properties of arrays can be JavaScript arrays in which case the number of components
   *  will be guessed.
   *
   *     var arrays = {
   *        position: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0],
   *        texcoord: [0, 0, 0, 1, 1, 0, 1, 1],
   *        normal:   [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
   *        indices:  [0, 1, 2, 1, 2, 3],
   *     };
   *
   *  They can also by TypedArrays
   *
   *     var arrays = {
   *        position: new Float32Array([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]),
   *        texcoord: new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]),
   *        normal:   new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
   *        indices:  new Uint16Array([0, 1, 2, 1, 2, 3]),
   *     };
   *
   *  Or augmentedTypedArrays
   *
   *     var positions = createAugmentedTypedArray(3, 4);
   *     var texcoords = createAugmentedTypedArray(2, 4);
   *     var normals   = createAugmentedTypedArray(3, 4);
   *     var indices   = createAugmentedTypedArray(3, 2, Uint16Array);
   *
   *     positions.push([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]);
   *     texcoords.push([0, 0, 0, 1, 1, 0, 1, 1]);
   *     normals.push([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);
   *     indices.push([0, 1, 2, 1, 2, 3]);
   *
   *     var arrays = {
   *        position: positions,
   *        texcoord: texcoords,
   *        normal:   normals,
   *        indices:  indices,
   *     };
   *
   * For the last example it is equivalent to
   *
   *     var bufferInfo = {
   *       attribs: {
   *         a_position: { numComponents: 3, buffer: gl.createBuffer(), },
   *         a_texcoods: { numComponents: 2, buffer: gl.createBuffer(), },
   *         a_normals: { numComponents: 3, buffer: gl.createBuffer(), },
   *       },
   *       indices: gl.createBuffer(),
   *       numElements: 6,
   *     };
   *
   *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_position.buffer);
   *     gl.bufferData(gl.ARRAY_BUFFER, arrays.position, gl.STATIC_DRAW);
   *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_texcoord.buffer);
   *     gl.bufferData(gl.ARRAY_BUFFER, arrays.texcoord, gl.STATIC_DRAW);
   *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_normal.buffer);
   *     gl.bufferData(gl.ARRAY_BUFFER, arrays.normal, gl.STATIC_DRAW);
   *     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indices);
   *     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrays.indices, gl.STATIC_DRAW);
   *
   * @param {WebGLRenderingContext} gl A WebGLRenderingContext
   * @param {module:twgl.Arrays} arrays Your data
   * @return {module:twgl.BufferInfo} A BufferInfo
   * @memberOf module:twgl
   */
  function createBufferInfoFromArrays(gl, arrays) {
    var bufferInfo = {
      attribs: createAttribsFromArrays(gl, arrays),
    };
    var indices = arrays.indices;
    if (indices) {
      indices = makeTypedArray(indices, "indices");
      bufferInfo.indices = createBufferFromTypedArray(gl, indices, gl.ELEMENT_ARRAY_BUFFER);
      bufferInfo.numElements = indices.length;
      bufferInfo.elementType = (indices instanceof Uint32Array) ?  gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
    } else {
      bufferInfo.numElements = getNumElementsFromNonIndexedArrays(arrays);
    }

    return bufferInfo;
  }

  /**
   * Creates buffers from typed arrays
   *
   * Given something like this
   *
   *     var arrays = {
   *        positions: [1, 2, 3],
   *        normals: [0, 0, 1],
   *     }
   *
   * returns something like
   *
   *     buffers = {
   *       positions: WebGLBuffer,
   *       normals: WebGLBuffer,
   *     }
   *
   * If the buffer is named 'indices' it will be made an ELEMENT_ARRAY_BUFFER.
   *
   * @param {WebGLRenderingContext) gl A WebGLRenderingContext.
   * @param {module:twgl.Arrays} arrays
   * @return {Object<string, WebGLBuffer>} returns an object with one WebGLBuffer per array
   * @memberOf module:twgl
   */
  function createBuffersFromArrays(gl, arrays) {
    var buffers = { };
    Object.keys(arrays).forEach(function(key) {
      var type = key === "indices" ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
      var array = makeTypedArray(arrays[key], key);
      buffers[key] = createBufferFromTypedArray(gl, array, type);
    });

    return buffers;
  }

  /**
   * Calls `gl.drawElements` or `gl.drawArrays`, whichever is appropriate
   *
   * normally you'd call `gl.drawElements` or `gl.drawArrays` yourself
   * but calling this means if you switch from indexed data to non-indexed
   * data you don't have to remember to update your draw call.
   *
   * @param {WebGLRenderingContext} gl A WebGLRenderingContext
   * @param {enum} type eg (gl.TRIANGLES, gl.LINES, gl.POINTS, gl.TRIANGLE_STRIP, ...)
   * @param {module:twgl.BufferInfo} bufferInfo as returned from createBufferInfoFromArrays
   * @param {number} [count] An optional count. Defaults to bufferInfo.numElements
   * @param {number} [offset] An optional offset. Defaults to 0.
   * @memberOf module:twgl
   */
  function drawBufferInfo(gl, type, bufferInfo, count, offset) {
    var indices = bufferInfo.indices;
    var numElements = count === undefined ? bufferInfo.numElements : count;
    offset = offset === undefined ? 0 : offset;
    if (indices) {
      gl.drawElements(type, numElements, bufferInfo.elementType === undefined ? gl.UNSIGNED_SHORT : bufferInfo.elementType, offset);
    } else {
      gl.drawArrays(type, offset, numElements);
    }
  }

  /**
   * @typedef {Object} DrawObject
   * @property {boolean} [active] whether or not to draw. Default = `true` (must be `false` to be not true). In otherwords `undefined` = `true`
   * @property {number} [type] type to draw eg. `gl.TRIANGLES`, `gl.LINES`, etc...
   * @property {module:twgl.ProgramInfo} programInfo A ProgramInfo as returned from createProgramInfo
   * @property {module:twgl.BufferInfo} bufferInfo A BufferInfo as returned from createBufferInfoFromArrays
   * @property {Object<string, ?>} uniforms The values for the uniforms.
   *   You can pass multiple objects by putting them in an array. For example
   *
   *     var sharedUniforms = {
   *       u_fogNear: 10,
   *       u_projection: ...
   *       ...
   *     };
   *
   *     var localUniforms = {
   *       u_world: ...
   *       u_diffuseColor: ...
   *     };
   *
   *     var drawObj = {
   *       ...
   *       uniforms: [sharedUniforms, localUniforms],
   *     };
   *
   * @property {number} [offset] the offset to pass to `gl.drawArrays` or `gl.drawElements`. Defaults to 0.
   * @property {number} [count] the count to pass to `gl.drawArrays` or `gl.drawElemnts`. Defaults to bufferInfo.numElements.
   * @memberOf module:twgl
   */

  /**
   * Draws a list of objects
   * @param {DrawObject[]} objectsToDraw an array of objects to draw.
   * @memberOf module:twgl
   */
  function drawObjectList(gl, objectsToDraw) {
    var lastUsedProgramInfo = null;
    var lastUsedBufferInfo = null;

    objectsToDraw.forEach(function(object) {
      if (object.active === false) {
        return;
      }

      var programInfo = object.programInfo;
      var bufferInfo = object.bufferInfo;
      var bindBuffers = false;

      if (programInfo !== lastUsedProgramInfo) {
        lastUsedProgramInfo = programInfo;
        gl.useProgram(programInfo.program);

        // We have to rebind buffers when changing programs because we
        // only bind buffers the program uses. So if 2 programs use the same
        // bufferInfo but the 1st one uses only positions the when the
        // we switch to the 2nd one some of the attributes will not be on.
        bindBuffers = true;
      }

      // Setup all the needed attributes.
      if (bindBuffers || bufferInfo !== lastUsedBufferInfo) {
        lastUsedBufferInfo = bufferInfo;
        setBuffersAndAttributes(gl, programInfo, bufferInfo);
      }

      // Set the uniforms.
      setUniforms(programInfo, object.uniforms);

      // Draw
      drawBufferInfo(gl, object.type || gl.TRIANGLES, bufferInfo, object.count, object.offset);
    });
  }

  /**
   * A function to generate the source for a texture.
   * @callback TextureFunc
   * @param {WebGLRenderingContext} gl A WebGLRenderingContext
   * @param {module:twgl.TextureOptions} options the texture options
   * @return {*} Returns any of the things documentented for `src` for {@link module:twgl.TextureOptions}.
   * @memberOf module:twgl
   */

  /**
   * Texture options passed to most texture functions. Each function will use whatever options
   * are appropriate for its needs. This lets you pass the same options to all functions.
   *
   * @typedef {Object} TextureOptions
   * @property {number} [target] the type of texture `gl.TEXTURE_2D` or `gl.TEXTURE_CUBE_MAP`. Defaults to `gl.TEXTURE_2D`.
   * @property {number} [width] the width of the texture. Only used if src is an array or typed array or null.
   * @property {number} [height] the height of a texture. Only used if src is an array or typed array or null.
   * @property {number} [min] the min filter setting (eg. `gl.LINEAR`). Defaults to `gl.NEAREST_MIPMAP_LINEAR`
   *     or if texture is not a power of 2 on both dimensions then defaults to `gl.LINEAR`.
   * @property {number} [mag] the mag filter setting (eg. `gl.LINEAR`). Defaults to `gl.LINEAR`
   * @property {number} [format] format for texture. Defaults to `gl.RGBA`.
   * @property {number} [type] type for texture. Defaults to `gl.UNSIGNED_BYTE` unless `src` is ArrayBuffer. If `src`
   *     is ArrayBuffer defaults to type that matches ArrayBuffer type.
   * @property {number} [wrap] Texture wrapping for both S and T. Defaults to `gl.REPEAT` for 2D and `gl.CLAMP_TO_EDGE` for cube
   * @property {number} [wrapS] Texture wrapping for S. Defaults to `gl.REPEAT` and `gl.CLAMP_TO_EDGE` for cube. If set takes precedence over `wrap`.
   * @property {number} [wrapT] Texture wrapping for T. Defaults to 'gl.REPEAT` and `gl.CLAMP_TO_EDGE` for cube. If set takes precedence over `wrap`.
   * @property {number} [unpackAlignment] The `gl.UNPACK_ALIGNMENT` used when uploading an array. Defaults to 1.
   * @property {number} [premultiplyAlpha] Whether or not to premultiply alpha. Defaults to whatever the current setting is.
   *     This lets you set it once before calling `twgl.createTexture` or `twgl.createTextures` and only override
   *     the current setting for specific textures.
   * @property {number} [flipY] Whether or not to flip the texture vertically on upload. Defaults to whatever the current setting is.
   *     This lets you set it once before calling `twgl.createTexture` or `twgl.createTextures` and only override
   *     the current setting for specific textures.
   * @property {number} [colorspaceConversion] Whether or not to let the browser do colorspace conversion of the texture on upload. Defaults to whatever the current setting is.
   *     This lets you set it once before calling `twgl.createTexture` or `twgl.createTextures` and only override
   *     the current setting for specific textures.
   * @property {(number[]|ArrayBuffer)} color color used as temporary 1x1 pixel color for textures loaded async when src is a string.
   *    If it's a JavaScript array assumes color is 0 to 1 like most GL colors as in [1, 0, 0, 1] = red=1, green=0, blue=0, alpha=0.
   *    Defaults to [0.5, 0.75, 1, 1]. See {@link module:twgl.setDefaultTextureColor}. If `false` texture is set. Can be used to re-load a texture
   * @property {boolean} [auto] If not `false` then texture working filtering is set automatically for non-power of 2 images and
   *    mips are generated for power of 2 images.
   * @property {number[]} [cubeFaceOrder] The order that cube faces are pull out of an img or set of images. The default is
   *
   *     [gl.TEXTURE_CUBE_MAP_POSITIVE_X,
   *      gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
   *      gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
   *      gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
   *      gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
   *      gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]
   *
   * @property {(number[]|ArrayBuffer|HTMLCanvasElement|HTMLImageElement|HTMLVideoElement|string|string[]|module:twgl.TextureFunc)} [src] source for texture
   *
   *    If `string` then it's assumed to be a URL to an image. The image will be downloaded async. A usable
   *    1x1 pixel texture will be returned immediatley. The texture will be updated once the image has downloaded.
   *    If `target` is `gl.TEXTURE_CUBE_MAP` will attempt to divide image into 6 square pieces. 1x6, 6x1, 3x2, 2x3.
   *    The pieces will be uploaded in `cubeFaceOrder`
   *
   *    If `string[]` then it must have 6 entries, one for each face of a cube map. Target must be `gl.TEXTURE_CUBE_MAP`.
   *
   *    If `HTMLElement` then it wil be used immediately to create the contents of the texture. Examples `HTMLImageElement`,
   *    `HTMLCanvasElement`, `HTMLVideoElement`.
   *
   *    If `number[]` or `ArrayBuffer` it's assumed to be data for a texture. If `width` or `height` is
   *    not specified it is guessed as follows. First the number of elements is computed by `src.length / numComponets`
   *    where `numComponents` is derived from `format`. If `target` is `gl.TEXTURE_CUBE_MAP` then `numElements` is divided
   *    by 6. Then
   *
   *    *   If neither `width` nor `height` are specified and `sqrt(numElements)` is an integer width and height
   *        are set to `sqrt(numElements)`. Otherwise `width = numElements` and `height = 1`.
   *
   *    *   If only one of `width` or `height` is specified then the other equals `numElements / specifiedDimension`.
   *
   * If `number[]` will be converted to `type`.
   *
   * If target is a `gl.TEXTURE_CUBE_MAP`
   *
   * If `src` is a function it will be called with these a `WebGLRenderingContext` and these options.
   * Whatever it returns is subject to these rules. So it can return a string url, an `HTMLElement`
   * an array etc...
   *
   *
   * If `src` is undefined then an empty texture will be created of size `width` by `height`.
   *
   * @memberOf module:twgl
   */

  // NOTE: While querying GL is considered slow it's not remotely as slow
  // as uploading a texture. On top of that you're unlikely to call this in
  // a perf critical loop. Even if upload a texture every frame that's unlikely
  // to be more than 1 or 2 textures a frame. In other words, the benefits of
  // making the API easy to use outweigh any supposed perf benefits
  var lastPackState = {};

  /**
   * Saves any packing state that will be set based on the options.
   * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   */
  function savePackState(gl, options) {
    if (options.colorspaceConversion !== undefined) {
      lastPackState.colorSpaceConversion = gl.getParameter(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL);
    }
    if (options.premultiplyAlpha !== undefined) {
      lastPackState.premultiplyAlpha = gl.getParameter(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL);
    }
    if (options.flipY !== undefined) {
      lastPackState.flipY = gl.getParameter(gl.UNPACK_FLIP_Y_WEBGL);
    }
  }

  /**
   * Restores any packing state that was set based on the options.
   * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   */
  function restorePackState(gl, options) {
    if (options.colorspaceConversion !== undefined) {
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, lastPackState.colorSpaceConversion);
    }
    if (options.premultiplyAlpha !== undefined) {
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, lastPackState.premultiplyAlpha);
    }
    if (options.flipY !== undefined) {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, lastPackState.flipY);
    }
  }

  /**
   * Sets the texture parameters of a texture.
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {WebGLTexture} tex the WebGLTexture to set parameters for
   * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
   * @memberOf module:twgl
   */
  function setTextureParameters(gl, tex, options) {
    var target = options.target || gl.TEXTURE_2D;
    gl.bindTexture(target, tex);
    if (options.min) {
      gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, options.min);
    }
    if (options.mag) {
      gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, options.mag);
    }
    if (options.wrap) {
      gl.texParameteri(target, gl.TEXTURE_WRAP_S, options.wrap);
      gl.texParameteri(target, gl.TEXTURE_WRAP_T, options.wrap);
    }
    if (options.wrapS) {
      gl.texParameteri(target, gl.TEXTURE_WRAP_S, options.wrapS);
    }
    if (options.wrapT) {
      gl.texParameteri(target, gl.TEXTURE_WRAP_T, options.wrapT);
    }
  }

  /**
   * Makes a 1x1 pixel
   * If no color is passed in uses the default color which can be set by calling `setDefaultTextureColor`.
   * @param {(number[]|ArrayBuffer)} [color] The color using 0-1 values
   * @return {Uint8Array} Unit8Array with color.
   */
  function make1Pixel(color) {
    color = color || defaultTextureColor;
    if (isArrayBuffer(color)) {
      return color;
    }
    return new Uint8Array([color[0] * 255, color[1] * 255, color[2] * 255, color[3] * 255]);
  }

  /**
   * Returns true if value is power of 2
   * @param {number} value number to check.
   * @return true if value is power of 2
   */
  function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
  }

  /**
   * Sets filtering or generates mips for texture based on width or height
   * If width or height is not passed in uses `options.width` and//or `options.height`
   *
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {WebGLTexture} tex the WebGLTexture to set parameters for
   * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
   * @param {number} [width] width of texture
   * @param {number} [height] height of texture
   * @memberOf module:twgl
   */
  function setTextureFilteringForSize(gl, tex, options, width, height) {
    options = options || defaultTextureOptions;
    var target = options.target || gl.TEXTURE_2D;
    width = width || options.width;
    height = height || options.height;
    gl.bindTexture(target, tex);
    if (!isPowerOf2(width) || !isPowerOf2(height)) {
      gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    } else {
      gl.generateMipmap(target);
    }
  }

  /**
   * Gets an array of cubemap face enums
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
   * @return {number[]} cubemap face enums
   */
  function getCubeFaceOrder(gl, options) {
    options = options || {};
    return options.cubeFaceOrder || [
        gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
      ];
  }

  /**
   * @typedef {Object} FaceInfo
   * @property {number} face gl enum for texImage2D
   * @property {number} ndx face index (0 - 5) into source data
   */

  /**
   * Gets an array of FaceInfos
   * There's a bug in some NVidia drivers that will crash the driver if
   * `gl.TEXTURE_CUBE_MAP_POSITIVE_X` is not uploaded first. So, we take
   * the user's desired order from his faces to WebGL and make sure we
   * do the faces in WebGL order
   *
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
   * @return {FaceInfo[]} cubemap face infos. Arguably the `face` property of each element is redundent but
   *    it's needed internally to sort the array of `ndx` properties by `face`.
   */
  function getCubeFacesWithNdx(gl, options) {
    var faces = getCubeFaceOrder(gl, options);
    // work around bug in NVidia drivers. We have to upload the first face first else the driver crashes :(
    var facesWithNdx = faces.map(function(face, ndx) {
      return { face: face, ndx: ndx };
    });
    facesWithNdx.sort(function(a, b) {
      return a.face - b.face;
    });
    return facesWithNdx;
  }

  /**
   * Set a texture from the contents of an element. Will also set
   * texture filtering or generate mips based on the dimensions of the element
   * unless `options.auto === false`. If `target === gl.TEXTURE_CUBE_MAP` will
   * attempt to slice image into 1x6, 2x3, 3x2, or 6x1 images, one for each face.
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {WebGLTexture} tex the WebGLTexture to set parameters for
   * @param {HTMLElement} element a canvas, img, or video element.
   * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
   * @memberOf module:twgl
   * @kind function
   */
  var setTextureFromElement = function() {
    var ctx = document.createElement("canvas").getContext("2d");
    return function setTextureFromElement(gl, tex, element, options) {
      options = options || defaultTextureOptions;
      var target = options.target || gl.TEXTURE_2D;
      var width = element.width;
      var height = element.height;
      var format = options.format || gl.RGBA;
      var type = options.type || gl.UNSIGNED_BYTE;
      savePackState(gl, options);
      gl.bindTexture(target, tex);
      if (target === gl.TEXTURE_CUBE_MAP) {
        // guess the parts
        var imgWidth  = element.width;
        var imgHeight = element.height;
        var size;
        var slices;
        if (imgWidth / 6 === imgHeight) {
          // It's 6x1
          size = imgHeight;
          slices = [0, 0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0];
        } else if (imgHeight / 6 === imgWidth) {
          // It's 1x6
          size = imgWidth;
          slices = [0, 0, 0, 1, 0, 2, 0, 3, 0, 4, 0, 5];
        } else if (imgWidth / 3 === imgHeight / 2) {
          // It's 3x2
          size = imgWidth / 3;
          slices = [0, 0, 1, 0, 2, 0, 0, 1, 1, 1, 2, 1];
        } else if (imgWidth / 2 === imgHeight / 3) {
          // It's 2x3
          size = imgWidth / 2;
          slices = [0, 0, 1, 0, 0, 1, 1, 1, 0, 2, 1, 2];
        } else {
          throw "can't figure out cube map from element: " + (element.src ? element.src : element.nodeName);
        }
        ctx.canvas.width = size;
        ctx.canvas.height = size;
        width = size;
        height = size;
        getCubeFacesWithNdx(gl, options).forEach(function(f) {
          var xOffset = slices[f.ndx * 2 + 0] * size;
          var yOffset = slices[f.ndx * 2 + 1] * size;
          ctx.drawImage(element, xOffset, yOffset, size, size, 0, 0, size, size);
          gl.texImage2D(f.face, 0, format, format, type, ctx.canvas);
        });
        // Free up the canvas memory
        ctx.canvas.width = 1;
        ctx.canvas.height = 1;
      } else {
        gl.texImage2D(target, 0, format, format, type, element);
      }
      restorePackState(gl, options);
      if (options.auto !== false) {
        setTextureFilteringForSize(gl, tex, options, width, height);
      }
      setTextureParameters(gl, tex, options);
    };
  }();

  /**
   * Copy an object 1 level deep
   * @param {object} src object to copy
   * @return {object} the copy
   */
  function shallowCopy(src) {
    var dst = {};
    Object.keys(src).forEach(function(key) {
      dst[key] = src[key];
    });
    return dst;
  }

  /**
   * Loads an image
   * @param {string} url url to image
   * @param {function(err, img)} a callback that's passed an error and the image. The error will be non-null
   *     if there was an error
   * @return {HTMLImageElement} the image being loaded.
   */
  function loadImage(url, callback) {
    var img = new Image();
    img.onerror = function() {
      var msg = "couldn't load image: " + url;
      error(msg);
      callback(msg, img);
    };
    img.onload = function() {
      callback(null, img);
    };
    img.src = url;
    return img;
  }

  /**
   * Sets a texture to a 1x1 pixel color. If `options.color === false` is nothing happens. If it's not set
   * the default texture color is used which can be set by calling `setDefaultTextureColor`.
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {WebGLTexture} tex the WebGLTexture to set parameters for
   * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
   * @memberOf module:twgl
   */
  function setTextureTo1PixelColor(gl, tex, options) {
    options = options || defaultTextureOptions;
    var target = options.target || gl.TEXTURE_2D;
    gl.bindTexture(target, tex);
    if (options.color === false) {
      return;
    }
    // Assume it's a URL
    // Put 1x1 pixels in texture. That makes it renderable immediately regardless of filtering.
    var color = make1Pixel(options.color);
    if (target === gl.TEXTURE_CUBE_MAP) {
      for (var ii = 0; ii < 6; ++ii) {
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + ii, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, color);
      }
    } else {
      gl.texImage2D(target, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, color);
    }
  }

  /**
   * A callback for when an image finished downloading and been uploaded into a texture
   * @callback TextureReadyCallback
   * @param {*} err If truthy there was an error.
   * @param {WebGLTexture} tex the texture.
   * @param {HTMLImageElement} img the image element.
   * @memberOf module:twgl
   */

  /**
   * A callback for when all images have finished downloading and been uploaded into their respective textures
   * @callback TexturesReadyCallback
   * @param {*} err If truthy there was an error.
   * @param {WebGLTexture} tex the texture.
   * @param {Object.<string,module:twgl.TextureOptions>} options A object of TextureOptions one per texture.
   * @memberOf module:twgl
   */

  /**
   * A callback for when an image finished downloading and been uploaded into a texture
   * @callback CubemapReadyCallback
   * @param {*} err If truthy there was an error.
   * @param {WebGLTexture} tex the texture.
   * @param {HTMLImageElement[]} imgs the images for each face.
   * @memberOf module:twgl
   */

  /**
   * Loads a texture from an image from a Url as specified in `options.src`
   * If `options.color !== false` will set the texture to a 1x1 pixel color so that the texture is
   * immediately useable. It will be updated with the contents of the image once the image has finished
   * downloading. Filtering options will be set as approriate for image unless `options.auto === false`.
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {WebGLTexture} tex the WebGLTexture to set parameters for
   * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
   * @param {module:twgl.TextureReadyCallback} [callback] A function to be called when the image has finished loading. err will
   *    be non null if there was an error.
   * @return {HTMLImageElement} the image being downloaded.
   * @memberOf module:twgl
   */
  function loadTextureFromUrl(gl, tex, options, callback) {
    options = options || defaultTextureOptions;
    setTextureTo1PixelColor(gl, tex, options);
    // Because it's async we need to copy the options.
    options = shallowCopy(options);
    var img = loadImage(options.src, function(err, img) {
      if (err) {
        callback(err, tex, img);
      } else {
        setTextureFromElement(gl, tex, img, options);
        callback(null, tex, img);
      }
    });
    return img;
  }

  /**
   * Loads a cubemap from 6 urls as specified in `options.src`. Will set the cubemap to a 1x1 pixel color
   * so that it is usable immediately unless `option.color === false`.
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {WebGLTexture} tex the WebGLTexture to set parameters for
   * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
   * @param {module:twgl.CubemapReadyCallback} callback A function to be called when all the images have finished loading. err will
   *    be non null if there was an error.
   * @memberOf module:twgl
   */
  function loadCubemapFromUrls(gl, tex, options, callback) {
    var urls = options.src;
    if (urls.length !== 6) {
      throw "there must be 6 urls for a cubemap";
    }
    var format = options.format || gl.RGBA;
    var type = options.type || gl.UNSIGNED_BYTE;
    var target = options.target || gl.TEXTURE_2D;
    if (target !== gl.TEXTURE_CUBE_MAP) {
      throw "target must be TEXTURE_CUBE_MAP";
    }
    setTextureTo1PixelColor(gl, tex, options);
    // Because it's async we need to copy the options.
    options = shallowCopy(options);
    var numToLoad = 6;
    var errors = [];
    var imgs;
    var faces = getCubeFaceOrder(gl, options);

    function uploadImg(faceTarget) {
      return function(err, img) {
        --numToLoad;
        if (err) {
          errors.push(err);
        } else {
          if (img.width !== img.height) {
            errors.push("cubemap face img is not a square: " + img.src);
          } else {
            savePackState(gl, options);
            gl.bindTexture(target, tex);

            // So assuming this is the first image we now have one face that's img sized
            // and 5 faces that are 1x1 pixel so size the other faces
            if (numToLoad === 5) {
              // use the default order
              getCubeFaceOrder(gl).forEach(function(otherTarget) {
                // Should we re-use the same face or a color?
                gl.texImage2D(otherTarget, 0, format, format, type, img);
              });
            } else {
              gl.texImage2D(faceTarget, 0, format, format, type, img);
            }

            restorePackState(gl, options);
            gl.generateMipmap(target);
          }
        }

        if (numToLoad === 0) {
          if (callback) {
            callback(errors.length ? errors : undefined, imgs, tex);
          }
        }
      };
    }

    imgs = urls.map(function(url, ndx) {
      return loadImage(url, uploadImg(faces[ndx]));
    });
  }

  /**
   * Gets the number of compontents for a given image format.
   * @param {number} format the format.
   * @return {number} the number of components for the format.
   */
  function getNumComponentsForFormat(format) {
    switch (format) {
      case ALPHA:
      case LUMINANCE:
        return 1;
      case LUMINANCE_ALPHA:
        return 2;
      case RGB:
        return 3;
      case RGBA:
        return 4;
      default:
        throw "unknown type: " + format;
    }
  }

  /**
   * Gets the texture type for a given array type.
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @return {number} the gl texture type
   */
  function getTextureTypeForArrayType(gl, src) {
    if (isArrayBuffer(src)) {
      return getGLTypeForTypedArray(src);
    }
    return gl.UNSIGNED_BYTE;
  }

  /**
   * Sets a texture from an array or typed array. If the width or height is not provided will attempt to
   * guess the size. See {@link module:twgl.TextureOptions}.
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {WebGLTexture} tex the WebGLTexture to set parameters for
   * @param {(number[]|ArrayBuffer)} src An array or typed arry with texture data.
   * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
   * @memberOf module:twgl
   */
  function setTextureFromArray(gl, tex, src, options) {
    options = options || defaultTextureOptions;
    var target = options.target || gl.TEXTURE_2D;
    var width = options.width;
    var height = options.height;
    var format = options.format || gl.RGBA;
    var type = options.type || getTextureTypeForArrayType(gl, src);
    var numComponents = getNumComponentsForFormat(format);
    var numElements = src.length / numComponents;
    if (numElements % 1) {
      throw "length wrong size of format: " + glEnumToString(gl, format);
    }
    if (!width && !height) {
      var size = Math.sqrt(numElements / (target === gl.TEXTURE_CUBE_MAP ? 6 : 1));
      if (size % 1 === 0) {
        width = size;
        height = size;
      } else {
        width = numElements;
        height = 1;
      }
    } else if (!height) {
      height = numElements / width;
      if (height % 1) {
        throw "can't guess height";
      }
    } else if (!width) {
      width = numElements / height;
      if (width % 1) {
        throw "can't guess width";
      }
    }
    if (!isArrayBuffer(src)) {
      var Type = getTypedArrayTypeForGLType(gl, type);
      src = new Type(src);
    }
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, options.unpackAlignment || 1);
    savePackState(gl, options);
    if (target === gl.TEXTURE_CUBE_MAP) {
      var faceSize = numElements / 6 * numComponents;
      getCubeFacesWithNdx(gl, options).forEach(function(f) {
        var offset = faceSize * f.ndx;
        var data = src.subarray(offset, offset + faceSize);
        gl.texImage2D(f.face, 0, format, width, height, 0, format, type, data);
      });
    } else {
      gl.texImage2D(target, 0, format, width, height, 0, format, type, src);
    }
    restorePackState(gl, options);
    return {
      width: width,
      height: height,
    };
  }

  /**
   * Sets a texture with no contents of a certain size. In other words calls `gl.texImage2D` with `null`.
   * You must set `options.width` and `options.height`.
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {WebGLTexture} tex the WebGLTexture to set parameters for
   * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
   * @memberOf module:twgl
   */
  function setEmptyTexture(gl, tex, options) {
    var target = options.target || gl.TEXTURE_2D;
    gl.bindTexture(target, tex);
    var format = options.format || gl.RGBA;
    var type = options.type || gl.UNSIGNED_BYTE;
    savePackState(gl, options);
    if (target === gl.TEXTURE_CUBE_MAP) {
      for (var ii = 0; ii < 6; ++ii) {
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + ii, 0, format, options.width, options.height, 0, format, type, null);
      }
    } else {
      gl.texImage2D(target, 0, format, options.width, options.height, 0, format, type, null);
    }
  }

  /**
   * Creates a texture based on the options passed in.
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
   * @param {module:twgl.TextureReadyCallback} [callback] A callback called when an image has been downloaded and uploaded to the texture.
   * @return {WebGLTexture} the created texture.
   * @memberOf module:twgl
   */
  function createTexture(gl, options, callback) {
    options = options || defaultTextureOptions;
    var tex = gl.createTexture();
    var target = options.target || gl.TEXTURE_2D;
    var width  = options.width  || 1;
    var height = options.height || 1;
    gl.bindTexture(target, tex);
    if (target === gl.TEXTURE_CUBE_MAP) {
      // this should have been the default for CUBEMAPS :(
      gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    var src = options.src;
    if (src) {
      if (typeof src === "function") {
        src = src(gl, options);
      }
      if (typeof (src) === "string") {
        loadTextureFromUrl(gl, tex, options, callback);
      } else if (isArrayBuffer(src) ||
                 (Array.isArray(src) && (
                      typeof src[0] === 'number' ||
                      Array.isArray(src[0]) ||
                      isArrayBuffer(src[0]))
                 )
                ) {
        var dimensions = setTextureFromArray(gl, tex, src, options);
        width  = dimensions.width;
        height = dimensions.height;
      } else if (Array.isArray(src) && typeof (src[0]) === 'string') {
        loadCubemapFromUrls(gl, tex, options, callback);
      } else if (src instanceof HTMLElement) {
        setTextureFromElement(gl, tex, src, options);
        width  = src.width;
        height = src.height;
      } else {
        throw "unsupported src type";
      }
    } else {
      setEmptyTexture(gl, tex, options);
    }
    if (options.auto !== false) {
      setTextureFilteringForSize(gl, tex, options, width, height);
    }
    setTextureParameters(gl, tex, options);
    return tex;
  }

  /**
   * Resizes a texture based on the options passed in.
   *
   * Note: This is not a generic resize anything function.
   * It's mostly used by {@link module:twgl.resizeFramebufferInfo}
   * It will use `options.src` if it exists to try to determine a `type`
   * otherwise it will assume `gl.UNSIGNED_BYTE`. No data is provided
   * for the texture. Texture parameters will be set accordingly
   *
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {WebGLTexture} tex the texture to resize
   * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
   * @param {number} [width] the new width. If not passed in will use `options.width`
   * @param {number} [height] the new height. If not passed in will use `options.height`
   * @memberOf module:twgl
   */
  function resizeTexture(gl, tex, options, width, height) {
    width = width || options.width;
    height = height || options.height;
    var target = options.target || gl.TEXTURE_2D;
    gl.bindTexture(target, tex);
    var format = options.format || gl.RGBA;
    var type;
    var src = options.src;
    if (!src) {
      type = options.type || gl.UNSIGNED_BYTE;
    } else if (isArrayBuffer(src) || (Array.isArray(src) && typeof (src[0]) === 'number')) {
      type = options.type || getTextureTypeForArrayType(gl, src);
    } else {
      type = options.type || gl.UNSIGNED_BYTE;
    }
    if (target === gl.TEXTURE_CUBE_MAP) {
      for (var ii = 0; ii < 6; ++ii) {
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + ii, 0, format, width, height, 0, format, type, null);
      }
    } else {
      gl.texImage2D(target, 0, format, width, height, 0, format, type, null);
    }
  }

  /**
   * Check if a src is an async request.
   * if src is a string we're going to download an image
   * if src is an array of strings we're going to download cubemap images
   * @param {*} src The src from a TextureOptions
   * @returns {bool} true if src is async.
   */
  function isAsyncSrc(src) {
    return typeof src === 'string' ||
           (Array.isArray(src) && typeof src[0] === 'string');
  }

  /**
   * Creates a bunch of textures based on the passed in options.
   *
   * Example:
   *
   *     var textures = twgl.createTextures(gl, {
   *       // a power of 2 image
   *       hftIcon: { src: "images/hft-icon-16.png", mag: gl.NEAREST },
   *       // a non-power of 2 image
   *       clover: { src: "images/clover.jpg" },
   *       // From a canvas
   *       fromCanvas: { src: ctx.canvas },
   *       // A cubemap from 6 images
   *       yokohama: {
   *         target: gl.TEXTURE_CUBE_MAP,
   *         src: [
   *           'images/yokohama/posx.jpg',
   *           'images/yokohama/negx.jpg',
   *           'images/yokohama/posy.jpg',
   *           'images/yokohama/negy.jpg',
   *           'images/yokohama/posz.jpg',
   *           'images/yokohama/negz.jpg',
   *         ],
   *       },
   *       // A cubemap from 1 image (can be 1x6, 2x3, 3x2, 6x1)
   *       goldengate: {
   *         target: gl.TEXTURE_CUBE_MAP,
   *         src: 'images/goldengate.jpg',
   *       },
   *       // A 2x2 pixel texture from a JavaScript array
   *       checker: {
   *         mag: gl.NEAREST,
   *         min: gl.LINEAR,
   *         src: [
   *           255,255,255,255,
   *           192,192,192,255,
   *           192,192,192,255,
   *           255,255,255,255,
   *         ],
   *       },
   *       // a 1x2 pixel texture from a typed array.
   *       stripe: {
   *         mag: gl.NEAREST,
   *         min: gl.LINEAR,
   *         format: gl.LUMINANCE,
   *         src: new Uint8Array([
   *           255,
   *           128,
   *           255,
   *           128,
   *           255,
   *           128,
   *           255,
   *           128,
   *         ]),
   *         width: 1,
   *       },
   *     });
   *
   * Now
   *
   * *   `textures.hftIcon` will be a 2d texture
   * *   `textures.clover` will be a 2d texture
   * *   `textures.fromCanvas` will be a 2d texture
   * *   `textures.yohohama` will be a cubemap texture
   * *   `textures.goldengate` will be a cubemap texture
   * *   `textures.checker` will be a 2d texture
   * *   `textures.stripe` will be a 2d texture
   *
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {Object.<string,module:twgl.TextureOptions>} options A object of TextureOptions one per texture.
   * @param {module:twgl.TexturesReadyCallback} [callback] A callback called when all textures have been downloaded.
   * @return {Object.<string,WebGLTexture>) the created textures by name
   * @memberOf module:twgl
   */
  function createTextures(gl, textureOptions, callback) {
    var numDownloading = 0;
    var errors = [];
    var textures = {};

    function callCallbackIfReady() {
      if (numDownloading === 0) {
        if (callback) {
          setTimeout(function() {
            callback(errors.length ? errors : undefined, textureOptions);
          }, 0);
        }
      }
    }

    function finishedDownloading(err) {
      --numDownloading;
      if (err) {
        errors.push(err);
      }
      callCallbackIfReady();
    }

    Object.keys(textureOptions).forEach(function(name) {
      var options = textureOptions[name];
      var onLoadFn = undefined;
      if (isAsyncSrc(options.src)) {
        onLoadFn = finishedDownloading;
        ++numDownloading;
      }
      textures[name] = createTexture(gl, options, onLoadFn);
    });

    // queue the callback if there are no images to download.
    // We do this because if your code is structured to wait for
    // images to download but then you comment out all the async
    // images your code would break.
    callCallbackIfReady();

    return textures;
  }

  /**
   * The options for a framebuffer attachment.
   *
   * Note: For a `format` that is a texture include all the texture
   * options from {@link module:twgl.TextureOptions} for example
   * `min`, `mag`, `clamp`, etc... Note that unlike {@link module:twgl.TextureOptions}
   * `auto` defaults to `false` for attachment textures
   *
   * @typedef {Object} AttachmentOptions
   * @property {number} [attach] The attachment point. Defaults
   *   to `gl.COLOR_ATTACTMENT0 + ndx` unless type is a depth or stencil type
   *   then it's gl.DEPTH_ATTACHMENT or `gl.DEPTH_STENCIL_ATTACHMENT` depending
   *   on the format or attachment type.
   * @property {number} [format] The format. If one of `gl.RGBA4`,
   *   `gl.RGB565`, `gl.RGB5_A1`, `gl.DEPTH_COMPONENT16`,
   *   `gl.STENCIL_INDEX8` or `gl.DEPTH_STENCIL` then will create a
   *   renderbuffer. Otherwise will create a texture. Default = `gl.RGBA`
   * @property {number} [type] The type. Used for texture. Default = `gl.UNSIGNED_BYTE`.
   * @property {number} [target] The texture target for `gl.framebufferTexture2D`.
   *   Defaults to `gl.TEXTURE_2D`. Set to appropriate face for cube maps.
   * @property {number} [level] level for `gl.framebufferTexture2D`. Defaults to 0.
   * @property {WebGLObject} [attachment] An existing renderbuffer or texture.
   *    If provided will attach this Object. This allows you to share
   *    attachemnts across framebuffers.
   * @memberOf module:twgl
   */

  var defaultAttachments = [
    { format: RGBA, type: UNSIGNED_BYTE, min: LINEAR, wrap: CLAMP_TO_EDGE, },
    { format: DEPTH_STENCIL, },
  ];

  var attachmentsByFormat = {};
  attachmentsByFormat[DEPTH_STENCIL] = DEPTH_STENCIL_ATTACHMENT;
  attachmentsByFormat[STENCIL_INDEX] = STENCIL_ATTACHMENT;
  attachmentsByFormat[STENCIL_INDEX8] = STENCIL_ATTACHMENT;
  attachmentsByFormat[DEPTH_COMPONENT] = DEPTH_ATTACHMENT;
  attachmentsByFormat[DEPTH_COMPONENT16] = DEPTH_ATTACHMENT;

  function getAttachmentPointForFormat(format) {
    return attachmentsByFormat[format];
  }

  var renderbufferFormats = {};
  renderbufferFormats[RGBA4] = true;
  renderbufferFormats[RGB5_A1] = true;
  renderbufferFormats[RGB565] = true;
  renderbufferFormats[DEPTH_STENCIL] = true;
  renderbufferFormats[DEPTH_COMPONENT16] = true;
  renderbufferFormats[STENCIL_INDEX] = true;
  renderbufferFormats[STENCIL_INDEX8] = true;

  function isRenderbufferFormat(format) {
    return renderbufferFormats[format];
  }

  /**
   * @typedef {Object} FramebufferInfo
   * @property {WebGLFramebuffer} framebuffer The WebGLFramebuffer for this framebufferInfo
   * @property {WebGLObject[]} attachments The created attachments in the same order as passed in to {@link module:twgl.createFramebufferInfo}.
   * @memberOf module:twgl
   */

  /**
   * Creates a framebuffer and attachments.
   *
   * This returns a {@link module:twgl.FramebufferInfo} because it needs to return the attachments as well as the framebuffer.
   *
   * The simplest usage
   *
   *     // create an RGBA/UNSIGNED_BYTE texture and DEPTH_STENCIL renderbuffer
   *     var fbi = twgl.createFramebuffer(gl);
   *
   * More complex usage
   *
   *     // create an RGB565 renderbuffer and a STENCIL_INDEX8 renderbuffer
   *     var attachments = [
   *       { format: RGB565, mag: NEAREST },
   *       { format: STENCIL_INDEX8 },
   *     ]
   *     var fbi = twgl.createFramebuffer(gl, attachments);
   *
   * Passing in a specific size
   *
   *     var width = 256;
   *     var height = 256;
   *     var fbi = twgl.createFramebuffer(gl, attachments, width, height);
   *
   * **Note!!** It is up to you to check if the framebuffer is renderable by calling `gl.checkFramebufferStatus`.
   * [WebGL only guarantees 3 combinations of attachments work](https://www.khronos.org/registry/webgl/specs/latest/1.0/#6.6).
   *
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {module:twgl.AttachmentOptions[]} [attachments] which attachments to create. If not provided the default is a framebuffer with an
   *    `RGBA`, `UNSIGNED_BYTE` texture `COLOR_ATTACHMENT0` and a `DEPTH_STENCIL` renderbuffer `DEPTH_STENCIL_ATTACHMENT`.
   * @param {number} [width] the width for the attachments. Default = size of drawingBuffer
   * @param {number} [height] the height for the attachments. Defautt = size of drawingBuffer
   * @return {module:twgl.FramebufferInfo} the framebuffer and attachments.
   * @memberOf module:twgl
   */
  function createFramebufferInfo(gl, attachments, width, height) {
    var target = gl.FRAMEBUFFER;
    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(target, fb);
    width  = width  || gl.drawingBufferWidth;
    height = height || gl.drawingBufferHeight;
    attachments = attachments || defaultAttachments;
    var colorAttachmentCount = 0;
    var framebufferInfo = {
      framebuffer: fb,
      attachments: [],
    };
    attachments.forEach(function(attachmentOptions) {
      var attachment = attachmentOptions.attachment;
      var format = attachmentOptions.format;
      var attachmentPoint = getAttachmentPointForFormat(format);
      if (!attachmentPoint) {
        attachmentPoint = COLOR_ATTACHMENT0 + colorAttachmentCount++;
      }
      if (!attachment) {
        if (isRenderbufferFormat(format)) {
          attachment = gl.createRenderbuffer();
          gl.bindRenderbuffer(gl.RENDERBUFFER, attachment);
          gl.renderbufferStorage(gl.RENDERBUFFER, format, width, height);
        } else {
          var textureOptions = shallowCopy(attachmentOptions);
          textureOptions.width = width;
          textureOptions.height = height;
          textureOptions.auto = attachmentOptions.auto === undefined ? false : attachmentOptions.auto;
          attachment = createTexture(gl, textureOptions);
        }
      }
      if (attachment instanceof WebGLRenderbuffer) {
        gl.framebufferRenderbuffer(target, attachmentPoint, gl.RENDERBUFFER, attachment);
      } else if (attachment instanceof WebGLTexture) {
        gl.framebufferTexture2D(
            target,
            attachmentPoint,
            attachmentOptions.texTarget || gl.TEXTURE_2D,
            attachment,
            attachmentOptions.level || 0);
      } else {
        throw "unknown attachment type";
      }
      framebufferInfo.attachments.push(attachment);
    });
    return framebufferInfo;
  }

  /**
   * Resizes the attachments of a framebuffer.
   *
   * You need to pass in the same `attachments` as you passed in {@link module:twgl.createFramebuffer}
   * because TWGL has no idea the format/type of each attachment.
   *
   * The simplest usage
   *
   *     // create an RGBA/UNSIGNED_BYTE texture and DEPTH_STENCIL renderbuffer
   *     var fbi = twgl.createFramebuffer(gl);
   *
   *     ...
   *
   *     function render() {
   *       if (twgl.resizeCanvasToDisplaySize(gl.canvas)) {
   *         // resize the attachments
   *         twgl.resizeFramebufferInfo(gl, fbi);
   *       }
   *
   * More complex usage
   *
   *     // create an RGB565 renderbuffer and a STENCIL_INDEX8 renderbuffer
   *     var attachments = [
   *       { format: RGB565, mag: NEAREST },
   *       { format: STENCIL_INDEX8 },
   *     ]
   *     var fbi = twgl.createFramebuffer(gl, attachments);
   *
   *     ...
   *
   *     function render() {
   *       if (twgl.resizeCanvasToDisplaySize(gl.canvas)) {
   *         // resize the attachments to match
   *         twgl.resizeFramebufferInfo(gl, fbi, attachments);
   *       }
   *
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {module:twgl.FramebufferInfo} framebufferInfo a framebufferInfo as returned from {@link module:twgl.createFramebuffer}.
   * @param {module:twgl.AttachmentOptions[]} [attachments] the same attachments options as passed to {@link module:twgl.createFramebuffer}.
   * @param {number} [width] the width for the attachments. Default = size of drawingBuffer
   * @param {number} [height] the height for the attachments. Defautt = size of drawingBuffer
   * @memberOf module:twgl
   */
  function resizeFramebufferInfo(gl, framebufferInfo, attachments, width, height) {
    width  = width  || gl.drawingBufferWidth;
    height = height || gl.drawingBufferHeight;
    attachments = attachments || defaultAttachments;
    attachments.forEach(function(attachmentOptions, ndx) {
      var attachment = framebufferInfo.attachments[ndx];
      var format = attachmentOptions.format;
      if (attachment instanceof WebGLRenderbuffer) {
        gl.bindRenderbuffer(gl.RENDERBUFFER, attachment);
        gl.renderbufferStorage(gl.RENDERBUFFER, format, width, height);
      } else if (attachment instanceof WebGLTexture) {
        resizeTexture(gl, attachment, attachmentOptions, width, height);
      } else {
        throw "unknown attachment type";
      }
    });
  }



  // Using quotes prevents Uglify from changing the names.
  // No speed diff AFAICT.
  return {
    "createAttribsFromArrays": createAttribsFromArrays,
    "createBuffersFromArrays": createBuffersFromArrays,
    "createBufferInfoFromArrays": createBufferInfoFromArrays,
    "createAttributeSetters": createAttributeSetters,
    "createProgram": createProgram,
    "createProgramFromScripts": createProgramFromScripts,
    "createProgramFromSources": createProgramFromSources,
    "createProgramInfo": createProgramInfo,
    "createUniformSetters": createUniformSetters,
    "drawBufferInfo": drawBufferInfo,
    "drawObjectList": drawObjectList,
    "getWebGLContext": getWebGLContext,
    "resizeCanvasToDisplaySize": resizeCanvasToDisplaySize,
    "setAttributes": setAttributes,
    "setAttributePrefix": setAttributePrefix,
    "setBuffersAndAttributes": setBuffersAndAttributes,
    "setUniforms": setUniforms,

    "createTexture": createTexture,
    "setEmptyTexture": setEmptyTexture,
    "setTextureFromArray": setTextureFromArray,
    "loadTextureFromUrl": loadTextureFromUrl,
    "setTextureFromElement": setTextureFromElement,
    "setTextureFilteringForSize": setTextureFilteringForSize,
    "setTextureParameters": setTextureParameters,
    "setDefaultTextureColor": setDefaultTextureColor,
    "createTextures": createTextures,
    "resizeTexture": resizeTexture,

    "createFramebufferInfo": createFramebufferInfo,
    "resizeFramebufferInfo": resizeFramebufferInfo,
  };

});


/*
 * Copyright 2015, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of his
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


define('twgl/v3',[], function () {

  /**
   *
   * Vec3 math math functions.
   *
   * Almost all functions take an optional `dst` argument. If it is not passed in the
   * functions will create a new Vec3. In other words you can do this
   *
   *     var v = v3.cross(v1, v2);  // Creates a new Vec3 with the cross product of v1 x v2.
   *
   * or
   *
   *     var v3 = v3.create();
   *     v3.cross(v1, v2, v);  // Puts the cross product of v1 x v2 in v
   *
   * The first style is often easier but depending on where it's used it generates garbage where
   * as there is almost never allocation with the second style.
   *
   * It is always save to pass any vector as the destination. So for example
   *
   *     v3.cross(v1, v2, v1);  // Puts the cross product of v1 x v2 in v1
   *
   * @module twgl/v3
   */

  var VecType = Float32Array;

  /**
   * A JavaScript array with 3 values or a Float32Array with 3 values.
   * When created by the library will create the default type which is `Float32Array`
   * but can be set by calling {@link module:twgl/v3.setDefaultType}.
   * @typedef {(number[]|Float32Array)} Vec3
   * @memberOf module:twgl/v3
   */

  /**
   * Sets the type this library creates for a Vec3
   * @param {constructor} ctor the constructor for the type. Either `Float32Array` or `Array`
   */
  function setDefaultType(ctor) {
      VecType = ctor;
  }

  /**
   * Creates a vec3
   * @return {Vec3} the created vector
   * @memberOf module:twgl/v3
   */
  function create() {
    return new VecType(3);
  }

  /**
   * Adds two vectors; assumes a and b have the same dimension.
   * @param {module:twgl/v3.Vec3} a Operand vector.
   * @param {module:twgl/v3.Vec3} b Operand vector.
   * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
   * @memberOf module:twgl/v3
   */
  function add(a, b, dst) {
    dst = dst || new VecType(3);

    dst[0] = a[0] + b[0];
    dst[1] = a[1] + b[1];
    dst[2] = a[2] + b[2];

    return dst;
  }

  /**
   * Subtracts two vectors.
   * @param {module:twgl/v3.Vec3} a Operand vector.
   * @param {module:twgl/v3.Vec3} b Operand vector.
   * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
   * @memberOf module:twgl/v3
   */
  function subtract(a, b, dst) {
    dst = dst || new VecType(3);

    dst[0] = a[0] - b[0];
    dst[1] = a[1] - b[1];
    dst[2] = a[2] - b[2];

    return dst;
  }

  /**
   * Performs linear interpolation on two vectors.
   * Given vectors a and b and interpolation coefficient t, returns
   * (1 - t) * a + t * b.
   * @param {module:twgl/v3.Vec3} a Operand vector.
   * @param {module:twgl/v3.Vec3} b Operand vector.
   * @param {number} t Interpolation coefficient.
   * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
   * @memberOf module:twgl/v3
   */
  function lerp(a, b, t, dst) {
    dst = dst || new VecType(3);

    dst[0] = (1 - t) * a[0] + t * b[0];
    dst[1] = (1 - t) * a[1] + t * b[1];
    dst[2] = (1 - t) * a[2] + t * b[2];

    return dst;
  }

  /**
   * Mutiplies a vector by a scalar.
   * @param {module:twgl/v3.Vec3} v The vector.
   * @param {number} k The scalar.
   * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
   * @return {module:twgl/v3.Vec3} dst.
   * @memberOf module:twgl/v3
   */
  function mulScalar(v, k, dst) {
    dst = dst || new VecType(3);

    dst[0] = v[0] * k;
    dst[1] = v[1] * k;
    dst[2] = v[2] * k;

    return dst;
  }

  /**
   * Divides a vector by a scalar.
   * @param {module:twgl/v3.Vec3} v The vector.
   * @param {number} k The scalar.
   * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
   * @return {module:twgl/v3.Vec3} dst.
   * @memberOf module:twgl/v3
   */
  function divScalar(v, k, dst) {
    dst = dst || new VecType(3);

    dst[0] = v[0] / k;
    dst[1] = v[1] / k;
    dst[2] = v[2] / k;

    return dst;
  }

  /**
   * Computes the cross product of two vectors; assumes both vectors have
   * three entries.
   * @param {module:twgl/v3.Vec3} a Operand vector.
   * @param {module:twgl/v3.Vec3} b Operand vector.
   * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
   * @return {module:twgl/v3.Vec3} The vector a cross b.
   * @memberOf module:twgl/v3
   */
  function cross(a, b, dst) {
    dst = dst || new VecType(3);

    dst[0] = a[1] * b[2] - a[2] * b[1];
    dst[1] = a[2] * b[0] - a[0] * b[2];
    dst[2] = a[0] * b[1] - a[1] * b[0];

    return dst;
  }

  /**
   * Computes the dot product of two vectors; assumes both vectors have
   * three entries.
   * @param {module:twgl/v3.Vec3} a Operand vector.
   * @param {module:twgl/v3.Vec3} b Operand vector.
   * @return {number} dot product
   * @memberOf module:twgl/v3
   */
  function dot(a, b) {
    return (a[0] * b[0]) + (a[1] * b[1]) + (a[2] * b[2]);
  }

  /**
   * Computes the length of vector
   * @param {module:twgl/v3.Vec3} v vector.
   * @return {number} length of vector.
   * @memberOf module:twgl/v3
   */
  function length(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  }

  /**
   * Computes the square of the length of vector
   * @param {module:twgl/v3.Vec3} v vector.
   * @return {number} square of the length of vector.
   * @memberOf module:twgl/v3
   */
  function lengthSq(v) {
    return v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
  }

  /**
   * Divides a vector by its Euclidean length and returns the quotient.
   * @param {module:twgl/v3.Vec3} a The vector.
   * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
   * @return {module:twgl/v3.Vec3} The normalized vector.
   * @memberOf module:twgl/v3
   */
  function normalize(a, dst) {
    dst = dst || new VecType(3);

    var lenSq = a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
    var len = Math.sqrt(lenSq);
    if (len > 0.00001) {
      dst[0] = a[0] / len;
      dst[1] = a[1] / len;
      dst[2] = a[2] / len;
    } else {
      dst[0] = 0;
      dst[1] = 0;
      dst[2] = 0;
    }

    return dst;
  }

  /**
   * Negates a vector.
   * @param {module:twgl/v3.Vec3} v The vector.
   * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
   * @return {module:twgl/v3.Vec3} -v.
   * @memberOf module:twgl/v3
   */
  function negate(v, dst) {
    dst = dst || new VecType(3);

    dst[0] = -v[0];
    dst[1] = -v[1];
    dst[2] = -v[2];

    return dst;
  }

  /**
   * Copies a vector.
   * @param {module:twgl/v3.Vec3} v The vector.
   * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
   * @return {module:twgl/v3.Vec3} A copy of v.
   * @memberOf module:twgl/v3
   */
  function copy(v, dst) {
    dst = dst || new VecType(3);

    dst[0] = v[0];
    dst[1] = v[1];
    dst[2] = v[2];

    return dst;
  }

  /**
   * Multiplies a vector by another vector (component-wise); assumes a and
   * b have the same length.
   * @param {module:twgl/v3.Vec3} a Operand vector.
   * @param {module:twgl/v3.Vec3} b Operand vector.
   * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
   * @return {module:twgl/v3.Vec3} The vector of products of entries of a and
   *     b.
   * @memberOf module:twgl/v3
   */
  function multiply(a, b, dst) {
    dst = dst || new VecType(3);

    dst[0] = a[0] * b[0];
    dst[1] = a[1] * b[1];
    dst[2] = a[2] * b[2];

    return dst;
  }

  /**
   * Divides a vector by another vector (component-wise); assumes a and
   * b have the same length.
   * @param {module:twgl/v3.Vec3} a Operand vector.
   * @param {module:twgl/v3.Vec3} b Operand vector.
   * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
   * @return {module:twgl/v3.Vec3} The vector of quotients of entries of a and
   *     b.
   * @memberOf module:twgl/v3
   */
  function divide(a, b, dst) {
    dst = dst || new VecType(3);

    dst[0] = a[0] / b[0];
    dst[1] = a[1] / b[1];
    dst[2] = a[2] / b[2];

    return dst;
  }

  // Using quotes prevents Uglify from changing the names.
  // No speed diff AFAICT.
  return {
    "add": add,
    "copy": copy,
    "create": create,
    "cross": cross,
    "divide": divide,
    "divScalar": divScalar,
    "dot": dot,
    "lerp": lerp,
    "length": length,
    "lengthSq": lengthSq,
    "mulScalar": mulScalar,
    "multiply": multiply,
    "negate": negate,
    "normalize": normalize,
    "setDefaultType": setDefaultType,
    "subtract": subtract,
  };

});

/*
 * Copyright 2015, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of his
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */



define('twgl/m4',['./v3'], function (v3) {

  /**
   * 4x4 Matrix math math functions.
   *
   * Almost all functions take an optional `dst` argument. If it is not passed in the
   * functions will create a new matrix. In other words you can do this
   *
   *     var mat = m4.translation([1, 2, 3]);  // Creates a new translation matrix
   *
   * or
   *
   *     var mat = m4.create();
   *     m4.translation([1, 2, 3], mat);  // Puts translation matrix in mat.
   *
   * The first style is often easier but depending on where it's used it generates garbage where
   * as there is almost never allocation with the second style.
   *
   * It is always save to pass any matrix as the destination. So for example
   *
   *     var mat = m4.identity();
   *     var trans = m4.translation([1, 2, 3]);
   *     m4.multiply(mat, trans, mat);  // Multiplies mat * trans and puts result in mat.
   *
   * @module twgl/m4
   */
  var MatType = Float32Array;

  var tempV3a = v3.create();
  var tempV3b = v3.create();
  var tempV3c = v3.create();

  /**
   * A JavaScript array with 16 values or a Float32Array with 16 values.
   * When created by the library will create the default type which is `Float32Array`
   * but can be set by calling {@link module:twgl/m4.setDefaultType}.
   * @typedef {(number[]|Float32Array)} Mat4
   * @memberOf module:twgl/m4
   */

  /**
   * Sets the type this library creates for a Mat4
   * @param {constructor} ctor the constructor for the type. Either `Float32Array` or `Array`
   */
  function setDefaultType(ctor) {
      VecType = ctor;
  }

  /**
   * Negates a matrix.
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} -m.
   * @memberOf module:twgl/m4
   */
  function negate(m, dst) {
    dst = dst || new MatType(16);

    dst[ 0] = -m[ 0];
    dst[ 1] = -m[ 1];
    dst[ 2] = -m[ 2];
    dst[ 3] = -m[ 3];
    dst[ 4] = -m[ 4];
    dst[ 5] = -m[ 5];
    dst[ 6] = -m[ 6];
    dst[ 7] = -m[ 7];
    dst[ 8] = -m[ 8];
    dst[ 9] = -m[ 9];
    dst[10] = -m[10];
    dst[11] = -m[11];
    dst[12] = -m[12];
    dst[13] = -m[13];
    dst[14] = -m[14];
    dst[15] = -m[15];

    return dst;
  }

  /**
   * Copies a matrix.
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @param {module:twgl/m4.Mat4} [dst] The matrix.
   * @return {module:twgl/m4.Mat4} A copy of m.
   * @memberOf module:twgl/m4
   */
  function copy(m, dst) {
    dst = dst || new MatType(16);

    dst[ 0] = m[ 0];
    dst[ 1] = m[ 1];
    dst[ 2] = m[ 2];
    dst[ 3] = m[ 3];
    dst[ 4] = m[ 4];
    dst[ 5] = m[ 5];
    dst[ 6] = m[ 6];
    dst[ 7] = m[ 7];
    dst[ 8] = m[ 8];
    dst[ 9] = m[ 9];
    dst[10] = m[10];
    dst[11] = m[11];
    dst[12] = m[12];
    dst[13] = m[13];
    dst[14] = m[14];
    dst[15] = m[15];

    return dst;
  }

  /**
   * Creates an n-by-n identity matrix.
   *
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} An n-by-n identity matrix.
   * @memberOf module:twgl/m4
   */
  function identity(dst) {
    dst = dst || new MatType(16);

    dst[ 0] = 1;
    dst[ 1] = 0;
    dst[ 2] = 0;
    dst[ 3] = 0;
    dst[ 4] = 0;
    dst[ 5] = 1;
    dst[ 6] = 0;
    dst[ 7] = 0;
    dst[ 8] = 0;
    dst[ 9] = 0;
    dst[10] = 1;
    dst[11] = 0;
    dst[12] = 0;
    dst[13] = 0;
    dst[14] = 0;
    dst[15] = 1;

    return dst;
  }

  /**
   * Takes the transpose of a matrix.
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} The transpose of m.
   * @memberOf module:twgl/m4
   */
   function transpose(m, dst) {
    dst = dst || new MatType(16);
    if (dst === m) {
      var t;

      t = m[1];
      m[1] = m[4];
      m[4] = t;

      t = m[2];
      m[2] = m[8];
      m[8] = t;

      t = m[3];
      m[3] = m[12];
      m[12] = t;

      t = m[6];
      m[6] = m[9];
      m[9] = t;

      t = m[7];
      m[7] = m[13];
      m[13] = t;

      t = m[11];
      m[11] = m[14];
      m[14] = t;
      return dst;
    }

    var m00 = m[0 * 4 + 0];
    var m01 = m[0 * 4 + 1];
    var m02 = m[0 * 4 + 2];
    var m03 = m[0 * 4 + 3];
    var m10 = m[1 * 4 + 0];
    var m11 = m[1 * 4 + 1];
    var m12 = m[1 * 4 + 2];
    var m13 = m[1 * 4 + 3];
    var m20 = m[2 * 4 + 0];
    var m21 = m[2 * 4 + 1];
    var m22 = m[2 * 4 + 2];
    var m23 = m[2 * 4 + 3];
    var m30 = m[3 * 4 + 0];
    var m31 = m[3 * 4 + 1];
    var m32 = m[3 * 4 + 2];
    var m33 = m[3 * 4 + 3];

    dst[ 0] = m00;
    dst[ 1] = m10;
    dst[ 2] = m20;
    dst[ 3] = m30;
    dst[ 4] = m01;
    dst[ 5] = m11;
    dst[ 6] = m21;
    dst[ 7] = m31;
    dst[ 8] = m02;
    dst[ 9] = m12;
    dst[10] = m22;
    dst[11] = m32;
    dst[12] = m03;
    dst[13] = m13;
    dst[14] = m23;
    dst[15] = m33;

    return dst;
  }

  /**
   * Computes the inverse of a 4-by-4 matrix.
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} The inverse of m.
   * @memberOf module:twgl/m4
   */
  function inverse(m, dst) {
    dst = dst || new MatType(16);

    var m00 = m[0 * 4 + 0];
    var m01 = m[0 * 4 + 1];
    var m02 = m[0 * 4 + 2];
    var m03 = m[0 * 4 + 3];
    var m10 = m[1 * 4 + 0];
    var m11 = m[1 * 4 + 1];
    var m12 = m[1 * 4 + 2];
    var m13 = m[1 * 4 + 3];
    var m20 = m[2 * 4 + 0];
    var m21 = m[2 * 4 + 1];
    var m22 = m[2 * 4 + 2];
    var m23 = m[2 * 4 + 3];
    var m30 = m[3 * 4 + 0];
    var m31 = m[3 * 4 + 1];
    var m32 = m[3 * 4 + 2];
    var m33 = m[3 * 4 + 3];
    var tmp_0  = m22 * m33;
    var tmp_1  = m32 * m23;
    var tmp_2  = m12 * m33;
    var tmp_3  = m32 * m13;
    var tmp_4  = m12 * m23;
    var tmp_5  = m22 * m13;
    var tmp_6  = m02 * m33;
    var tmp_7  = m32 * m03;
    var tmp_8  = m02 * m23;
    var tmp_9  = m22 * m03;
    var tmp_10 = m02 * m13;
    var tmp_11 = m12 * m03;
    var tmp_12 = m20 * m31;
    var tmp_13 = m30 * m21;
    var tmp_14 = m10 * m31;
    var tmp_15 = m30 * m11;
    var tmp_16 = m10 * m21;
    var tmp_17 = m20 * m11;
    var tmp_18 = m00 * m31;
    var tmp_19 = m30 * m01;
    var tmp_20 = m00 * m21;
    var tmp_21 = m20 * m01;
    var tmp_22 = m00 * m11;
    var tmp_23 = m10 * m01;

    var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
        (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
    var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
        (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
    var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
        (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
    var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
        (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

    var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    dst[ 0] = d * t0;
    dst[ 1] = d * t1;
    dst[ 2] = d * t2;
    dst[ 3] = d * t3;
    dst[ 4] = d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
            (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30));
    dst[ 5] = d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
            (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30));
    dst[ 6] = d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
            (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30));
    dst[ 7] = d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
            (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20));
    dst[ 8] = d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
            (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33));
    dst[ 9] = d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
            (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33));
    dst[10] = d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
            (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33));
    dst[11] = d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
            (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23));
    dst[12] = d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
            (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22));
    dst[13] = d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
            (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02));
    dst[14] = d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
            (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12));
    dst[15] = d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
            (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02));

    return dst;
  }

  /**
   * Multiplies two 4-by-4 matrices; assumes that the given matrices are 4-by-4;
   * assumes matrix entries are accessed in [row][column] fashion.
   * @param {module:twgl/m4.Mat4} a The matrix on the left.
   * @param {module:twgl/m4.Mat4} b The matrix on the right.
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} The matrix product of a and b.
   * @memberOf module:twgl/m4
   */
  function multiply(a, b, dst) {
    dst = dst || new MatType(16);

    var a00 = a[0];
    var a01 = a[1];
    var a02 = a[2];
    var a03 = a[3];
    var a10 = a[ 4 + 0];
    var a11 = a[ 4 + 1];
    var a12 = a[ 4 + 2];
    var a13 = a[ 4 + 3];
    var a20 = a[ 8 + 0];
    var a21 = a[ 8 + 1];
    var a22 = a[ 8 + 2];
    var a23 = a[ 8 + 3];
    var a30 = a[12 + 0];
    var a31 = a[12 + 1];
    var a32 = a[12 + 2];
    var a33 = a[12 + 3];
    var b00 = b[0];
    var b01 = b[1];
    var b02 = b[2];
    var b03 = b[3];
    var b10 = b[ 4 + 0];
    var b11 = b[ 4 + 1];
    var b12 = b[ 4 + 2];
    var b13 = b[ 4 + 3];
    var b20 = b[ 8 + 0];
    var b21 = b[ 8 + 1];
    var b22 = b[ 8 + 2];
    var b23 = b[ 8 + 3];
    var b30 = b[12 + 0];
    var b31 = b[12 + 1];
    var b32 = b[12 + 2];
    var b33 = b[12 + 3];

    dst[ 0] = a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30;
    dst[ 1] = a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31;
    dst[ 2] = a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32;
    dst[ 3] = a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33;
    dst[ 4] = a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30;
    dst[ 5] = a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31;
    dst[ 6] = a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32;
    dst[ 7] = a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33;
    dst[ 8] = a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30;
    dst[ 9] = a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31;
    dst[10] = a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32;
    dst[11] = a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33;
    dst[12] = a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30;
    dst[13] = a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31;
    dst[14] = a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32;
    dst[15] = a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33;

    return dst;
  }

  /**
   * Sets the translation component of a 4-by-4 matrix to the given
   * vector.
   * @param {module:twgl/m4.Mat4} a The matrix.
   * @param {Vec3} v The vector.
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} a once modified.
   * @memberOf module:twgl/m4
   */
  function setTranslation(a, v, dst) {
    dst = dst || identity();
    if (a !== dst) {
      dst[ 0] = a[ 0];
      dst[ 1] = a[ 1];
      dst[ 2] = a[ 2];
      dst[ 3] = a[ 3];
      dst[ 4] = a[ 4];
      dst[ 5] = a[ 5];
      dst[ 6] = a[ 6];
      dst[ 7] = a[ 7];
      dst[ 8] = a[ 8];
      dst[ 9] = a[ 9];
      dst[10] = a[10];
      dst[11] = a[11];
    }
    dst[12] = v[0];
    dst[13] = v[1];
    dst[14] = v[2];
    dst[15] = 1;
    return dst;
  }

  /**
   * Returns the translation component of a 4-by-4 matrix as a vector with 3
   * entries.
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @return {Vec3} [dst] vector..
   * @return {Vec3} The translation component of m.
   * @memberOf module:twgl/m4
   */
  function getTranslation(m, dst) {
    dst = dst || v3.create();
    dst[0] = m[12];
    dst[1] = m[13];
    dst[2] = m[14];
    return dst;
  }

  /**
   * Returns the axis of a 4x4 matrix as a vector with 3 entries
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @param {number} axis The axis 0 = x, 1 = y, 2 = z;
   * @return {Vec3} [dst] vector.
   * @return {Vec3} The axis component of m.
   * @memberOf module:twgl/m4
   */
  function getAxis(m, axis, dst) {
    dst = dst || v3.create();
    var off = axis * 4;
    dst[0] = m[off + 0];
    dst[1] = m[off + 1];
    dst[2] = m[off + 2];
    return dst;
  }

  /**
   * Computes a 4-by-4 perspective transformation matrix given the angular height
   * of the frustum, the aspect ratio, and the near and far clipping planes.  The
   * arguments define a frustum extending in the negative z direction.  The given
   * angle is the vertical angle of the frustum, and the horizontal angle is
   * determined to produce the given aspect ratio.  The arguments near and far are
   * the distances to the near and far clipping planes.  Note that near and far
   * are not z coordinates, but rather they are distances along the negative
   * z-axis.  The matrix generated sends the viewing frustum to the unit box.
   * We assume a unit box extending from -1 to 1 in the x and y dimensions and
   * from 0 to 1 in the z dimension.
   * @param {number} fieldOfViewYInRadians The camera angle from top to bottom (in radians).
   * @param {number} aspect The aspect ratio width / height.
   * @param {number} zNear The depth (negative z coordinate)
   *     of the near clipping plane.
   * @param {number} zFar The depth (negative z coordinate)
   *     of the far clipping plane.
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} The perspective matrix.
   * @memberOf module:twgl/m4
   */
  function perspective(fieldOfViewYInRadians, aspect, zNear, zFar, dst) {
    dst = dst || new MatType(16);

    var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewYInRadians);
    var rangeInv = 1.0 / (zNear - zFar);

    dst[0]  = f / aspect;
    dst[1]  = 0;
    dst[2]  = 0;
    dst[3]  = 0;

    dst[4]  = 0;
    dst[5]  = f;
    dst[6]  = 0;
    dst[7]  = 0;

    dst[8]  = 0;
    dst[9]  = 0;
    dst[10] = (zNear + zFar) * rangeInv;
    dst[11] = -1;

    dst[12] = 0;
    dst[13] = 0;
    dst[14] = zNear * zFar * rangeInv * 2;
    dst[15] = 0;

    return dst;
  }

  /**
   * Computes a 4-by-4 othogonal transformation matrix given the left, right,
   * bottom, and top dimensions of the near clipping plane as well as the
   * near and far clipping plane distances.
   * @param {number} left Left side of the near clipping plane viewport.
   * @param {number} right Right side of the near clipping plane viewport.
   * @param {number} top Top of the near clipping plane viewport.
   * @param {number} bottom Bottom of the near clipping plane viewport.
   * @param {number} near The depth (negative z coordinate)
   *     of the near clipping plane.
   * @param {number} far The depth (negative z coordinate)
   *     of the far clipping plane.
   * @param {module:twgl/m4.Mat4} [dst] Output matrix.
   * @return {module:twgl/m4.Mat4} The perspective matrix.
   * @memberOf module:twgl/m4
   */
  function ortho(left, right, bottom, top, near, far, dst) {
    dst = dst || new MatType(16);

    dst[0]  = 2 / (right - left);
    dst[1]  = 0;
    dst[2]  = 0;
    dst[3]  = 0;

    dst[4]  = 0;
    dst[5]  = 2 / (top - bottom);
    dst[6]  = 0;
    dst[7]  = 0;

    dst[8]  = 0;
    dst[9]  = 0;
    dst[10] = -1 / (far - near);
    dst[11] = 0;

    dst[12] = (right + left) / (left - right);
    dst[13] = (top + bottom) / (bottom - top);
    dst[14] = -near / (near - far);
    dst[15] = 1;

    return dst;
  }

  /**
   * Computes a 4-by-4 perspective transformation matrix given the left, right,
   * top, bottom, near and far clipping planes. The arguments define a frustum
   * extending in the negative z direction. The arguments near and far are the
   * distances to the near and far clipping planes. Note that near and far are not
   * z coordinates, but rather they are distances along the negative z-axis. The
   * matrix generated sends the viewing frustum to the unit box. We assume a unit
   * box extending from -1 to 1 in the x and y dimensions and from 0 to 1 in the z
   * dimension.
   * @param {number} left The x coordinate of the left plane of the box.
   * @param {number} right The x coordinate of the right plane of the box.
   * @param {number} bottom The y coordinate of the bottom plane of the box.
   * @param {number} top The y coordinate of the right plane of the box.
   * @param {number} near The negative z coordinate of the near plane of the box.
   * @param {number} far The negative z coordinate of the far plane of the box.
   * @param {module:twgl/m4.Mat4} [dst] Output matrix.
   * @return {module:twgl/m4.Mat4} The perspective projection matrix.
   * @memberOf module:twgl/m4
   */
  function frustum(left, right, bottom, top, near, far, dst) {
    dst = dst || new MatType(16);

    var dx = (right - left);
    var dy = (top - bottom);
    var dz = (near - far);

    dst[ 0] = 2 * near / dx;
    dst[ 1] = 0;
    dst[ 2] = 0;
    dst[ 3] = 0;
    dst[ 4] = 0;
    dst[ 5] = 2 * near / dy;
    dst[ 6] = 0;
    dst[ 7] = 0;
    dst[ 8] = (left + right) / dx;
    dst[ 9] = (top + bottom) / dy;
    dst[10] = far / dz;
    dst[11] = -1;
    dst[12] = 0;
    dst[13] = 0;
    dst[14] = near * far / dz;
    dst[15] = 0;

    return dst;
  }

  /**
   * Computes a 4-by-4 look-at transformation.
   *
   * This is a matrix which positions the camera itself. If you want
   * a view matrix (a matrix which moves things in front of the camera)
   * take the inverse of this.
   *
   * @param {Vec3} eye The position of the eye.
   * @param {Vec3} target The position meant to be viewed.
   * @param {Vec3} up A vector pointing up.
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} The look-at matrix.
   * @memberOf module:twgl/m4
   */
  function lookAt(eye, target, up, dst) {
    dst = dst || new MatType(16);

    var xAxis = tempV3a;
    var yAxis = tempV3b;
    var zAxis = tempV3c;

    v3.normalize(
        v3.subtract(eye, target, zAxis), zAxis);
    v3.normalize(v3.cross(up, zAxis, xAxis), xAxis);
    v3.normalize(v3.cross(zAxis, xAxis, yAxis), yAxis);

    dst[ 0] = xAxis[0];
    dst[ 1] = xAxis[1];
    dst[ 2] = xAxis[2];
    dst[ 3] = 0;
    dst[ 4] = yAxis[0];
    dst[ 5] = yAxis[1];
    dst[ 6] = yAxis[2];
    dst[ 7] = 0;
    dst[ 8] = zAxis[0];
    dst[ 9] = zAxis[1];
    dst[10] = zAxis[2];
    dst[11] = 0;
    dst[12] = eye[0];
    dst[13] = eye[1];
    dst[14] = eye[2];
    dst[15] = 1;

    return dst;
  }

  /**
   * Creates a 4-by-4 matrix which translates by the given vector v.
   * @param {Vec3} v The vector by
   *     which to translate.
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} The translation matrix.
   * @memberOf module:twgl/m4
   */
  function translation(v, dst) {
    dst = dst || new MatType(16);

    dst[ 0] = 1;
    dst[ 1] = 0;
    dst[ 2] = 0;
    dst[ 3] = 0;
    dst[ 4] = 0;
    dst[ 5] = 1;
    dst[ 6] = 0;
    dst[ 7] = 0;
    dst[ 8] = 0;
    dst[ 9] = 0;
    dst[10] = 1;
    dst[11] = 0;
    dst[12] = v[0];
    dst[13] = v[1];
    dst[14] = v[2];
    dst[15] = 1;
    return dst;
  }

  /**
   * Modifies the given 4-by-4 matrix by translation by the given vector v.
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @param {Vec3} v The vector by
   *     which to translate.
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} m once modified.
   * @memberOf module:twgl/m4
   */
  function translate(m, v, dst) {
    dst = dst || new MatType(16);

    var v0 = v[0];
    var v1 = v[1];
    var v2 = v[2];
    var m00 = m[0];
    var m01 = m[1];
    var m02 = m[2];
    var m03 = m[3];
    var m10 = m[1 * 4 + 0];
    var m11 = m[1 * 4 + 1];
    var m12 = m[1 * 4 + 2];
    var m13 = m[1 * 4 + 3];
    var m20 = m[2 * 4 + 0];
    var m21 = m[2 * 4 + 1];
    var m22 = m[2 * 4 + 2];
    var m23 = m[2 * 4 + 3];
    var m30 = m[3 * 4 + 0];
    var m31 = m[3 * 4 + 1];
    var m32 = m[3 * 4 + 2];
    var m33 = m[3 * 4 + 3];

    if (m !== dst) {
      dst[ 0] = m00;
      dst[ 1] = m01;
      dst[ 2] = m02;
      dst[ 3] = m03;
      dst[ 4] = m10;
      dst[ 5] = m11;
      dst[ 6] = m12;
      dst[ 7] = m13;
      dst[ 8] = m20;
      dst[ 9] = m21;
      dst[10] = m22;
      dst[11] = m23;
    }

    dst[12] = m00 * v0 + m10 * v1 + m20 * v2 + m30;
    dst[13] = m01 * v0 + m11 * v1 + m21 * v2 + m31;
    dst[14] = m02 * v0 + m12 * v1 + m22 * v2 + m32;
    dst[15] = m03 * v0 + m13 * v1 + m23 * v2 + m33;

    return dst;
  }

  /**
   * Creates a 4-by-4 matrix which rotates around the x-axis by the given angle.
   * @param {number} angleInRadians The angle by which to rotate (in radians).
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} The rotation matrix.
   * @memberOf module:twgl/m4
   */
  function rotationX(angleInRadians, dst) {
    dst = dst || new MatType(16);

    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    dst[ 0] = 1;
    dst[ 1] = 0;
    dst[ 2] = 0;
    dst[ 3] = 0;
    dst[ 4] = 0;
    dst[ 5] = c;
    dst[ 6] = s;
    dst[ 7] = 0;
    dst[ 8] = 0;
    dst[ 9] = -s;
    dst[10] = c;
    dst[11] = 0;
    dst[12] = 0;
    dst[13] = 0;
    dst[14] = 0;
    dst[15] = 1;

    return dst;
  }

  /**
   * Modifies the given 4-by-4 matrix by a rotation around the x-axis by the given
   * angle.
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @param {number} angleInRadians The angle by which to rotate (in radians).
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} m once modified.
   * @memberOf module:twgl/m4
   */
  function rotateX(m, angleInRadians, dst) {
    dst = dst || new MatType(16);

    var m10 = m[4];
    var m11 = m[5];
    var m12 = m[6];
    var m13 = m[7];
    var m20 = m[8];
    var m21 = m[9];
    var m22 = m[10];
    var m23 = m[11];
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    dst[4]  = c * m10 + s * m20;
    dst[5]  = c * m11 + s * m21;
    dst[6]  = c * m12 + s * m22;
    dst[7]  = c * m13 + s * m23;
    dst[8]  = c * m20 - s * m10;
    dst[9]  = c * m21 - s * m11;
    dst[10] = c * m22 - s * m12;
    dst[11] = c * m23 - s * m13;

    if (m !== dst) {
      dst[ 0] = m[ 0];
      dst[ 1] = m[ 1];
      dst[ 2] = m[ 2];
      dst[ 3] = m[ 3];
      dst[12] = m[12];
      dst[13] = m[13];
      dst[14] = m[14];
      dst[15] = m[15];
    }

    return dst;
  }

  /**
   * Creates a 4-by-4 matrix which rotates around the y-axis by the given angle.
   * @param {number} angleInRadians The angle by which to rotate (in radians).
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} The rotation matrix.
   * @memberOf module:twgl/m4
   */
  function rotationY(angleInRadians, dst) {
    dst = dst || new MatType(16);

    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    dst[ 0] = c;
    dst[ 1] = 0;
    dst[ 2] = -s;
    dst[ 3] = 0;
    dst[ 4] = 0;
    dst[ 5] = 1;
    dst[ 6] = 0;
    dst[ 7] = 0;
    dst[ 8] = s;
    dst[ 9] = 0;
    dst[10] = c;
    dst[11] = 0;
    dst[12] = 0;
    dst[13] = 0;
    dst[14] = 0;
    dst[15] = 1;

    return dst;
  }

  /**
   * Modifies the given 4-by-4 matrix by a rotation around the y-axis by the given
   * angle.
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @param {number} angleInRadians The angle by which to rotate (in radians).
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} m once modified.
   * @memberOf module:twgl/m4
   */
  function rotateY(m, angleInRadians, dst) {
    dst = dst || new MatType(16);

    var m00 = m[0 * 4 + 0];
    var m01 = m[0 * 4 + 1];
    var m02 = m[0 * 4 + 2];
    var m03 = m[0 * 4 + 3];
    var m20 = m[2 * 4 + 0];
    var m21 = m[2 * 4 + 1];
    var m22 = m[2 * 4 + 2];
    var m23 = m[2 * 4 + 3];
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    dst[ 0] = c * m00 - s * m20;
    dst[ 1] = c * m01 - s * m21;
    dst[ 2] = c * m02 - s * m22;
    dst[ 3] = c * m03 - s * m23;
    dst[ 8] = c * m20 + s * m00;
    dst[ 9] = c * m21 + s * m01;
    dst[10] = c * m22 + s * m02;
    dst[11] = c * m23 + s * m03;

    if (m !== dst) {
      dst[ 4] = m[ 4];
      dst[ 5] = m[ 5];
      dst[ 6] = m[ 6];
      dst[ 7] = m[ 7];
      dst[12] = m[12];
      dst[13] = m[13];
      dst[14] = m[14];
      dst[15] = m[15];
    }

    return dst;
  }

  /**
   * Creates a 4-by-4 matrix which rotates around the z-axis by the given angle.
   * @param {number} angleInRadians The angle by which to rotate (in radians).
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} The rotation matrix.
   * @memberOf module:twgl/m4
   */
  function rotationZ(angleInRadians, dst) {
    dst = dst || new MatType(16);

    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    dst[ 0] = c;
    dst[ 1] = s;
    dst[ 2] = 0;
    dst[ 3] = 0;
    dst[ 4] = -s;
    dst[ 5] = c;
    dst[ 6] = 0;
    dst[ 7] = 0;
    dst[ 8] = 0;
    dst[ 9] = 0;
    dst[10] = 1;
    dst[11] = 0;
    dst[12] = 0;
    dst[13] = 0;
    dst[14] = 0;
    dst[15] = 1;

    return dst;
  }

  /**
   * Modifies the given 4-by-4 matrix by a rotation around the z-axis by the given
   * angle.
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @param {number} angleInRadians The angle by which to rotate (in radians).
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} m once modified.
   * @memberOf module:twgl/m4
   */
  function rotateZ(m, angleInRadians, dst) {
    dst = dst || new MatType(16);

    var m00 = m[0 * 4 + 0];
    var m01 = m[0 * 4 + 1];
    var m02 = m[0 * 4 + 2];
    var m03 = m[0 * 4 + 3];
    var m10 = m[1 * 4 + 0];
    var m11 = m[1 * 4 + 1];
    var m12 = m[1 * 4 + 2];
    var m13 = m[1 * 4 + 3];
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    dst[ 0] = c * m00 + s * m10;
    dst[ 1] = c * m01 + s * m11;
    dst[ 2] = c * m02 + s * m12;
    dst[ 3] = c * m03 + s * m13;
    dst[ 4] = c * m10 - s * m00;
    dst[ 5] = c * m11 - s * m01;
    dst[ 6] = c * m12 - s * m02;
    dst[ 7] = c * m13 - s * m03;

    if (m !== dst) {
      dst[ 8] = m[ 8];
      dst[ 9] = m[ 9];
      dst[10] = m[10];
      dst[11] = m[11];
      dst[12] = m[12];
      dst[13] = m[13];
      dst[14] = m[14];
      dst[15] = m[15];
    }

    return dst;
  }

  /**
   * Creates a 4-by-4 matrix which rotates around the given axis by the given
   * angle.
   * @param {Vec3} axis The axis
   *     about which to rotate.
   * @param {number} angleInRadians The angle by which to rotate (in radians).
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} A matrix which rotates angle radians
   *     around the axis.
   * @memberOf module:twgl/m4
   */
  function axisRotation(axis, angleInRadians, dst) {
    dst = dst || new MatType(16);

    var x = axis[0];
    var y = axis[1];
    var z = axis[2];
    var n = Math.sqrt(x * x + y * y + z * z);
    x /= n;
    y /= n;
    z /= n;
    var xx = x * x;
    var yy = y * y;
    var zz = z * z;
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    var oneMinusCosine = 1 - c;

    dst[ 0] = xx + (1 - xx) * c;
    dst[ 1] = x * y * oneMinusCosine + z * s;
    dst[ 2] = x * z * oneMinusCosine - y * s;
    dst[ 3] = 0;
    dst[ 4] = x * y * oneMinusCosine - z * s;
    dst[ 5] = yy + (1 - yy) * c;
    dst[ 6] = y * z * oneMinusCosine + x * s;
    dst[ 7] = 0;
    dst[ 8] = x * z * oneMinusCosine + y * s;
    dst[ 9] = y * z * oneMinusCosine - x * s;
    dst[10] = zz + (1 - zz) * c;
    dst[11] = 0;
    dst[12] = 0;
    dst[13] = 0;
    dst[14] = 0;
    dst[15] = 1;

    return dst;
  }

  /**
   * Modifies the given 4-by-4 matrix by rotation around the given axis by the
   * given angle.
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @param {Vec3} axis The axis
   *     about which to rotate.
   * @param {number} angleInRadians The angle by which to rotate (in radians).
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} m once modified.
   * @memberOf module:twgl/m4
   */
  function axisRotate(m, axis, angleInRadians, dst) {
    dst = dst || new MatType(16);

    var x = axis[0];
    var y = axis[1];
    var z = axis[2];
    var n = Math.sqrt(x * x + y * y + z * z);
    x /= n;
    y /= n;
    z /= n;
    var xx = x * x;
    var yy = y * y;
    var zz = z * z;
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    var oneMinusCosine = 1 - c;

    var r00 = xx + (1 - xx) * c;
    var r01 = x * y * oneMinusCosine + z * s;
    var r02 = x * z * oneMinusCosine - y * s;
    var r10 = x * y * oneMinusCosine - z * s;
    var r11 = yy + (1 - yy) * c;
    var r12 = y * z * oneMinusCosine + x * s;
    var r20 = x * z * oneMinusCosine + y * s;
    var r21 = y * z * oneMinusCosine - x * s;
    var r22 = zz + (1 - zz) * c;

    var m00 = m[0];
    var m01 = m[1];
    var m02 = m[2];
    var m03 = m[3];
    var m10 = m[4];
    var m11 = m[5];
    var m12 = m[6];
    var m13 = m[7];
    var m20 = m[8];
    var m21 = m[9];
    var m22 = m[10];
    var m23 = m[11];

    dst[ 0] = r00 * m00 + r01 * m10 + r02 * m20;
    dst[ 1] = r00 * m01 + r01 * m11 + r02 * m21;
    dst[ 2] = r00 * m02 + r01 * m12 + r02 * m22;
    dst[ 3] = r00 * m03 + r01 * m13 + r02 * m23;
    dst[ 4] = r10 * m00 + r11 * m10 + r12 * m20;
    dst[ 5] = r10 * m01 + r11 * m11 + r12 * m21;
    dst[ 6] = r10 * m02 + r11 * m12 + r12 * m22;
    dst[ 7] = r10 * m03 + r11 * m13 + r12 * m23;
    dst[ 8] = r20 * m00 + r21 * m10 + r22 * m20;
    dst[ 9] = r20 * m01 + r21 * m11 + r22 * m21;
    dst[10] = r20 * m02 + r21 * m12 + r22 * m22;
    dst[11] = r20 * m03 + r21 * m13 + r22 * m23;

    if (m !== dst) {
      dst[12] = m[12];
      dst[13] = m[13];
      dst[14] = m[14];
      dst[15] = m[15];
    }

    return dst;
  }

  /**
   * Creates a 4-by-4 matrix which scales in each dimension by an amount given by
   * the corresponding entry in the given vector; assumes the vector has three
   * entries.
   * @param {Vec3} v A vector of
   *     three entries specifying the factor by which to scale in each dimension.
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} The scaling matrix.
   * @memberOf module:twgl/m4
   */
  function scaling(v, dst) {
    dst = dst || new MatType(16);

    dst[ 0] = v[0];
    dst[ 1] = 0;
    dst[ 2] = 0;
    dst[ 3] = 0;
    dst[ 4] = 0;
    dst[ 5] = v[1];
    dst[ 6] = 0;
    dst[ 7] = 0;
    dst[ 8] = 0;
    dst[ 9] = 0;
    dst[10] = v[2];
    dst[11] = 0;
    dst[12] = 0;
    dst[13] = 0;
    dst[14] = 0;
    dst[15] = 1;

    return dst;
  }

  /**
   * Modifies the given 4-by-4 matrix, scaling in each dimension by an amount
   * given by the corresponding entry in the given vector; assumes the vector has
   * three entries.
   * @param {module:twgl/m4.Mat4} m The matrix to be modified.
   * @param {Vec3} v A vector of three entries specifying the
   *     factor by which to scale in each dimension.
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} m once modified.
   * @memberOf module:twgl/m4
   */
  function scale(m, v, dst) {
    dst = dst || new MatType(16);

    var v0 = v[0];
    var v1 = v[1];
    var v2 = v[2];

    dst[ 0] = v0 * m[0 * 4 + 0];
    dst[ 1] = v0 * m[0 * 4 + 1];
    dst[ 2] = v0 * m[0 * 4 + 2];
    dst[ 3] = v0 * m[0 * 4 + 3];
    dst[ 4] = v1 * m[1 * 4 + 0];
    dst[ 5] = v1 * m[1 * 4 + 1];
    dst[ 6] = v1 * m[1 * 4 + 2];
    dst[ 7] = v1 * m[1 * 4 + 3];
    dst[ 8] = v2 * m[2 * 4 + 0];
    dst[ 9] = v2 * m[2 * 4 + 1];
    dst[10] = v2 * m[2 * 4 + 2];
    dst[11] = v2 * m[2 * 4 + 3];

    if (m !== dst) {
      dst[12] = m[12];
      dst[13] = m[13];
      dst[14] = m[14];
      dst[15] = m[15];
    }

    return m;
  }

  /**
   * Takes a 4-by-4 matrix and a vector with 3 entries,
   * interprets the vector as a point, transforms that point by the matrix, and
   * returns the result as a vector with 3 entries.
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @param {Vec3} v The point.
   * @param {Vec3} dst optional vec3 to store result
   * @return {Vec3} dst or new vec3 if not provided
   * @memberOf module:twgl/m4
   */
  function transformPoint(m, v, dst) {
    dst = dst || v3.create();
    var v0 = v[0];
    var v1 = v[1];
    var v2 = v[2];
    var d = v0 * m[0 * 4 + 3] + v1 * m[1 * 4 + 3] + v2 * m[2 * 4 + 3] + m[3 * 4 + 3];

    dst[0] = (v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + v2 * m[2 * 4 + 0] + m[3 * 4 + 0]) / d;
    dst[1] = (v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + v2 * m[2 * 4 + 1] + m[3 * 4 + 1]) / d;
    dst[2] = (v0 * m[0 * 4 + 2] + v1 * m[1 * 4 + 2] + v2 * m[2 * 4 + 2] + m[3 * 4 + 2]) / d;

    return dst;
  }

  /**
   * Takes a 4-by-4 matrix and a vector with 3 entries, interprets the vector as a
   * direction, transforms that direction by the matrix, and returns the result;
   * assumes the transformation of 3-dimensional space represented by the matrix
   * is parallel-preserving, i.e. any combination of rotation, scaling and
   * translation, but not a perspective distortion. Returns a vector with 3
   * entries.
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @param {Vec3} v The direction.
   * @param {Vec3} dst optional Vec3 to store result
   * @return {Vec3} dst or new Vec3 if not provided
   * @memberOf module:twgl/m4
   */
  function transformDirection(m, v, dst) {
    dst = dst || v3.create();

    var v0 = v[0];
    var v1 = v[1];
    var v2 = v[2];

    dst[0] = v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + v2 * m[2 * 4 + 0];
    dst[1] = v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + v2 * m[2 * 4 + 1];
    dst[2] = v0 * m[0 * 4 + 2] + v1 * m[1 * 4 + 2] + v2 * m[2 * 4 + 2];

    return dst;
  }

  /**
   * Takes a 4-by-4 matrix m and a vector v with 3 entries, interprets the vector
   * as a normal to a surface, and computes a vector which is normal upon
   * transforming that surface by the matrix. The effect of this function is the
   * same as transforming v (as a direction) by the inverse-transpose of m.  This
   * function assumes the transformation of 3-dimensional space represented by the
   * matrix is parallel-preserving, i.e. any combination of rotation, scaling and
   * translation, but not a perspective distortion.  Returns a vector with 3
   * entries.
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @param {Vec3} v The normal.
   * @param {Vec3} [dst] The direction.
   * @return {Vec3} The transformed direction.
   * @memberOf module:twgl/m4
   */
  function transformNormal(m, v, dst) {
    dst = dst || v3.create();
    var mi = inverse(m);
    var v0 = v[0];
    var v1 = v[1];
    var v2 = v[2];

    dst[0] = v0 * mi[0 * 4 + 0] + v1 * mi[0 * 4 + 1] + v2 * mi[0 * 4 + 2];
    dst[1] = v0 * mi[1 * 4 + 0] + v1 * mi[1 * 4 + 1] + v2 * mi[1 * 4 + 2];
    dst[2] = v0 * mi[2 * 4 + 0] + v1 * mi[2 * 4 + 1] + v2 * mi[2 * 4 + 2];

    return dst;
  }

  // Using quotes prevents Uglify from changing the names.
  // No speed diff AFAICT.
  return {
    "axisRotate": axisRotate,
    "axisRotation": axisRotation,
    "create": identity,
    "copy": copy,
    "frustum": frustum,
    "getAxis": getAxis,
    "getTranslation": getTranslation,
    "identity": identity,
    "inverse": inverse,
    "lookAt": lookAt,
    "multiply": multiply,
    "negate": negate,
    "ortho": ortho,
    "perspective": perspective,
    "rotateX": rotateX,
    "rotateY": rotateY,
    "rotateZ": rotateZ,
    "rotationX": rotationX,
    "rotationY": rotationY,
    "rotationZ": rotationZ,
    "scale": scale,
    "scaling": scaling,
    "setDefaultType": setDefaultType,
    "setTranslation": setTranslation,
    "transformDirection": transformDirection,
    "transformNormal": transformNormal,
    "transformPoint": transformPoint,
    "translate": translate,
    "translation": translation,
    "transpose": transpose,
  };
});


/*
 * Copyright 2015, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of his
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */



/**
 * Various functions to make simple primitives
 *
 * note: Most primitive functions come in 3 styles
 *
 * *  `createSomeShapeBufferInfo`
 *
 *    These functions are almost always the functions you want to call. They
 *    create vertices then make WebGLBuffers and create {@link module:twgl.AttribInfo}s
 *    returing a {@link module:twgl.BufferInfo} you can pass to {@link module:twgl.setBuffersAndAttributes}
 *    and {@link module:twgl.drawBufferInfo} etc...
 *
 * *  `createSomeShapeBuffers`
 *
 *    These create WebGLBuffers and put your data in them but nothing else.
 *    It's a shortcut to doing it yourself if you don't want to use
 *    the higher level functions.
 *
 * *  `createSomeShapeVertices`
 *
 *    These just create vertices, no buffers. This allows you to manipulate the vertices
 *    or add more data before generating a {@link module:twgl.BufferInfo}. Once you're finished
 *    manipulating the vertices call {@link module:twgl.createBufferInfoFromArrays}.
 *
 *    example:
 *
 *        var arrays = twgl.primitives.createPlaneArrays(1);
 *        twgl.primitives.reorientVertices(arrays, m4.rotationX(Math.PI * 0.5));
 *        var bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
 *
 * @module twgl/primitives
 */
define('twgl/primitives',[
    './twgl',
    './m4',
    './v3',
  ], function (
    twgl,
    m4,
    v3
  ) {

  /**
   * Add `push` to a typed array. It just keeps a 'cursor'
   * and allows use to `push` values into the array so we
   * don't have to manually compute offsets
   * @param {TypedArray} typedArray TypedArray to augment
   * @param {number} numComponents number of components.
   */
  function augmentTypedArray(typedArray, numComponents) {
    var cursor = 0;
    typedArray.push = function() {
      for (var ii = 0; ii < arguments.length; ++ii) {
        var value = arguments[ii];
        if (value instanceof Array || (value.buffer && value.buffer instanceof ArrayBuffer)) {
          for (var jj = 0; jj < value.length; ++jj) {
            typedArray[cursor++] = value[jj];
          }
        } else {
          typedArray[cursor++] = value;
        }
      }
    };
    typedArray.reset = function(opt_index) {
      cursor = opt_index || 0;
    };
    typedArray.numComponents = numComponents;
    Object.defineProperty(typedArray, 'numElements', {
      get: function() {
        return this.length / this.numComponents | 0;
      },
    });
    return typedArray;
  }

  /**
   * creates a typed array with a `push` function attached
   * so that you can easily *push* values.
   *
   * `push` can take multiple arguments. If an argument is an array each element
   * of the array will be added to the typed array.
   *
   * Example:
   *
   *     var array = createAugmentedTypedArray(3, 2);  // creates a Float32Array with 6 values
   *     array.push(1, 2, 3);
   *     array.push([4, 5, 6]);
   *     // array now contains [1, 2, 3, 4, 5, 6]
   *
   * Also has `numComponents` and `numElements` properties.
   *
   * @param {number} numComponents number of components
   * @param {number} numElements number of elements. The total size of the array will be `numComponents * numElements`.
   * @param {constructor} opt_type A constructor for the type. Default = `Float32Array`.
   * @return {ArrayBuffer} A typed array.
   * @memberOf module:twgl
   */
  function createAugmentedTypedArray(numComponents, numElements, opt_type) {
    var Type = opt_type || Float32Array;
    return augmentTypedArray(new Type(numComponents * numElements), numComponents);
  }

  function allButIndices(name) {
    return name !== "indices";
  }

  /**
   * Given indexed vertices creates a new set of vertices unindexed by expanding the indexed vertices.
   * @param {Object.<string, TypedArray>} vertices The indexed vertices to deindex
   * @return {Object.<string, TypedArray>} The deindexed vertices
   * @memberOf module:twgl/primitives
   */
  function deindexVertices(vertices) {
    var indices = vertices.indices;
    var newVertices = {};
    var numElements = indices.length;

    function expandToUnindexed(channel) {
      var srcBuffer = vertices[channel];
      var numComponents = srcBuffer.numComponents;
      var dstBuffer = createAugmentedTypedArray(numComponents, numElements, srcBuffer.constructor);
      for (var ii = 0; ii < numElements; ++ii) {
        var ndx = indices[ii];
        var offset = ndx * numComponents;
        for (var jj = 0; jj < numComponents; ++jj) {
          dstBuffer.push(srcBuffer[offset + jj]);
        }
      }
      newVertices[channel] = dstBuffer;
    }

    Object.keys(vertices).filter(allButIndices).forEach(expandToUnindexed);

    return newVertices;
  }

  /**
   * flattens the normals of deindexed vertices in place.
   * @param {Object.<string, TypedArray>} vertices The deindexed vertices who's normals to flatten
   * @return {Object.<string, TypedArray>} The flattened vertices (same as was passed in)
   * @memberOf module:twgl/primitives
   */
  function flattenNormals(vertices) {
    if (vertices.indices) {
      throw "can't flatten normals of indexed vertices. deindex them first";
    }

    var normals = vertices.normal;
    var numNormals = normals.length;
    for (var ii = 0; ii < numNormals; ii += 9) {
      // pull out the 3 normals for this triangle
      var nax = normals[ii + 0];
      var nay = normals[ii + 1];
      var naz = normals[ii + 2];

      var nbx = normals[ii + 3];
      var nby = normals[ii + 4];
      var nbz = normals[ii + 5];

      var ncx = normals[ii + 6];
      var ncy = normals[ii + 7];
      var ncz = normals[ii + 8];

      // add them
      var nx = nax + nbx + ncx;
      var ny = nay + nby + ncy;
      var nz = naz + nbz + ncz;

      // normalize them
      var length = Math.sqrt(nx * nx + ny * ny + nz * nz);

      nx /= length;
      ny /= length;
      nz /= length;

      // copy them back in
      normals[ii + 0] = nx;
      normals[ii + 1] = ny;
      normals[ii + 2] = nz;

      normals[ii + 3] = nx;
      normals[ii + 4] = ny;
      normals[ii + 5] = nz;

      normals[ii + 6] = nx;
      normals[ii + 7] = ny;
      normals[ii + 8] = nz;
    }

    return vertices;
  }

  function applyFuncToV3Array(array, matrix, fn) {
    var len = array.length;
    var tmp = new Float32Array(3);
    for (var ii = 0; ii < len; ii += 3) {
      fn(matrix, [array[ii], array[ii + 1], array[ii + 2]], tmp);
      array[ii    ] = tmp[0];
      array[ii + 1] = tmp[1];
      array[ii + 2] = tmp[2];
    }
  }

  function transformNormal(mi, v, dst) {
    dst = dst || v3.create();
    var v0 = v[0];
    var v1 = v[1];
    var v2 = v[2];

    dst[0] = v0 * mi[0 * 4 + 0] + v1 * mi[0 * 4 + 1] + v2 * mi[0 * 4 + 2];
    dst[1] = v0 * mi[1 * 4 + 0] + v1 * mi[1 * 4 + 1] + v2 * mi[1 * 4 + 2];
    dst[2] = v0 * mi[2 * 4 + 0] + v1 * mi[2 * 4 + 1] + v2 * mi[2 * 4 + 2];

    return dst;
  }

  /**
   * Reorients directions by the given matrix..
   * @param {number[]|TypedArray} array The array. Assumes value floats per element.
   * @param {Matrix} matrix A matrix to multiply by.
   * @return {number[]|TypedArray} the same array that was passed in
   * @memberOf module:twgl/primitives
   */
  function reorientDirections(array, matrix) {
    applyFuncToV3Array(array, matrix, m4.transformDirection);
    return array;
  }

  /**
   * Reorients normals by the inverse-transpose of the given
   * matrix..
   * @param {number[]|TypedArray} array The array. Assumes value floats per element.
   * @param {Matrix} matrix A matrix to multiply by.
   * @return {number[]|TypedArray} the same array that was passed in
   * @memberOf module:twgl/primitives
   */
  function reorientNormals(array, matrix) {
    applyFuncToV3Array(array, m4.inverse(matrix), transformNormal);
    return array;
  }

  /**
   * Reorients positions by the given matrix. In other words, it
   * multiplies each vertex by the given matrix.
   * @param {number[]|TypedArray} array The array. Assumes value floats per element.
   * @param {Matrix} matrix A matrix to multiply by.
   * @return {number[]|TypedArray} the same array that was passed in
   * @memberOf module:twgl/primitives
   */
  function reorientPositions(array, matrix) {
    applyFuncToV3Array(array, matrix, m4.transformPoint);
    return array;
  }

  /**
   * Reorients arrays by the given matrix. Assumes arrays have
   * names that contains 'pos' could be reoriented as positions,
   * 'binorm' or 'tan' as directions, and 'norm' as normals.
   *
   * @param {Object.<string, (number[]|TypedArray)>} arrays The vertices to reorient
   * @param {Matrix} matrix matrix to reorient by.
   * @return {Object.<string, (number[]|TypedArray)>} same arrays that were passed in.
   * @memberOf module:twgl/primitives
   */
  function reorientVertices(arrays, matrix) {
    Object.keys(arrays).forEach(function(name) {
      var array = arrays[name];
      if (name.indexOf("pos") >= 0) {
        reorientPositions(array, matrix);
      } else if (name.indexOf("tan") >= 0 || name.indexOf("binorm") >= 0) {
        reorientDirections(array, matrix);
      } else if (name.indexOf("norm") >= 0) {
        reorientNormals(array, matrix);
      }
    });
    return arrays;
  }

  /**
   * Creates XY quad BufferInfo
   *
   * The default with no parameters will return a 2x2 quad with values from -1 to +1.
   * If you want a unit quad with that goes from 0 to 1 you'd call it with
   *
   *     twgl.primitives.createXYQuadBufferInfo(gl, 1, 0.5, 0.5);
   *
   * If you want a unit quad centered above 0,0 you'd call it with
   *
   *     twgl.primitives.createXYQuadBufferInfo(gl, 1, 0, 0.5);
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} [size] the size across the quad. Defaults to 2 which means vertices will go from -1 to +1
   * @param {number} [xOffset] the amount to offset the quad in X
   * @param {number} [yOffset] the amount to offset the quad in Y
   * @return {Object.<string, WebGLBuffer>} the created XY Quad BufferInfo
   * @memberOf module:twgl/primitives
   * @function createXYQuadBufferInfo
   */

  /**
   * Creates XY quad Buffers
   *
   * The default with no parameters will return a 2x2 quad with values from -1 to +1.
   * If you want a unit quad with that goes from 0 to 1 you'd call it with
   *
   *     twgl.primitives.createXYQuadBufferInfo(gl, 1, 0.5, 0.5);
   *
   * If you want a unit quad centered above 0,0 you'd call it with
   *
   *     twgl.primitives.createXYQuadBufferInfo(gl, 1, 0, 0.5);
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} [size] the size across the quad. Defaults to 2 which means vertices will go from -1 to +1
   * @param {number} [xOffset] the amount to offset the quad in X
   * @param {number} [yOffset] the amount to offset the quad in Y
   * @return {module:twgl.BufferInfo} the created XY Quad buffers
   * @memberOf module:twgl/primitives
   * @function createXYQuadBuffers
   */

  /**
   * Creates XY quad vertices
   *
   * The default with no parameters will return a 2x2 quad with values from -1 to +1.
   * If you want a unit quad with that goes from 0 to 1 you'd call it with
   *
   *     twgl.primitives.createXYQuadVertices(1, 0.5, 0.5);
   *
   * If you want a unit quad centered above 0,0 you'd call it with
   *
   *     twgl.primitives.createXYQuadVertices(1, 0, 0.5);
   *
   * @param {number} [size] the size across the quad. Defaults to 2 which means vertices will go from -1 to +1
   * @param {number} [xOffset] the amount to offset the quad in X
   * @param {number} [yOffset] the amount to offset the quad in Y
   * @return {Object.<string, TypedArray> the created XY Quad vertices
   * @memberOf module:twgl/primitives
   */
  function createXYQuadVertices(size, xOffset, yOffset) {
    size = size || 2;
    xOffset = xOffset || 0;
    yOffset = yOffset || 0;
    size *= 0.5;
    return {
      position: {
        numComponents: 2,
        data: [
          xOffset + -1 * size, yOffset + -1 * size,
          xOffset +  1 * size, yOffset + -1 * size,
          xOffset + -1 * size, yOffset +  1 * size,
          xOffset +  1 * size, yOffset +  1 * size,
        ],
      },
      normal: [
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
      ],
      texcoord: [
        0, 0,
        1, 0,
        0, 1,
        1, 1,
      ],
      indices: [ 0, 1, 2, 2, 1, 3 ],
    };
  }

  /**
   * Creates XZ plane BufferInfo.
   *
   * The created plane has position, normal, and texcoord data
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} [width] Width of the plane. Default = 1
   * @param {number} [depth] Depth of the plane. Default = 1
   * @param {number} [subdivisionsWidth] Number of steps across the plane. Default = 1
   * @param {number} [subdivisionsDepth] Number of steps down the plane. Default = 1
   * @param {Matrix4} [matrix] A matrix by which to multiply all the vertices.
   * @return {@module:twgl.BufferInfo} The created plane BufferInfo.
   * @memberOf module:twgl/primitives
   * @function createPlaneBufferInfo
   */

  /**
   * Creates XZ plane buffers.
   *
   * The created plane has position, normal, and texcoord data
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} [width] Width of the plane. Default = 1
   * @param {number} [depth] Depth of the plane. Default = 1
   * @param {number} [subdivisionsWidth] Number of steps across the plane. Default = 1
   * @param {number} [subdivisionsDepth] Number of steps down the plane. Default = 1
   * @param {Matrix4} [matrix] A matrix by which to multiply all the vertices.
   * @return {Object.<string, WebGLBuffer>} The created plane buffers.
   * @memberOf module:twgl/primitives
   * @function createPlaneBuffers
   */

  /**
   * Creates XZ plane vertices.
   *
   * The created plane has position, normal, and texcoord data
   *
   * @param {number} [width] Width of the plane. Default = 1
   * @param {number} [depth] Depth of the plane. Default = 1
   * @param {number} [subdivisionsWidth] Number of steps across the plane. Default = 1
   * @param {number} [subdivisionsDepth] Number of steps down the plane. Default = 1
   * @param {Matrix4} [matrix] A matrix by which to multiply all the vertices.
   * @return {Object.<string, TypedArray>} The created plane vertices.
   * @memberOf module:twgl/primitives
   */
  function createPlaneVertices(
      width,
      depth,
      subdivisionsWidth,
      subdivisionsDepth,
      matrix) {
    width = width || 1;
    depth = depth || 1;
    subdivisionsWidth = subdivisionsWidth || 1;
    subdivisionsDepth = subdivisionsDepth || 1;
    matrix = matrix || m4.identity();

    var numVertices = (subdivisionsWidth + 1) * (subdivisionsDepth + 1);
    var positions = createAugmentedTypedArray(3, numVertices);
    var normals = createAugmentedTypedArray(3, numVertices);
    var texcoords = createAugmentedTypedArray(2, numVertices);

    for (var z = 0; z <= subdivisionsDepth; z++) {
      for (var x = 0; x <= subdivisionsWidth; x++) {
        var u = x / subdivisionsWidth;
        var v = z / subdivisionsDepth;
        positions.push(
            width * u - width * 0.5,
            0,
            depth * v - depth * 0.5);
        normals.push(0, 1, 0);
        texcoords.push(u, v);
      }
    }

    var numVertsAcross = subdivisionsWidth + 1;
    var indices = createAugmentedTypedArray(
        3, subdivisionsWidth * subdivisionsDepth * 2, Uint16Array);

    for (var z = 0; z < subdivisionsDepth; z++) {  // eslint-disable-line
      for (var x = 0; x < subdivisionsWidth; x++) {  // eslint-disable-line
        // Make triangle 1 of quad.
        indices.push(
            (z + 0) * numVertsAcross + x,
            (z + 1) * numVertsAcross + x,
            (z + 0) * numVertsAcross + x + 1);

        // Make triangle 2 of quad.
        indices.push(
            (z + 1) * numVertsAcross + x,
            (z + 1) * numVertsAcross + x + 1,
            (z + 0) * numVertsAcross + x + 1);
      }
    }

    var arrays = reorientVertices({
      position: positions,
      normal: normals,
      texcoord: texcoords,
      indices: indices,
    }, matrix);
    return arrays;
  }

  /**
   * Creates sphere BufferInfo.
   *
   * The created sphere has position, normal, and texcoord data
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} radius radius of the sphere.
   * @param {number} subdivisionsAxis number of steps around the sphere.
   * @param {number} subdivisionsHeight number of vertically on the sphere.
   * @param {number} [opt_startLatitudeInRadians] where to start the
   *     top of the sphere. Default = 0.
   * @param {number} [opt_endLatitudeInRadians] Where to end the
   *     bottom of the sphere. Default = Math.PI.
   * @param {number} [opt_startLongitudeInRadians] where to start
   *     wrapping the sphere. Default = 0.
   * @param {number} [opt_endLongitudeInRadians] where to end
   *     wrapping the sphere. Default = 2 * Math.PI.
   * @return {module:twgl.BufferInfo} The created sphere BufferInfo.
   * @memberOf module:twgl/primitives
   * @function createSphereBufferInfo
   */

  /**
   * Creates sphere buffers.
   *
   * The created sphere has position, normal, and texcoord data
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} radius radius of the sphere.
   * @param {number} subdivisionsAxis number of steps around the sphere.
   * @param {number} subdivisionsHeight number of vertically on the sphere.
   * @param {number} [opt_startLatitudeInRadians] where to start the
   *     top of the sphere. Default = 0.
   * @param {number} [opt_endLatitudeInRadians] Where to end the
   *     bottom of the sphere. Default = Math.PI.
   * @param {number} [opt_startLongitudeInRadians] where to start
   *     wrapping the sphere. Default = 0.
   * @param {number} [opt_endLongitudeInRadians] where to end
   *     wrapping the sphere. Default = 2 * Math.PI.
   * @return {Object.<string, WebGLBuffer>} The created sphere buffers.
   * @memberOf module:twgl/primitives
   * @function createSphereBuffers
   */

  /**
   * Creates sphere vertices.
   *
   * The created sphere has position, normal, and texcoord data
   *
   * @param {number} radius radius of the sphere.
   * @param {number} subdivisionsAxis number of steps around the sphere.
   * @param {number} subdivisionsHeight number of vertically on the sphere.
   * @param {number} [opt_startLatitudeInRadians] where to start the
   *     top of the sphere. Default = 0.
   * @param {number} [opt_endLatitudeInRadians] Where to end the
   *     bottom of the sphere. Default = Math.PI.
   * @param {number} [opt_startLongitudeInRadians] where to start
   *     wrapping the sphere. Default = 0.
   * @param {number} [opt_endLongitudeInRadians] where to end
   *     wrapping the sphere. Default = 2 * Math.PI.
   * @return {Object.<string, TypedArray>} The created sphere vertices.
   * @memberOf module:twgl/primitives
   */
  function createSphereVertices(
      radius,
      subdivisionsAxis,
      subdivisionsHeight,
      opt_startLatitudeInRadians,
      opt_endLatitudeInRadians,
      opt_startLongitudeInRadians,
      opt_endLongitudeInRadians) {
    if (subdivisionsAxis <= 0 || subdivisionsHeight <= 0) {
      throw Error('subdivisionAxis and subdivisionHeight must be > 0');
    }

    opt_startLatitudeInRadians = opt_startLatitudeInRadians || 0;
    opt_endLatitudeInRadians = opt_endLatitudeInRadians || Math.PI;
    opt_startLongitudeInRadians = opt_startLongitudeInRadians || 0;
    opt_endLongitudeInRadians = opt_endLongitudeInRadians || (Math.PI * 2);

    var latRange = opt_endLatitudeInRadians - opt_startLatitudeInRadians;
    var longRange = opt_endLongitudeInRadians - opt_startLongitudeInRadians;

    // We are going to generate our sphere by iterating through its
    // spherical coordinates and generating 2 triangles for each quad on a
    // ring of the sphere.
    var numVertices = (subdivisionsAxis + 1) * (subdivisionsHeight + 1);
    var positions = createAugmentedTypedArray(3, numVertices);
    var normals   = createAugmentedTypedArray(3, numVertices);
    var texcoords = createAugmentedTypedArray(2 , numVertices);

    // Generate the individual vertices in our vertex buffer.
    for (var y = 0; y <= subdivisionsHeight; y++) {
      for (var x = 0; x <= subdivisionsAxis; x++) {
        // Generate a vertex based on its spherical coordinates
        var u = x / subdivisionsAxis;
        var v = y / subdivisionsHeight;
        var theta = longRange * u;
        var phi = latRange * v;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);
        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);
        var ux = cosTheta * sinPhi;
        var uy = cosPhi;
        var uz = sinTheta * sinPhi;
        positions.push(radius * ux, radius * uy, radius * uz);
        normals.push(ux, uy, uz);
        texcoords.push(1 - u, v);
      }
    }

    var numVertsAround = subdivisionsAxis + 1;
    var indices = createAugmentedTypedArray(3, subdivisionsAxis * subdivisionsHeight * 2, Uint16Array);
    for (var x = 0; x < subdivisionsAxis; x++) {  // eslint-disable-line
      for (var y = 0; y < subdivisionsHeight; y++) {  // eslint-disable-line
        // Make triangle 1 of quad.
        indices.push(
            (y + 0) * numVertsAround + x,
            (y + 0) * numVertsAround + x + 1,
            (y + 1) * numVertsAround + x);

        // Make triangle 2 of quad.
        indices.push(
            (y + 1) * numVertsAround + x,
            (y + 0) * numVertsAround + x + 1,
            (y + 1) * numVertsAround + x + 1);
      }
    }

    return {
      position: positions,
      normal: normals,
      texcoord: texcoords,
      indices: indices,
    };
  }

  /**
   * Array of the indices of corners of each face of a cube.
   * @type {Array.<number[]>}
   */
  var CUBE_FACE_INDICES = [
    [3, 7, 5, 1],  // right
    [6, 2, 0, 4],  // left
    [6, 7, 3, 2],  // ??
    [0, 1, 5, 4],  // ??
    [7, 6, 4, 5],  // front
    [2, 3, 1, 0],  // back
  ];

  /**
   * Creates a BufferInfo for a cube.
   *
   * The cube is created around the origin. (-size / 2, size / 2).
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} [size] width, height and depth of the cube.
   * @return {module:twgl.BufferInfo} The created BufferInfo.
   * @memberOf module:twgl/primitives
   * @function createCubeBufferInfo
   */

  /**
   * Creates the buffers and indices for a cube.
   *
   * The cube is created around the origin. (-size / 2, size / 2).
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} [size] width, height and depth of the cube.
   * @return {Object.<string, WebGLBuffer>} The created buffers.
   * @memberOf module:twgl/primitives
   * @function createCubeBuffers
   */

  /**
   * Creates the vertices and indices for a cube.
   *
   * The cube is created around the origin. (-size / 2, size / 2).
   *
   * @param {number} [size] width, height and depth of the cube.
   * @return {Object.<string, TypedArray>} The created vertices.
   * @memberOf module:twgl/primitives
   */
  function createCubeVertices(size) {
    size = size || 1;
    var k = size / 2;

    var cornerVertices = [
      [-k, -k, -k],
      [+k, -k, -k],
      [-k, +k, -k],
      [+k, +k, -k],
      [-k, -k, +k],
      [+k, -k, +k],
      [-k, +k, +k],
      [+k, +k, +k],
    ];

    var faceNormals = [
      [+1, +0, +0],
      [-1, +0, +0],
      [+0, +1, +0],
      [+0, -1, +0],
      [+0, +0, +1],
      [+0, +0, -1],
    ];

    var uvCoords = [
      [1, 0],
      [0, 0],
      [0, 1],
      [1, 1],
    ];

    var numVertices = 6 * 4;
    var positions = createAugmentedTypedArray(3, numVertices);
    var normals   = createAugmentedTypedArray(3, numVertices);
    var texcoords = createAugmentedTypedArray(2 , numVertices);
    var indices   = createAugmentedTypedArray(3, 6 * 2, Uint16Array);

    for (var f = 0; f < 6; ++f) {
      var faceIndices = CUBE_FACE_INDICES[f];
      for (var v = 0; v < 4; ++v) {
        var position = cornerVertices[faceIndices[v]];
        var normal = faceNormals[f];
        var uv = uvCoords[v];

        // Each face needs all four vertices because the normals and texture
        // coordinates are not all the same.
        positions.push(position);
        normals.push(normal);
        texcoords.push(uv);

      }
      // Two triangles make a square face.
      var offset = 4 * f;
      indices.push(offset + 0, offset + 1, offset + 2);
      indices.push(offset + 0, offset + 2, offset + 3);
    }

    return {
      position: positions,
      normal: normals,
      texcoord: texcoords,
      indices: indices,
    };
  }

  /**
   * Creates a BufferInfo for a truncated cone, which is like a cylinder
   * except that it has different top and bottom radii. A truncated cone
   * can also be used to create cylinders and regular cones. The
   * truncated cone will be created centered about the origin, with the
   * y axis as its vertical axis.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} bottomRadius Bottom radius of truncated cone.
   * @param {number} topRadius Top radius of truncated cone.
   * @param {number} height Height of truncated cone.
   * @param {number} radialSubdivisions The number of subdivisions around the
   *     truncated cone.
   * @param {number} verticalSubdivisions The number of subdivisions down the
   *     truncated cone.
   * @param {boolean} [opt_topCap] Create top cap. Default = true.
   * @param {boolean} [opt_bottomCap] Create bottom cap. Default = true.
   * @return {module:twgl.BufferInfo} The created cone BufferInfo.
   * @memberOf module:twgl/primitives
   * @function createTruncatedConeBufferInfo
   */

  /**
   * Creates buffers for a truncated cone, which is like a cylinder
   * except that it has different top and bottom radii. A truncated cone
   * can also be used to create cylinders and regular cones. The
   * truncated cone will be created centered about the origin, with the
   * y axis as its vertical axis.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} bottomRadius Bottom radius of truncated cone.
   * @param {number} topRadius Top radius of truncated cone.
   * @param {number} height Height of truncated cone.
   * @param {number} radialSubdivisions The number of subdivisions around the
   *     truncated cone.
   * @param {number} verticalSubdivisions The number of subdivisions down the
   *     truncated cone.
   * @param {boolean} [opt_topCap] Create top cap. Default = true.
   * @param {boolean} [opt_bottomCap] Create bottom cap. Default = true.
   * @return {Object.<string, WebGLBuffer>} The created cone buffers.
   * @memberOf module:twgl/primitives
   * @function createTruncatedConeBuffers
   */

  /**
   * Creates vertices for a truncated cone, which is like a cylinder
   * except that it has different top and bottom radii. A truncated cone
   * can also be used to create cylinders and regular cones. The
   * truncated cone will be created centered about the origin, with the
   * y axis as its vertical axis. .
   *
   * @param {number} bottomRadius Bottom radius of truncated cone.
   * @param {number} topRadius Top radius of truncated cone.
   * @param {number} height Height of truncated cone.
   * @param {number} radialSubdivisions The number of subdivisions around the
   *     truncated cone.
   * @param {number} verticalSubdivisions The number of subdivisions down the
   *     truncated cone.
   * @param {boolean} [opt_topCap] Create top cap. Default = true.
   * @param {boolean} [opt_bottomCap] Create bottom cap. Default = true.
   * @return {Object.<string, TypedArray>} The created cone vertices.
   * @memberOf module:twgl/primitives
   */
  function createTruncatedConeVertices(
      bottomRadius,
      topRadius,
      height,
      radialSubdivisions,
      verticalSubdivisions,
      opt_topCap,
      opt_bottomCap) {
    if (radialSubdivisions < 3) {
      throw Error('radialSubdivisions must be 3 or greater');
    }

    if (verticalSubdivisions < 1) {
      throw Error('verticalSubdivisions must be 1 or greater');
    }

    var topCap = (opt_topCap === undefined) ? true : opt_topCap;
    var bottomCap = (opt_bottomCap === undefined) ? true : opt_bottomCap;

    var extra = (topCap ? 2 : 0) + (bottomCap ? 2 : 0);

    var numVertices = (radialSubdivisions + 1) * (verticalSubdivisions + 1 + extra);
    var positions = createAugmentedTypedArray(3, numVertices);
    var normals   = createAugmentedTypedArray(3, numVertices);
    var texcoords = createAugmentedTypedArray(2, numVertices);
    var indices   = createAugmentedTypedArray(3, radialSubdivisions * (verticalSubdivisions + extra) * 2, Uint16Array);

    var vertsAroundEdge = radialSubdivisions + 1;

    // The slant of the cone is constant across its surface
    var slant = Math.atan2(bottomRadius - topRadius, height);
    var cosSlant = Math.cos(slant);
    var sinSlant = Math.sin(slant);

    var start = topCap ? -2 : 0;
    var end = verticalSubdivisions + (bottomCap ? 2 : 0);

    for (var yy = start; yy <= end; ++yy) {
      var v = yy / verticalSubdivisions;
      var y = height * v;
      var ringRadius;
      if (yy < 0) {
        y = 0;
        v = 1;
        ringRadius = bottomRadius;
      } else if (yy > verticalSubdivisions) {
        y = height;
        v = 1;
        ringRadius = topRadius;
      } else {
        ringRadius = bottomRadius +
          (topRadius - bottomRadius) * (yy / verticalSubdivisions);
      }
      if (yy === -2 || yy === verticalSubdivisions + 2) {
        ringRadius = 0;
        v = 0;
      }
      y -= height / 2;
      for (var ii = 0; ii < vertsAroundEdge; ++ii) {
        var sin = Math.sin(ii * Math.PI * 2 / radialSubdivisions);
        var cos = Math.cos(ii * Math.PI * 2 / radialSubdivisions);
        positions.push(sin * ringRadius, y, cos * ringRadius);
        normals.push(
            (yy < 0 || yy > verticalSubdivisions) ? 0 : (sin * cosSlant),
            (yy < 0) ? -1 : (yy > verticalSubdivisions ? 1 : sinSlant),
            (yy < 0 || yy > verticalSubdivisions) ? 0 : (cos * cosSlant));
        texcoords.push((ii / radialSubdivisions), 1 - v);
      }
    }

    for (var yy = 0; yy < verticalSubdivisions + extra; ++yy) {  // eslint-disable-line
      for (var ii = 0; ii < radialSubdivisions; ++ii) {  // eslint-disable-line
        indices.push(vertsAroundEdge * (yy + 0) + 0 + ii,
                     vertsAroundEdge * (yy + 0) + 1 + ii,
                     vertsAroundEdge * (yy + 1) + 1 + ii);
        indices.push(vertsAroundEdge * (yy + 0) + 0 + ii,
                     vertsAroundEdge * (yy + 1) + 1 + ii,
                     vertsAroundEdge * (yy + 1) + 0 + ii);
      }
    }

    return {
      position: positions,
      normal: normals,
      texcoord: texcoords,
      indices: indices,
    };
  }

  /**
   * Expands RLE data
   * @param {number[]} rleData data in format of run-length, x, y, z, run-length, x, y, z
   * @param {number[]} [padding] value to add each entry with.
   * @return {number[]} the expanded rleData
   */
  function expandRLEData(rleData, padding) {
    padding = padding || [];
    var data = [];
    for (var ii = 0; ii < rleData.length; ii += 4) {
      var runLength = rleData[ii];
      var element = rleData.slice(ii + 1, ii + 4);
      element.push.apply(element, padding);
      for (var jj = 0; jj < runLength; ++jj) {
        data.push.apply(data, element);
      }
    }
    return data;
  }

  /**
   * Creates 3D 'F' BufferInfo.
   * An 'F' is useful because you can easily tell which way it is oriented.
   * The created 'F' has position, normal, texcoord, and color buffers.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @return {module:twgl.BufferInfo} The created BufferInfo.
   * @memberOf module:twgl/primitives
   * @function create3DFBufferInfo
   */

  /**
   * Creates 3D 'F' buffers.
   * An 'F' is useful because you can easily tell which way it is oriented.
   * The created 'F' has position, normal, texcoord, and color buffers.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @return {Object.<string, WebGLBuffer>} The created buffers.
   * @memberOf module:twgl/primitives
   * @function create3DFBuffers
   */

  /**
   * Creates 3D 'F' vertices.
   * An 'F' is useful because you can easily tell which way it is oriented.
   * The created 'F' has position, normal, texcoord, and color arrays.
   *
   * @return {Object.<string, TypedArray>} The created vertices.
   * @memberOf module:twgl/primitives
   */
  function create3DFVertices() {

    var positions = [
      // left column front
      0,   0,  0,
      0, 150,  0,
      30,   0,  0,
      0, 150,  0,
      30, 150,  0,
      30,   0,  0,

      // top rung front
      30,   0,  0,
      30,  30,  0,
      100,   0,  0,
      30,  30,  0,
      100,  30,  0,
      100,   0,  0,

      // middle rung front
      30,  60,  0,
      30,  90,  0,
      67,  60,  0,
      30,  90,  0,
      67,  90,  0,
      67,  60,  0,

      // left column back
        0,   0,  30,
       30,   0,  30,
        0, 150,  30,
        0, 150,  30,
       30,   0,  30,
       30, 150,  30,

      // top rung back
       30,   0,  30,
      100,   0,  30,
       30,  30,  30,
       30,  30,  30,
      100,   0,  30,
      100,  30,  30,

      // middle rung back
       30,  60,  30,
       67,  60,  30,
       30,  90,  30,
       30,  90,  30,
       67,  60,  30,
       67,  90,  30,

      // top
        0,   0,   0,
      100,   0,   0,
      100,   0,  30,
        0,   0,   0,
      100,   0,  30,
        0,   0,  30,

      // top rung front
      100,   0,   0,
      100,  30,   0,
      100,  30,  30,
      100,   0,   0,
      100,  30,  30,
      100,   0,  30,

      // under top rung
      30,   30,   0,
      30,   30,  30,
      100,  30,  30,
      30,   30,   0,
      100,  30,  30,
      100,  30,   0,

      // between top rung and middle
      30,   30,   0,
      30,   60,  30,
      30,   30,  30,
      30,   30,   0,
      30,   60,   0,
      30,   60,  30,

      // top of middle rung
      30,   60,   0,
      67,   60,  30,
      30,   60,  30,
      30,   60,   0,
      67,   60,   0,
      67,   60,  30,

      // front of middle rung
      67,   60,   0,
      67,   90,  30,
      67,   60,  30,
      67,   60,   0,
      67,   90,   0,
      67,   90,  30,

      // bottom of middle rung.
      30,   90,   0,
      30,   90,  30,
      67,   90,  30,
      30,   90,   0,
      67,   90,  30,
      67,   90,   0,

      // front of bottom
      30,   90,   0,
      30,  150,  30,
      30,   90,  30,
      30,   90,   0,
      30,  150,   0,
      30,  150,  30,

      // bottom
      0,   150,   0,
      0,   150,  30,
      30,  150,  30,
      0,   150,   0,
      30,  150,  30,
      30,  150,   0,

      // left side
      0,   0,   0,
      0,   0,  30,
      0, 150,  30,
      0,   0,   0,
      0, 150,  30,
      0, 150,   0,
    ];

    var texcoords = [
      // left column front
      0.22, 0.19,
      0.22, 0.79,
      0.34, 0.19,
      0.22, 0.79,
      0.34, 0.79,
      0.34, 0.19,

      // top rung front
      0.34, 0.19,
      0.34, 0.31,
      0.62, 0.19,
      0.34, 0.31,
      0.62, 0.31,
      0.62, 0.19,

      // middle rung front
      0.34, 0.43,
      0.34, 0.55,
      0.49, 0.43,
      0.34, 0.55,
      0.49, 0.55,
      0.49, 0.43,

      // left column back
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1,

      // top rung back
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1,

      // middle rung back
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1,

      // top
      0, 0,
      1, 0,
      1, 1,
      0, 0,
      1, 1,
      0, 1,

      // top rung front
      0, 0,
      1, 0,
      1, 1,
      0, 0,
      1, 1,
      0, 1,

      // under top rung
      0, 0,
      0, 1,
      1, 1,
      0, 0,
      1, 1,
      1, 0,

      // between top rung and middle
      0, 0,
      1, 1,
      0, 1,
      0, 0,
      1, 0,
      1, 1,

      // top of middle rung
      0, 0,
      1, 1,
      0, 1,
      0, 0,
      1, 0,
      1, 1,

      // front of middle rung
      0, 0,
      1, 1,
      0, 1,
      0, 0,
      1, 0,
      1, 1,

      // bottom of middle rung.
      0, 0,
      0, 1,
      1, 1,
      0, 0,
      1, 1,
      1, 0,

      // front of bottom
      0, 0,
      1, 1,
      0, 1,
      0, 0,
      1, 0,
      1, 1,

      // bottom
      0, 0,
      0, 1,
      1, 1,
      0, 0,
      1, 1,
      1, 0,

      // left side
      0, 0,
      0, 1,
      1, 1,
      0, 0,
      1, 1,
      1, 0,
    ];

    var normals = expandRLEData([
      // left column front
      // top rung front
      // middle rung front
      18, 0, 0, 1,

      // left column back
      // top rung back
      // middle rung back
      18, 0, 0, -1,

      // top
      6, 0, 1, 0,

      // top rung front
      6, 1, 0, 0,

      // under top rung
      6, 0, -1, 0,

      // between top rung and middle
      6, 1, 0, 0,

      // top of middle rung
      6, 0, 1, 0,

      // front of middle rung
      6, 1, 0, 0,

      // bottom of middle rung.
      6, 0, -1, 0,

      // front of bottom
      6, 1, 0, 0,

      // bottom
      6, 0, -1, 0,

      // left side
      6, -1, 0, 0,
    ]);

    var colors = expandRLEData([
          // left column front
          // top rung front
          // middle rung front
        18, 200,  70, 120,

          // left column back
          // top rung back
          // middle rung back
        18, 80, 70, 200,

          // top
        6, 70, 200, 210,

          // top rung front
        6, 200, 200, 70,

          // under top rung
        6, 210, 100, 70,

          // between top rung and middle
        6, 210, 160, 70,

          // top of middle rung
        6, 70, 180, 210,

          // front of middle rung
        6, 100, 70, 210,

          // bottom of middle rung.
        6, 76, 210, 100,

          // front of bottom
        6, 140, 210, 80,

          // bottom
        6, 90, 130, 110,

          // left side
        6, 160, 160, 220,
    ], [255]);

    var numVerts = positions.length / 3;

    var arrays = {
      position: createAugmentedTypedArray(3, numVerts),
      texcoord: createAugmentedTypedArray(2,  numVerts),
      normal: createAugmentedTypedArray(3, numVerts),
      color: createAugmentedTypedArray(4, numVerts, Uint8Array),
      indices: createAugmentedTypedArray(3, numVerts / 3, Uint16Array),
    };

    arrays.position.push(positions);
    arrays.texcoord.push(texcoords);
    arrays.normal.push(normals);
    arrays.color.push(colors);

    for (var ii = 0; ii < numVerts; ++ii) {
      arrays.indices.push(ii);
    }

    return arrays;
  }

  /**
   * Creates cresent BufferInfo.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} verticalRadius The vertical radius of the cresent.
   * @param {number} outerRadius The outer radius of the cresent.
   * @param {number} innerRadius The inner radius of the cresent.
   * @param {number} thickness The thickness of the cresent.
   * @param {number} subdivisionsDown number of steps around the cresent.
   * @param {number} subdivisionsThick number of vertically on the cresent.
   * @param {number} [startOffset] Where to start arc. Default 0.
   * @param {number} [endOffset] Where to end arg. Default 1.
   * @return {module:twgl.BufferInfo} The created BufferInfo.
   * @memberOf module:twgl/primitives
   * @function createCresentBufferInfo
   */

  /**
   * Creates cresent buffers.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} verticalRadius The vertical radius of the cresent.
   * @param {number} outerRadius The outer radius of the cresent.
   * @param {number} innerRadius The inner radius of the cresent.
   * @param {number} thickness The thickness of the cresent.
   * @param {number} subdivisionsDown number of steps around the cresent.
   * @param {number} subdivisionsThick number of vertically on the cresent.
   * @param {number} [startOffset] Where to start arc. Default 0.
   * @param {number} [endOffset] Where to end arg. Default 1.
   * @return {Object.<string, WebGLBuffer>} The created buffers.
   * @memberOf module:twgl/primitives
   * @function createCresentBuffers
   */

  /**
   * Creates cresent vertices.
   *
   * @param {number} verticalRadius The vertical radius of the cresent.
   * @param {number} outerRadius The outer radius of the cresent.
   * @param {number} innerRadius The inner radius of the cresent.
   * @param {number} thickness The thickness of the cresent.
   * @param {number} subdivisionsDown number of steps around the cresent.
   * @param {number} subdivisionsThick number of vertically on the cresent.
   * @param {number} [startOffset] Where to start arc. Default 0.
   * @param {number} [endOffset] Where to end arg. Default 1.
   * @return {Object.<string, TypedArray>} The created vertices.
   * @memberOf module:twgl/primitives
   */
   function createCresentVertices(
      verticalRadius,
      outerRadius,
      innerRadius,
      thickness,
      subdivisionsDown,
      startOffset,
      endOffset) {
    if (subdivisionsDown <= 0) {
      throw Error('subdivisionDown must be > 0');
    }

    startOffset = startOffset || 0;
    endOffset   = endOffset || 1;

    var subdivisionsThick = 2;

    var offsetRange = endOffset - startOffset;
    var numVertices = (subdivisionsDown + 1) * 2 * (2 + subdivisionsThick);
    var positions   = createAugmentedTypedArray(3, numVertices);
    var normals     = createAugmentedTypedArray(3, numVertices);
    var texcoords   = createAugmentedTypedArray(2, numVertices);

    function lerp(a, b, s) {
      return a + (b - a) * s;
    }

    function createArc(arcRadius, x, normalMult, normalAdd, uMult, uAdd) {
      for (var z = 0; z <= subdivisionsDown; z++) {
        var uBack = x / (subdivisionsThick - 1);
        var v = z / subdivisionsDown;
        var xBack = (uBack - 0.5) * 2;
        var angle = (startOffset + (v * offsetRange)) * Math.PI;
        var s = Math.sin(angle);
        var c = Math.cos(angle);
        var radius = lerp(verticalRadius, arcRadius, s);
        var px = xBack * thickness;
        var py = c * verticalRadius;
        var pz = s * radius;
        positions.push(px, py, pz);
        var n = v3.add(v3.multiply([0, s, c], normalMult), normalAdd);
        normals.push(n);
        texcoords.push(uBack * uMult + uAdd, v);
      }
    }

    // Generate the individual vertices in our vertex buffer.
    for (var x = 0; x < subdivisionsThick; x++) {
      var uBack = (x / (subdivisionsThick - 1) - 0.5) * 2;
      createArc(outerRadius, x, [1, 1, 1], [0,     0, 0], 1, 0);
      createArc(outerRadius, x, [0, 0, 0], [uBack, 0, 0], 0, 0);
      createArc(innerRadius, x, [1, 1, 1], [0,     0, 0], 1, 0);
      createArc(innerRadius, x, [0, 0, 0], [uBack, 0, 0], 0, 1);
    }

    // Do outer surface.
    var indices = createAugmentedTypedArray(3, (subdivisionsDown * 2) * (2 + subdivisionsThick), Uint16Array);

    function createSurface(leftArcOffset, rightArcOffset) {
      for (var z = 0; z < subdivisionsDown; ++z) {
        // Make triangle 1 of quad.
        indices.push(
            leftArcOffset + z + 0,
            leftArcOffset + z + 1,
            rightArcOffset + z + 0);

        // Make triangle 2 of quad.
        indices.push(
            leftArcOffset + z + 1,
            rightArcOffset + z + 1,
            rightArcOffset + z + 0);
      }
    }

    var numVerticesDown = subdivisionsDown + 1;
    // front
    createSurface(numVerticesDown * 0, numVerticesDown * 4);
    // right
    createSurface(numVerticesDown * 5, numVerticesDown * 7);
    // back
    createSurface(numVerticesDown * 6, numVerticesDown * 2);
    // left
    createSurface(numVerticesDown * 3, numVerticesDown * 1);

    return {
      position: positions,
      normal:   normals,
      texcoord: texcoords,
      indices:  indices,
    };
  }

  /**
   * Creates cylinder BufferInfo. The cylinder will be created around the origin
   * along the y-axis.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} radius Radius of cylinder.
   * @param {number} height Height of cylinder.
   * @param {number} radialSubdivisions The number of subdivisions around the cylinder.
   * @param {number} verticalSubdivisions The number of subdivisions down the cylinder.
   * @param {boolean} [topCap] Create top cap. Default = true.
   * @param {boolean} [bottomCap] Create bottom cap. Default = true.
   * @return {module:twgl.BufferInfo} The created BufferInfo.
   * @memberOf module:twgl/primitives
   * @function createCylinderBufferInfo
   */

   /**
    * Creates cylinder buffers. The cylinder will be created around the origin
    * along the y-axis.
    *
    * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
    * @param {number} radius Radius of cylinder.
    * @param {number} height Height of cylinder.
    * @param {number} radialSubdivisions The number of subdivisions around the cylinder.
    * @param {number} verticalSubdivisions The number of subdivisions down the cylinder.
    * @param {boolean} [topCap] Create top cap. Default = true.
    * @param {boolean} [bottomCap] Create bottom cap. Default = true.
    * @return {Object.<string, WebGLBuffer>} The created buffers.
    * @memberOf module:twgl/primitives
    * @function createCylinderBuffers
    */

   /**
    * Creates cylinder vertices. The cylinder will be created around the origin
    * along the y-axis.
    *
    * @param {number} radius Radius of cylinder.
    * @param {number} height Height of cylinder.
    * @param {number} radialSubdivisions The number of subdivisions around the cylinder.
    * @param {number} verticalSubdivisions The number of subdivisions down the cylinder.
    * @param {boolean} [topCap] Create top cap. Default = true.
    * @param {boolean} [bottomCap] Create bottom cap. Default = true.
    * @return {Object.<string, TypedArray>} The created vertices.
    * @memberOf module:twgl/primitives
    */
  function createCylinderVertices(
      radius,
      height,
      radialSubdivisions,
      verticalSubdivisions,
      topCap,
      bottomCap) {
    return createTruncatedConeVertices(
        radius,
        radius,
        height,
        radialSubdivisions,
        verticalSubdivisions,
        topCap,
        bottomCap);
  }

  /**
   * Creates BufferInfo for a torus
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} radius radius of center of torus circle.
   * @param {number} thickness radius of torus ring.
   * @param {number} radialSubdivisions The number of subdivisions around the torus.
   * @param {number} bodySubdivisions The number of subdivisions around the body torus.
   * @param {boolean} [startAngle] start angle in radians. Default = 0.
   * @param {boolean} [endAngle] end angle in radians. Default = Math.PI * 2.
   * @return {module:twgl.BufferInfo} The created BufferInfo.
   * @memberOf module:twgl/primitives
   * @function createTorusBufferInfo
   */

  /**
   * Creates buffers for a torus
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} radius radius of center of torus circle.
   * @param {number} thickness radius of torus ring.
   * @param {number} radialSubdivisions The number of subdivisions around the torus.
   * @param {number} bodySubdivisions The number of subdivisions around the body torus.
   * @param {boolean} [startAngle] start angle in radians. Default = 0.
   * @param {boolean} [endAngle] end angle in radians. Default = Math.PI * 2.
   * @return {Object.<string, WebGLBuffer>} The created buffers.
   * @memberOf module:twgl/primitives
   * @function createTorusBuffers
   */

  /**
   * Creates vertices for a torus
   *
   * @param {number} radius radius of center of torus circle.
   * @param {number} thickness radius of torus ring.
   * @param {number} radialSubdivisions The number of subdivisions around the torus.
   * @param {number} bodySubdivisions The number of subdivisions around the body torus.
   * @param {boolean} [startAngle] start angle in radians. Default = 0.
   * @param {boolean} [endAngle] end angle in radians. Default = Math.PI * 2.
   * @return {Object.<string, TypedArray>} The created vertices.
   * @memberOf module:twgl/primitives
   */
  function createTorusVertices(
      radius,
      thickness,
      radialSubdivisions,
      bodySubdivisions,
      startAngle,
      endAngle) {
    if (radialSubdivisions < 3) {
      throw Error('radialSubdivisions must be 3 or greater');
    }

    if (bodySubdivisions < 3) {
      throw Error('verticalSubdivisions must be 3 or greater');
    }

    startAngle = startAngle || 0;
    endAngle = endAngle || Math.PI * 2;
    range = endAngle - startAngle;

    var radialParts = radialSubdivisions + 1;
    var bodyParts   = bodySubdivisions + 1;
    var numVertices = radialParts * bodyParts;
    var positions   = createAugmentedTypedArray(3, numVertices);
    var normals     = createAugmentedTypedArray(3, numVertices);
    var texcoords   = createAugmentedTypedArray(2, numVertices);
    var indices     = createAugmentedTypedArray(3, (radialSubdivisions) * (bodySubdivisions) * 2, Uint16Array);

    for (var slice = 0; slice < bodyParts; ++slice) {
      var v = slice / bodySubdivisions;
      var sliceAngle = v * Math.PI * 2;
      var sliceSin = Math.sin(sliceAngle);
      var ringRadius = radius + sliceSin * thickness;
      var ny = Math.cos(sliceAngle);
      var y = ny * thickness;
      for (var ring = 0; ring < radialParts; ++ring) {
        var u = ring / radialSubdivisions;
        var ringAngle = startAngle + u * range;
        var xSin = Math.sin(ringAngle);
        var zCos = Math.cos(ringAngle);
        var x = xSin * ringRadius;
        var z = zCos * ringRadius;
        var nx = xSin * sliceSin;
        var nz = zCos * sliceSin;
        positions.push(x, y, z);
        normals.push(nx, ny, nz);
        texcoords.push(u, 1 - v);
      }
    }

    for (var slice = 0; slice < bodySubdivisions; ++slice) {  // eslint-disable-line
      for (var ring = 0; ring < radialSubdivisions; ++ring) {  // eslint-disable-line
        var nextRingIndex  = 1 + ring;
        var nextSliceIndex = 1 + slice;
        indices.push(radialParts * slice          + ring,
                     radialParts * nextSliceIndex + ring,
                     radialParts * slice          + nextRingIndex);
        indices.push(radialParts * nextSliceIndex + ring,
                     radialParts * nextSliceIndex + nextRingIndex,
                     radialParts * slice          + nextRingIndex);
      }
    }

    return {
      position: positions,
      normal:   normals,
      texcoord: texcoords,
      indices:  indices,
    };
  }


  /**
   * Creates a disc BufferInfo. The disc will be in the xz plane, centered at
   * the origin. When creating, at least 3 divisions, or pie
   * pieces, need to be specified, otherwise the triangles making
   * up the disc will be degenerate. You can also specify the
   * number of radial pieces `stacks`. A value of 1 for
   * stacks will give you a simple disc of pie pieces.  If you
   * want to create an annulus you can set `innerRadius` to a
   * value > 0. Finally, `stackPower` allows you to have the widths
   * increase or decrease as you move away from the center. This
   * is particularly useful when using the disc as a ground plane
   * with a fixed camera such that you don't need the resolution
   * of small triangles near the perimeter. For example, a value
   * of 2 will produce stacks whose ouside radius increases with
   * the square of the stack index. A value of 1 will give uniform
   * stacks.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} radius Radius of the ground plane.
   * @param {number} divisions Number of triangles in the ground plane (at least 3).
   * @param {number} [stacks] Number of radial divisions (default=1).
   * @param {number} [innerRadius] Default 0.
   * @param {number} [stackPower] Power to raise stack size to for decreasing width.
   * @return {module:twgl.BufferInfo} The created BufferInfo.
   * @memberOf module:twgl/primitives
   * @function createDiscBufferInfo
   */

  /**
   * Creates disc buffers. The disc will be in the xz plane, centered at
   * the origin. When creating, at least 3 divisions, or pie
   * pieces, need to be specified, otherwise the triangles making
   * up the disc will be degenerate. You can also specify the
   * number of radial pieces `stacks`. A value of 1 for
   * stacks will give you a simple disc of pie pieces.  If you
   * want to create an annulus you can set `innerRadius` to a
   * value > 0. Finally, `stackPower` allows you to have the widths
   * increase or decrease as you move away from the center. This
   * is particularly useful when using the disc as a ground plane
   * with a fixed camera such that you don't need the resolution
   * of small triangles near the perimeter. For example, a value
   * of 2 will produce stacks whose ouside radius increases with
   * the square of the stack index. A value of 1 will give uniform
   * stacks.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} radius Radius of the ground plane.
   * @param {number} divisions Number of triangles in the ground plane (at least 3).
   * @param {number} [stacks] Number of radial divisions (default=1).
   * @param {number} [innerRadius] Default 0.
   * @param {number} [stackPower] Power to raise stack size to for decreasing width.
   * @return {Object.<string, WebGLBuffer>} The created buffers.
   * @memberOf module:twgl/primitives
   * @function createDiscBuffers
   */

  /**
   * Creates disc vertices. The disc will be in the xz plane, centered at
   * the origin. When creating, at least 3 divisions, or pie
   * pieces, need to be specified, otherwise the triangles making
   * up the disc will be degenerate. You can also specify the
   * number of radial pieces `stacks`. A value of 1 for
   * stacks will give you a simple disc of pie pieces.  If you
   * want to create an annulus you can set `innerRadius` to a
   * value > 0. Finally, `stackPower` allows you to have the widths
   * increase or decrease as you move away from the center. This
   * is particularly useful when using the disc as a ground plane
   * with a fixed camera such that you don't need the resolution
   * of small triangles near the perimeter. For example, a value
   * of 2 will produce stacks whose ouside radius increases with
   * the square of the stack index. A value of 1 will give uniform
   * stacks.
   *
   * @param {number} radius Radius of the ground plane.
   * @param {number} divisions Number of triangles in the ground plane (at least 3).
   * @param {number} [stacks] Number of radial divisions (default=1).
   * @param {number} [innerRadius] Default 0.
   * @param {number} [stackPower] Power to raise stack size to for decreasing width.
   * @return {Object.<string, TypedArray>} The created vertices.
   * @memberOf module:twgl/primitives
   */
  function createDiscVertices(
      radius,
      divisions,
      stacks,
      innerRadius,
      stackPower) {
    if (divisions < 3) {
      throw Error('divisions must be at least 3');
    }

    stacks = stacks ? stacks : 1;
    stackPower = stackPower ? stackPower : 1;
    innerRadius = innerRadius ? innerRadius : 0;

    // Note: We don't share the center vertex because that would
    // mess up texture coordinates.
    var numVertices = (divisions + 1) * (stacks + 1);

    var positions = createAugmentedTypedArray(3, numVertices);
    var normals   = createAugmentedTypedArray(3, numVertices);
    var texcoords = createAugmentedTypedArray(2, numVertices);
    var indices   = createAugmentedTypedArray(3, stacks * divisions * 2, Uint16Array);

    var firstIndex = 0;
    var radiusSpan = radius - innerRadius;

    // Build the disk one stack at a time.
    for (var stack = 0; stack <= stacks; ++stack) {
      var stackRadius = innerRadius + radiusSpan * Math.pow(stack / stacks, stackPower);

      for (var i = 0; i <= divisions; ++i) {
        var theta = 2.0 * Math.PI * i / divisions;
        var x = stackRadius * Math.cos(theta);
        var z = stackRadius * Math.sin(theta);

        positions.push(x, 0, z);
        normals.push(0, 1, 0);
        texcoords.push(1 - (i / divisions), stack / stacks);
        if (stack > 0 && i !== divisions) {
          // a, b, c and d are the indices of the vertices of a quad.  unless
          // the current stack is the one closest to the center, in which case
          // the vertices a and b connect to the center vertex.
          var a = firstIndex + (i + 1);
          var b = firstIndex + i;
          var c = firstIndex + i - divisions;
          var d = firstIndex + (i + 1) - divisions;

          // Make a quad of the vertices a, b, c, d.
          indices.push(a, b, c);
          indices.push(a, c, d);
        }
      }

      firstIndex += divisions + 1;
    }

    return {
      position: positions,
      normal: normals,
      texcoord: texcoords,
      indices: indices,
    };
  }

  /**
   * creates a random integer between 0 and range - 1 inclusive.
   * @param {number} range
   * @return {number} random value between 0 and range - 1 inclusive.
   */
  function randInt(range) {
    return Math.random() * range | 0;
  }

  /**
   * Used to supply random colors
   * @callback RandomColorFunc
   * @param {number} ndx index of triangle/quad if unindexed or index of vertex if indexed
   * @param {number} channel 0 = red, 1 = green, 2 = blue, 3 = alpha
   * @return {number} a number from 0 to 255
   * @memberOf module:twgl/primitives
   */

  /**
   * @typedef {Object} RandomVerticesOptions
   * @property {number} [vertsPerColor] Defaults to 3 for non-indexed vertices
   * @property {module:twgl/primitives.RandomColorFunc} [rand] A function to generate random numbers
   * @memberOf module:twgl/primitives
   */

  /**
   * Creates an augmentedTypedArray of random vertex colors.
   * If the vertices are indexed (have an indices array) then will
   * just make random colors. Otherwise assumes they are triangless
   * and makes one random color for every 3 vertices.
   * @param {Object.<string, augmentedTypedArray>} vertices Vertices as returned from one of the createXXXVertices functions.
   * @param {module:twgl/primitives.RandomVerticesOptions} [options] options.
   * @return {Object.<string, augmentedTypedArray>} same vertices as passed in with `color` added.
   * @memberOf module:twgl/primitives
   */
  function makeRandomVertexColors(vertices, options) {
    options = options || {};
    var numElements = vertices.position.numElements;
    var vcolors = createAugmentedTypedArray(4, numElements, Uint8Array);
    var rand = options.rand || function(ndx, channel) {
      return channel < 3 ? randInt(256) : 255;
    };
    vertices.color = vcolors;
    if (vertices.indices) {
      // just make random colors if index
      for (var ii = 0; ii < numElements; ++ii) {
        vcolors.push(rand(ii, 0), rand(ii, 1), rand(ii, 2), rand(ii, 3));
      }
    } else {
      // make random colors per triangle
      var numVertsPerColor = options.vertsPerColor || 3;
      var numSets = numElements / numVertsPerColor;
      for (var ii = 0; ii < numSets; ++ii) {  // eslint-disable-line
        var color = [rand(ii, 0), rand(ii, 1), rand(ii, 2), rand(ii, 3)];
        for (var jj = 0; jj < numVertsPerColor; ++jj) {
          vcolors.push(color);
        }
      }
    }
    return vertices;
  }

  /**
   * creates a function that calls fn to create vertices and then
   * creates a buffers for them
   */
  function createBufferFunc(fn) {
    return function(gl) {
      var arrays = fn.apply(this, Array.prototype.slice.call(arguments, 1));
      return twgl.createBuffersFromArrays(gl, arrays);
    };
  }

  /**
   * creates a function that calls fn to create vertices and then
   * creates a bufferInfo object for them
   */
  function createBufferInfoFunc(fn) {
    return function(gl) {
      var arrays = fn.apply(null,  Array.prototype.slice.call(arguments, 1));
      return twgl.createBufferInfoFromArrays(gl, arrays);
    };
  }

  // Using quotes prevents Uglify from changing the names.
  // No speed diff AFAICT.
  return {
    "create3DFBufferInfo": createBufferInfoFunc(create3DFVertices),
    "create3DFBuffers": createBufferFunc(create3DFVertices),
    "create3DFVertices": create3DFVertices,
    "createAugmentedTypedArray": createAugmentedTypedArray,
    "createCubeBufferInfo": createBufferInfoFunc(createCubeVertices),
    "createCubeBuffers": createBufferFunc(createCubeVertices),
    "createCubeVertices": createCubeVertices,
    "createPlaneBufferInfo": createBufferInfoFunc(createPlaneVertices),
    "createPlaneBuffers": createBufferFunc(createPlaneVertices),
    "createPlaneVertices": createPlaneVertices,
    "createSphereBufferInfo": createBufferInfoFunc(createSphereVertices),
    "createSphereBuffers": createBufferFunc(createSphereVertices),
    "createSphereVertices": createSphereVertices,
    "createTruncatedConeBufferInfo": createBufferInfoFunc(createTruncatedConeVertices),
    "createTruncatedConeBuffers": createBufferFunc(createTruncatedConeVertices),
    "createTruncatedConeVertices": createTruncatedConeVertices,
    "createXYQuadBufferInfo": createBufferInfoFunc(createXYQuadVertices),
    "createXYQuadBuffers": createBufferFunc(createXYQuadVertices),
    "createXYQuadVertices": createXYQuadVertices,
    "createCresentBufferInfo": createBufferInfoFunc(createCresentVertices),
    "createCresentBuffers": createBufferFunc(createCresentVertices),
    "createCresentVertices": createCresentVertices,
    "createCylinderBufferInfo": createBufferInfoFunc(createCylinderVertices),
    "createCylinderBuffers": createBufferFunc(createCylinderVertices),
    "createCylinderVertices": createCylinderVertices,
    "createTorusBufferInfo": createBufferInfoFunc(createTorusVertices),
    "createTorusBuffers": createBufferFunc(createTorusVertices),
    "createTorusVertices": createTorusVertices,
    "createDiscBufferInfo": createBufferInfoFunc(createDiscVertices),
    "createDiscBuffers": createBufferFunc(createDiscVertices),
    "createDiscVertices": createDiscVertices,
    "deindexVertices": deindexVertices,
    "flattenNormals": flattenNormals,
    "makeRandomVertexColors": makeRandomVertexColors,
    "reorientDirections": reorientDirections,
    "reorientNormals": reorientNormals,
    "reorientPositions": reorientPositions,
    "reorientVertices": reorientVertices,
  };

});

define('main', [
    'twgl/twgl',
    'twgl/m4',
    'twgl/v3',
    'twgl/primitives',
  ], function(
    twgl,
    m4,
    v3,
    primitives
  ) {
    twgl.m4 = m4;
    twgl.v3 = v3;
    twgl.primitives = primitives;
    return twgl;
})

require(['main'], function(main) {
  return main;
}, undefined, true);   // forceSync = true


;
define("build/js/twgl-includer-full", function(){});

    return require('main');
}));
