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

define([
    './utils',
  ], function(
    utils) {
  "use strict";

  /**
   * Low level shader program related functions
   *
   * You should generally not need to use these functions. They are provided
   * for those cases where you're doing something out of the ordinary
   * and you need lower level access.
   *
   * For backward compatibily they are available at both `twgl.programs` and `twgl`
   * itself
   *
   * See {@link module:twgl} for core functions
   *
   * @module twgl/programs
   */

  var error = utils.error;
  var warn = utils.warn;

  var FLOAT                         = 0x1406;
  var FLOAT_VEC2                    = 0x8B50;
  var FLOAT_VEC3                    = 0x8B51;
  var FLOAT_VEC4                    = 0x8B52;
  var INT                           = 0x1404;
  var INT_VEC2                      = 0x8B53;
  var INT_VEC3                      = 0x8B54;
  var INT_VEC4                      = 0x8B55;
  var BOOL                          = 0x8B56;
  var BOOL_VEC2                     = 0x8B57;
  var BOOL_VEC3                     = 0x8B58;
  var BOOL_VEC4                     = 0x8B59;
  var FLOAT_MAT2                    = 0x8B5A;
  var FLOAT_MAT3                    = 0x8B5B;
  var FLOAT_MAT4                    = 0x8B5C;
  var SAMPLER_2D                    = 0x8B5E;
  var SAMPLER_CUBE                  = 0x8B60;
  var SAMPLER_3D                    = 0x8B5F;
  var SAMPLER_2D_SHADOW             = 0x8B62;
  var FLOAT_MAT2x3                  = 0x8B65;
  var FLOAT_MAT2x4                  = 0x8B66;
  var FLOAT_MAT3x2                  = 0x8B67;
  var FLOAT_MAT3x4                  = 0x8B68;
  var FLOAT_MAT4x2                  = 0x8B69;
  var FLOAT_MAT4x3                  = 0x8B6A;
  var SAMPLER_2D_ARRAY              = 0x8DC1;
  var SAMPLER_2D_ARRAY_SHADOW       = 0x8DC4;
  var SAMPLER_CUBE_SHADOW           = 0x8DC5;
  var UNSIGNED_INT                  = 0x1405;
  var UNSIGNED_INT_VEC2             = 0x8DC6;
  var UNSIGNED_INT_VEC3             = 0x8DC7;
  var UNSIGNED_INT_VEC4             = 0x8DC8;
  var INT_SAMPLER_2D                = 0x8DCA;
  var INT_SAMPLER_3D                = 0x8DCB;
  var INT_SAMPLER_CUBE              = 0x8DCC;
  var INT_SAMPLER_2D_ARRAY          = 0x8DCF;
  var UNSIGNED_INT_SAMPLER_2D       = 0x8DD2;
  var UNSIGNED_INT_SAMPLER_3D       = 0x8DD3;
  var UNSIGNED_INT_SAMPLER_CUBE     = 0x8DD4;
  var UNSIGNED_INT_SAMPLER_2D_ARRAY = 0x8DD7;

  var TEXTURE_2D                    = 0x0DE1;
  var TEXTURE_CUBE_MAP              = 0x8513;
  var TEXTURE_3D                    = 0x806F;
  var TEXTURE_2D_ARRAY              = 0x8C1A;

  var typeMap = {};

  /**
   * Returns the corresponding bind point for a given sampler type
   */
  function getBindPointForSamplerType(gl, type) {
    return typeMap[type].bindPoint;
  }

  // This kind of sucks! If you could compose functions as in `var fn = gl[name];`
  // this code could be a lot smaller but that is sadly really slow (T_T)

  function floatSetter(gl, location) {
    return function(v) {
      gl.uniform1f(location, v);
    };
  }

  function floatArraySetter(gl, location) {
    return function(v) {
      gl.uniform1fv(location, v);
    };
  }

  function floatVec2Setter(gl, location) {
    return function(v) {
      gl.uniform2fv(location, v);
    };
  }

  function floatVec3Setter(gl, location) {
    return function(v) {
      gl.uniform3fv(location, v);
    };
  }

  function floatVec4Setter(gl, location) {
    return function(v) {
      gl.uniform4fv(location, v);
    };
  }

  function intSetter(gl, location) {
    return function(v) {
      gl.uniform1i(location, v);
    };
  }

  function intArraySetter(gl, location) {
    return function(v) {
      gl.uniform1iv(location, v);
    };
  }

  function intVec2Setter(gl, location) {
    return function(v) {
      gl.uniform2iv(location, v);
    };
  }

  function intVec3Setter(gl, location) {
    return function(v) {
      gl.uniform3iv(location, v);
    };
  }

  function intVec4Setter(gl, location) {
    return function(v) {
      gl.uniform4iv(location, v);
    };
  }

  function uintSetter(gl, location) {
    return function(v) {
      gl.uniform1ui(location, v);
    };
  }

  function uintArraySetter(gl, location) {
    return function(v) {
      gl.uniform1uiv(location, v);
    };
  }

  function uintVec2Setter(gl, location) {
    return function(v) {
      gl.uniform2uiv(location, v);
    };
  }

  function uintVec3Setter(gl, location) {
    return function(v) {
      gl.uniform3uiv(location, v);
    };
  }

  function uintVec4Setter(gl, location) {
    return function(v) {
      gl.uniform4uiv(location, v);
    };
  }

  function floatMat2Setter(gl, location) {
    return function(v) {
      gl.uniformMatrix2fv(location, false, v);
    };
  }

  function floatMat3Setter(gl, location) {
    return function(v) {
      gl.uniformMatrix3fv(location, false, v);
    };
  }

  function floatMat4Setter(gl, location) {
    return function(v) {
      gl.uniformMatrix4fv(location, false, v);
    };
  }

  function floatMat23Setter(gl, location) {
    return function(v) {
      gl.uniformMatrix2x3fv(location, false, v);
    };
  }

  function floatMat32Setter(gl, location) {
    return function(v) {
      gl.uniformMatrix3x2fv(location, false, v);
    };
  }

  function floatMat24Setter(gl, location) {
    return function(v) {
      gl.uniformMatrix2x4fv(location, false, v);
    };
  }

  function floatMat42Setter(gl, location) {
    return function(v) {
      gl.uniformMatrix4x2fv(location, false, v);
    };
  }

  function floatMat34Setter(gl, location) {
    return function(v) {
      gl.uniformMatrix3x4fv(location, false, v);
    };
  }

  function floatMat43Setter(gl, location) {
    return function(v) {
      gl.uniformMatrix4x3fv(location, false, v);
    };
  }

  function samplerSetter(gl, type, unit, location) {
    var bindPoint = getBindPointForSamplerType(gl, type);
    return function(texture) {
      gl.uniform1i(location, unit);
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(bindPoint, texture);
    };
  }

  function samplerArraySetter(gl, type, unit, location, size) {
    var bindPoint = getBindPointForSamplerType(gl, type);
    var units = new Int32Array(size);
    for (var ii = 0; ii < size; ++ii) {
      units[ii] = unit + ii;
    }

    return function(textures) {
      gl.uniform1iv(location, units);
      textures.forEach(function(texture, index) {
        gl.activeTexture(gl.TEXTURE0 + units[index]);
        gl.bindTexture(bindPoint, texture);
      });
    };
  }

  typeMap[FLOAT]                         = { Type: Float32Array, size:  4, setter: floatSetter,      arraySetter: floatArraySetter, };
  typeMap[FLOAT_VEC2]                    = { Type: Float32Array, size:  8, setter: floatVec2Setter,  };
  typeMap[FLOAT_VEC3]                    = { Type: Float32Array, size: 12, setter: floatVec3Setter,  };
  typeMap[FLOAT_VEC4]                    = { Type: Float32Array, size: 16, setter: floatVec4Setter,  };
  typeMap[INT]                           = { Type: Int32Array,   size:  4, setter: intSetter,        arraySetter: intArraySetter, };
  typeMap[INT_VEC2]                      = { Type: Int32Array,   size:  8, setter: intVec2Setter,    };
  typeMap[INT_VEC3]                      = { Type: Int32Array,   size: 12, setter: intVec3Setter,    };
  typeMap[INT_VEC4]                      = { Type: Int32Array,   size: 16, setter: intVec4Setter,    };
  typeMap[UNSIGNED_INT]                  = { Type: Uint32Array,  size:  4, setter: uintSetter,       arraySetter: uintArraySetter, };
  typeMap[UNSIGNED_INT_VEC2]             = { Type: Uint32Array,  size:  8, setter: uintVec2Setter,   };
  typeMap[UNSIGNED_INT_VEC3]             = { Type: Uint32Array,  size: 12, setter: uintVec3Setter,   };
  typeMap[UNSIGNED_INT_VEC4]             = { Type: Uint32Array,  size: 16, setter: uintVec4Setter,   };
  typeMap[BOOL]                          = { Type: Uint32Array,  size:  4, setter: intSetter,        arraySetter: intArraySetter, };
  typeMap[BOOL_VEC2]                     = { Type: Uint32Array,  size:  8, setter: intVec2Setter,    };
  typeMap[BOOL_VEC3]                     = { Type: Uint32Array,  size: 12, setter: intVec3Setter,    };
  typeMap[BOOL_VEC4]                     = { Type: Uint32Array,  size: 16, setter: intVec4Setter,    };
  typeMap[FLOAT_MAT2]                    = { Type: Float32Array, size: 16, setter: floatMat2Setter,  };
  typeMap[FLOAT_MAT3]                    = { Type: Float32Array, size: 36, setter: floatMat3Setter,  };
  typeMap[FLOAT_MAT4]                    = { Type: Float32Array, size: 64, setter: floatMat4Setter,  };
  typeMap[FLOAT_MAT2x3]                  = { Type: Float32Array, size: 24, setter: floatMat23Setter, };
  typeMap[FLOAT_MAT2x4]                  = { Type: Float32Array, size: 32, setter: floatMat24Setter, };
  typeMap[FLOAT_MAT3x2]                  = { Type: Float32Array, size: 24, setter: floatMat32Setter, };
  typeMap[FLOAT_MAT3x4]                  = { Type: Float32Array, size: 48, setter: floatMat34Setter, };
  typeMap[FLOAT_MAT4x2]                  = { Type: Float32Array, size: 32, setter: floatMat42Setter, };
  typeMap[FLOAT_MAT4x3]                  = { Type: Float32Array, size: 48, setter: floatMat43Setter, };
  typeMap[SAMPLER_2D]                    = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D,       };
  typeMap[SAMPLER_CUBE]                  = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_CUBE_MAP, };
  typeMap[SAMPLER_3D]                    = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_3D,       };
  typeMap[SAMPLER_2D_SHADOW]             = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D,       };
  typeMap[SAMPLER_2D_ARRAY]              = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D_ARRAY, };
  typeMap[SAMPLER_2D_ARRAY_SHADOW]       = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D_ARRAY, };
  typeMap[SAMPLER_CUBE_SHADOW]           = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_CUBE_MAP, };
  typeMap[INT_SAMPLER_2D]                = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D,       };
  typeMap[INT_SAMPLER_3D]                = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_3D,       };
  typeMap[INT_SAMPLER_CUBE]              = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_CUBE_MAP, };
  typeMap[INT_SAMPLER_2D_ARRAY]          = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D_ARRAY, };
  typeMap[UNSIGNED_INT_SAMPLER_2D]       = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D,       };
  typeMap[UNSIGNED_INT_SAMPLER_3D]       = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_3D,       };
  typeMap[UNSIGNED_INT_SAMPLER_CUBE]     = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_CUBE_MAP, };
  typeMap[UNSIGNED_INT_SAMPLER_2D_ARRAY] = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D_ARRAY, };

  var attrTypeMap = {};
  attrTypeMap[FLOAT_MAT2] = { size:  4, count: 2, };
  attrTypeMap[FLOAT_MAT3] = { size:  9, count: 3, };
  attrTypeMap[FLOAT_MAT4] = { size: 16, count: 4, };

  // make sure we don't see a global gl
  var gl = undefined;  // eslint-disable-line

  /**
   * Error Callback
   * @callback ErrorCallback
   * @param {string} msg error message.
   * @param {number} [lineOffset] amount to add to line number
   * @memberOf module:twgl
   */

  function addLineNumbers(src, lineOffset) {
    lineOffset = lineOffset || 0;
    ++lineOffset;

    return src.split("\n").map(function(line, ndx) {
      return (ndx + lineOffset) + ": " + line;
    }).join("\n");
  }

  var spaceRE = /^[ \t]*\n/;

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

    // Remove the first end of line because WebGL 2.0 requires
    // #version 300 es
    // as the first line. No whitespace allowed before that line
    // so
    //
    // <script>
    // #version 300 es
    // </script>
    //
    // Has one line before it which is invalid according to GLSL ES 3.00
    //
    var lineOffset = 0;
    if (spaceRE.test(shaderSource)) {
      lineOffset = 1;
      shaderSource = shaderSource.replace(spaceRE, '');
    }

    // Load the shader source
    gl.shaderSource(shader, shaderSource);

    // Compile the shader
    gl.compileShader(shader);

    // Check the compile status
    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      // Something went wrong during compilation; get the error
      var lastError = gl.getShaderInfoLog(shader);
      errFn(addLineNumbers(shaderSource, lineOffset) + "\n*** Error compiling shader: " + lastError);
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  /**
   * Creates a program, attaches shaders, binds attrib locations, links the
   * program and calls useProgram.
   *
   * NOTE: There are 3 signatures for this function
   *
   *     twgl.createProgram(gl, [vs, fs], opt_errFunc);
   *     twgl.createProgram(gl, [vs, fs], opt_attribs, opt_errFunc);
   *     twgl.createProgram(gl, [vs, fs], opt_attribs, opt_locations, opt_errFunc);
   *
   * @param {WebGLShader[]} shaders The shaders to attach
   * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
   * @param {module:twgl.ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
   *        on error. If you want something else pass an callback. It's passed an error message.
   * @return {WebGLProgram?} the created program or null if error.
   * @memberOf module:twgl/programs
   */
  function createProgram(
      gl, shaders, opt_attribs, opt_locations, opt_errorCallback) {
    if (typeof opt_locations === 'function') {
      opt_errorCallback = opt_locations;
      opt_locations = undefined;
    }
    if (typeof opt_attribs === 'function') {
      opt_errorCallback = opt_attribs;
      opt_attribs = undefined;
    }
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
   * NOTE: There are 3 signatures for this function
   *
   *     twgl.createProgramFromScripts(gl, [vs, fs], opt_errFunc);
   *     twgl.createProgramFromScripts(gl, [vs, fs], opt_attribs, opt_errFunc);
   *     twgl.createProgramFromScripts(gl, [vs, fs], opt_attribs, opt_locations, opt_errFunc);
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
   * @memberOf module:twgl/programs
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
   * NOTE: There are 3 signatures for this function
   *
   *     twgl.createProgramFromSource(gl, [vs, fs], opt_errFunc);
   *     twgl.createProgramFromSource(gl, [vs, fs], opt_attribs, opt_errFunc);
   *     twgl.createProgramFromSource(gl, [vs, fs], opt_attribs, opt_locations, opt_errFunc);
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
   * @memberOf module:twgl/programs
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
   * Creates setter functions for all uniforms of a shader
   * program.
   *
   * @see {@link module:twgl.setUniforms}
   *
   * @param {WebGLProgram} program the program to create setters for.
   * @returns {Object.<string, function>} an object with a setter by name for each uniform
   * @memberOf module:twgl/programs
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
      var isArray = (uniformInfo.size > 1 && uniformInfo.name.substr(-3) === "[0]");
      var type = uniformInfo.type;
      var typeInfo = typeMap[type];
      if (!typeInfo) {
        throw ("unknown type: 0x" + type.toString(16)); // we should never get here.
      }
      if (typeInfo.bindPoint) {
        // it's a sampler
        var unit = textureUnit;
        textureUnit += uniformInfo.size;

        if (isArray) {
          return typeInfo.arraySetter(gl, type, unit, location, uniformInfo.size);
        } else {
          return typeInfo.setter(gl, type, unit, location, uniformInfo.size);
        }
      } else {
        if (typeInfo.arraySetter && isArray) {
          return typeInfo.arraySetter(gl, location);
        } else {
          return typeInfo.setter(gl, location);
        }
      }
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
   * @typedef {Object} UniformData
   * @property {number} type The WebGL type enum for this uniform
   * @property {number} size The number of elements for this uniform
   * @property {number} blockNdx The block index this uniform appears in
   * @property {number} offset The byte offset in the block for this uniform's value
   * @memberOf module:twgl
   */

  /**
   * The specification for one UniformBlockObject
   *
   * @typedef {Object} BlockSpec
   * @property {number} index The index of the block.
   * @property {number} size The size in bytes needed for the block
   * @property {number[]} uniformIndices The indices of the uniforms used by the block. These indices
   *    correspond to entries in a UniformData array in the {@link module:twgl.UniformBlockSpec}.
   * @property {bool} usedByVertexShader Self explanitory
   * @property {bool} usedByFragmentShader Self explanitory
   * @property {bool} used Self explanitory
   * @memberOf module:twgl
   */

  /**
   * A `UniformBlockSpec` represents the data needed to create and bind
   * UniformBlockObjects for a given program
   *
   * @typedef {Object} UniformBlockSpec
   * @property {Object.<string, module:twgl.BlockSpec> blockSpecs The BlockSpec for each block by block name
   * @property {UniformData[]} uniformData An array of data for each uniform by uniform index.
   * @memberOf module:twgl
   */

  /**
   * Creates a UniformBlockSpec for the given program.
   *
   * A UniformBlockSpec represents the data needed to create and bind
   * UniformBlockObjects
   *
   * @param {WebGL2RenderingContext} gl A WebGL2 Rendering Context
   * @param {WebGLProgram} program A WebGLProgram for a successfully linked program
   * @return {module:twgl.UniformBlockSpec} The created UniformBlockSpec
   * @memberOf module:twgl/programs
   */
  function createUniformBlockSpecFromProgram(gl, program) {
    var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    var uniformData = [];
    var uniformIndices = [];

    for (var ii = 0; ii < numUniforms; ++ii) {
      uniformIndices.push(ii);
      uniformData.push({});
      var uniformInfo = gl.getActiveUniform(program, ii);
      if (!uniformInfo) {
        break;
      }
      // REMOVE [0]?
      uniformData[ii].name = uniformInfo.name;
    }

    [
      [ "UNIFORM_TYPE", "type" ],
      [ "UNIFORM_SIZE", "size" ],  // num elements
      [ "UNIFORM_BLOCK_INDEX", "blockNdx" ],
      [ "UNIFORM_OFFSET", "offset", ],
    ].forEach(function(pair) {
      var pname = pair[0];
      var key = pair[1];
      gl.getActiveUniforms(program, uniformIndices, gl[pname]).forEach(function(value, ndx) {
        uniformData[ndx][key] = value;
      });
    });

    var blockSpecs = {};

    var numUniformBlocks = gl.getProgramParameter(program, gl.ACTIVE_UNIFORM_BLOCKS);
    for (ii = 0; ii < numUniformBlocks; ++ii) {
      var name = gl.getActiveUniformBlockName(program, ii);
      var blockSpec = {
        index: ii,
        usedByVertexShader: gl.getActiveUniformBlockParameter(program, ii, gl.UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER),
        usedByFragmentShader: gl.getActiveUniformBlockParameter(program, ii, gl.UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER),
        size: gl.getActiveUniformBlockParameter(program, ii, gl.UNIFORM_BLOCK_DATA_SIZE),
        uniformIndices: gl.getActiveUniformBlockParameter(program, ii, gl.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES),
      };
      blockSpec.used = blockSpec.usedByVertexSahder || blockSpec.usedByFragmentShader;
      blockSpecs[name] = blockSpec;
    }

    return {
      blockSpecs: blockSpecs,
      uniformData: uniformData,
    };
  }

  var arraySuffixRE = /\[\d+\]\.$/;  // better way to check?

  /**
   * Represents a UniformBlockObject including an ArrayBuffer with all the uniform values
   * and a corresponding WebGLBuffer to hold those values on the GPU
   *
   * @typedef {Object} UniformBlockInfo
   * @property {string} name The name of the block
   * @property {ArrayBuffer} array The array buffer that contains the uniform values
   * @property {Float32Array} asFloat A float view on the array buffer. This is useful
   *    inspecting the contents of the buffer in the debugger.
   * @property {WebGLBuffer} buffer A WebGL buffer that will hold a copy of the uniform values for rendering.
   * @property {number} [offset] offset into buffer
   * @property {Object.<string, ArrayBufferView>} uniforms A uniform name to ArrayBufferView map.
   *   each Uniform has a correctly typed `ArrayBufferView` into array at the correct offset
   *   and length of that uniform. So for example a float uniform would have a 1 float `Float32Array`
   *   view. A single mat4 would have a 16 element `Float32Array` view. An ivec2 would have an
   *   `Int32Array` view, etc.
   * @memberOf module:twgl
   */

  /**
   * Creates a `UniformBlockInfo` for the specified block
   *
   * Note: **If the blockName matches no existing blocks a warning is printed to the console and a dummy
   * `UniformBlockInfo` is returned**. This is because when debugging GLSL
   * it is common to comment out large portions of a shader or for example set
   * the final output to a constant. When that happens blocks get optimized out.
   * If this function did not create dummy blocks your code would crash when debugging.
   *
   * @param {WebGL2RenderingContext} gl A WebGL2RenderingContext
   * @param {WebGLProgram} program A WebGLProgram
   * @param {module:twgl.UniformBlockSpec} uinformBlockSpec. A UniformBlockSpec as returned
   *     from {@link module:twgl.createUniformBlockSpecFromProgram}.
   * @param {string} blockName The name of the block.
   * @return {module:twgl.UniformBlockInfo} The created UniformBlockInfo
   * @memberOf module:twgl/programs
   */
  function createUniformBlockInfoFromProgram(gl, program, uniformBlockSpec, blockName) {
    var blockSpecs = uniformBlockSpec.blockSpecs;
    var uniformData = uniformBlockSpec.uniformData;
    var blockSpec = blockSpecs[blockName];
    if (!blockSpec) {
      warn("no uniform block object named:", blockName);
      return {
        name: blockName,
        uniforms: {},
      };
    }
    var array = new ArrayBuffer(blockSpec.size);
    var buffer = gl.createBuffer();
    var uniformBufferIndex = blockSpec.index;
    gl.bindBuffer(gl.UNIFORM_BUFFER, buffer);
    gl.uniformBlockBinding(program, blockSpec.index, uniformBufferIndex);

    var prefix = blockName + ".";
    if (arraySuffixRE.test(prefix)) {
      prefix = prefix.replace(arraySuffixRE, ".");
    }
    var uniforms = {};
    blockSpec.uniformIndices.forEach(function(uniformNdx) {
      var data = uniformData[uniformNdx];
      var typeInfo = typeMap[data.type];
      var Type = typeInfo.Type;
      var length = data.size * typeInfo.size;
      var name = data.name;
      if (name.substr(0, prefix.length) === prefix) {
        name = name.substr(prefix.length);
      }
      uniforms[name] = new Type(array, data.offset, length / Type.BYTES_PER_ELEMENT);
    });
    return {
      name: blockName,
      array: array,
      asFloat: new Float32Array(array),  // for debugging
      buffer: buffer,
      uniforms: uniforms,
    };
  }

  /**
   * Creates a `UniformBlockInfo` for the specified block
   *
   * Note: **If the blockName matches no existing blocks a warning is printed to the console and a dummy
   * `UniformBlockInfo` is returned**. This is because when debugging GLSL
   * it is common to comment out large portions of a shader or for example set
   * the final output to a constant. When that happens blocks get optimized out.
   * If this function did not create dummy blocks your code would crash when debugging.
   *
   * @param {WebGL2RenderingContext} gl A WebGL2RenderingContext
   * @param {module:twgl.ProgramInfo} programInfo a `ProgramInfo`
   *     as returned from {@link module:twgl.createProgramInfo}
   * @param {string} blockName The name of the block.
   * @return {module:twgl.UniformBlockInfo} The created UniformBlockInfo
   * @memberOf module:twgl/programs
   */
  function createUniformBlockInfo(gl, programInfo, blockName) {
    return createUniformBlockInfoFromProgram(gl, programInfo.program, programInfo.uniformBlockSpec, blockName);
  }

  /**
   * Binds a unform block to the matching uniform block point.
   * Matches by blocks by name so blocks must have the same name not just the same
   * structure.
   *
   * If you have changed any values and you upload the valus into the corresponding WebGLBuffer
   * call {@link module:twgl.setUniformBlock} instead.
   *
   * @param {WebGL2RenderingContext} gl A WebGL 2 rendering context.
   * @param {(module:twgl.ProgramInfo|module:twgl.UniformBlockSpec)} programInfo a `ProgramInfo`
   *     as returned from {@link module:twgl.createProgramInfo} or or `UniformBlockSpec` as
   *     returned from {@link module:twgl.createUniformBlockSpecFromProgram}.
   * @param {module:twgl.UniformBlockInfo} uniformBlockInfo a `UniformBlockInfo` as returned from
   *     {@link module:twgl.createUniformBlockInfo}.
   * @return {bool} true if buffer was bound. If the programInfo has no block with the same block name
   *     no buffer is bound.
   * @memberOf module:twgl/programs
   */
  function bindUniformBlock(gl, programInfo, uniformBlockInfo) {
    var uniformBlockSpec = programInfo.uniformBlockSpec || programInfo;
    var blockSpec = uniformBlockSpec.blockSpecs[uniformBlockInfo.name];
    if (blockSpec) {
      var bufferBindIndex = blockSpec.index;
      gl.bindBufferRange(gl.UNIFORM_BUFFER, bufferBindIndex, uniformBlockInfo.buffer, uniformBlockInfo.offset || 0, uniformBlockInfo.array.byteLength);
      return true;
    }
    return false;
  }

  /**
   * Uploads the current uniform values to the corresponding WebGLBuffer
   * and binds that buffer to the program's corresponding bind point for the uniform block object.
   *
   * If you haven't changed any values and you only need to bind the uniform block object
   * call {@link module:twgl.bindUniformBlock} instead.
   *
   * @param {WebGL2RenderingContext} gl A WebGL 2 rendering context.
   * @param {(module:twgl.ProgramInfo|module:twgl.UniformBlockSpec)} programInfo a `ProgramInfo`
   *     as returned from {@link module:twgl.createProgramInfo} or or `UniformBlockSpec` as
   *     returned from {@link module:twgl.createUniformBlockSpecFromProgram}.
   * @param {module:twgl.UniformBlockInfo} uniformBlockInfo a `UniformBlockInfo` as returned from
   *     {@link module:twgl.createUniformBlockInfo}.
   * @memberOf module:twgl/programs
   */
  function setUniformBlock(gl, programInfo, uniformBlockInfo) {
    if (bindUniformBlock(gl, programInfo, uniformBlockInfo)) {
      gl.bufferData(gl.UNIFORM_BUFFER, uniformBlockInfo.array, gl.DYNAMIC_DRAW);
    }
  }

  /**
   * Sets values of a uniform block object
   *
   * @param {module:twgl.UniformBlockInfo} uniformBlockInfo A UniformBlockInfo as returned by {@link module:twgl.createUniformBlockInfo}.
   * @param {Object.<string, ?>} values A uniform name to value map where the value is correct for the given
   *    type of uniform. So for example given a block like
   *
   *       uniform SomeBlock {
   *         float someFloat;
   *         vec2 someVec2;
   *         vec3 someVec3Array[2];
   *         int someInt;
   *       }
   *
   *  You can set the values of the uniform block with
   *
   *       twgl.setBlockUniforms(someBlockInfo, {
   *          someFloat: 12.3,
   *          someVec2: [1, 2],
   *          someVec3Array: [1, 2, 3, 4, 5, 6],
   *          someInt: 5,
   *       }
   *
   *  Arrays can be JavaScript arrays or typed arrays
   *
   *  Any name that doesn't match will be ignored
   * @memberOf module:twgl/programs
   */
  function setBlockUniforms(uniformBlockInfo, values) {
    var uniforms = uniformBlockInfo.uniforms;
    for (var name in values) {
      var array = uniforms[name];
      if (array) {
        var value = values[name];
        if (value.length) {
          array.set(value);
        } else {
          array[0] = value;
        }
      }
    }
  }

  /**
   * Set uniforms and binds related textures.
   *
   * example:
   *
   *     var programInfo = createProgramInfo(
   *         gl, ["some-vs", "some-fs"]);
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
   *     twgl.setUniforms(programInfo, uniforms);
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
   *     twgl.setUniforms(programInfo, uniforms);
   *     twgl.setUniforms(programInfo, moreUniforms);
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
   * @memberOf module:twgl/programs
   */
  function setUniforms(setters, values) {  // eslint-disable-line
    var actualSetters = setters.uniformSetters || setters;
    var numArgs = arguments.length;
    for (var andx = 1; andx < numArgs; ++andx) {
      var vals = arguments[andx];
      if (Array.isArray(vals)) {
        var numValues = vals.length;
        for (var ii = 0; ii < numValues; ++ii) {
          setUniforms(actualSetters, vals[ii]);
        }
      } else {
        for (var name in vals) {
          var setter = actualSetters[name];
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
   * @memberOf module:twgl/programs
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

    function createMatAttribSetter(index, typeInfo) {
      var defaultSize = typeInfo.size;
      var count = typeInfo.count;

      return function(b) {
        gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
        var numComponents = b.size || b.numComponents || defaultSize;
        var size = numComponents / count;
        var type = b.type || gl.FLOAT;
        var typeInfo = typeMap[type];
        var stride = typeInfo.size * numComponents;
        var normalize = b.normalize || false;
        var offset = b.offset || 0;
        var rowOffset = stride / count;
        for (var i = 0; i < count; ++i) {
          gl.enableVertexAttribArray(index + i);
          gl.vertexAttribPointer(
              index + i, size, type, normalize, stride, offset + rowOffset * i);
        }
      };
    }

    var numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (var ii = 0; ii < numAttribs; ++ii) {
      var attribInfo = gl.getActiveAttrib(program, ii);
      if (!attribInfo) {
        break;
      }
      var index = gl.getAttribLocation(program, attribInfo.name);
      var typeInfo = attrTypeMap[attribInfo.type];
      if (typeInfo) {
        attribSetters[attribInfo.name] = createMatAttribSetter(index, typeInfo);
      } else {
        attribSetters[attribInfo.name] = createAttribSetter(index);
      }
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
   * @memberOf module:twgl/programs
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
   * @param {(module:twgl.ProgramInfo|Object.<string, function>)} setters A `ProgramInfo` as returned from {@link module:twgl.createProgrmaInfo} or Attribute setters as returned from {@link module:twgl.createAttributeSetters}
   * @param {(module:twgl.BufferInfo|module:twgl.vertexArrayInfo)} buffers a `BufferInfo` as returned from {@link module:twgl.createBufferInfoFromArrays}.
   *   or a `VertexArrayInfo` as returned from {@link module:twgl.createVertexArrayInfo}
   * @memberOf module:twgl/programs
   */
  function setBuffersAndAttributes(gl, programInfo, buffers) {
    if (buffers.vertexArrayObject) {
      gl.bindVertexArray(buffers.vertexArrayObject);
    } else {
      setAttributes(programInfo.attribSetters || programInfo, buffers.attribs);
      if (buffers.indices) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
      }
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
   * Creates a ProgramInfo from an existing program.
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
   * @param {WebGLProgram} program an existing WebGLProgram.
   * @return {module:twgl.ProgramInfo} The created ProgramInfo.
   * @memberOf module:twgl/programs
   */
  function createProgramInfoFromProgram(gl, program) {
    var uniformSetters = createUniformSetters(gl, program);
    var attribSetters = createAttributeSetters(gl, program);
    var programInfo = {
      program: program,
      uniformSetters: uniformSetters,
      attribSetters: attribSetters,
    };

    if (utils.isWebGL2(gl)) {
      programInfo.uniformBlockSpec = createUniformBlockSpecFromProgram(gl, program);
    }

    return programInfo;
  }

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
   * NOTE: There are 3 signatures for this function
   *
   *     twgl.createProgramInfo(gl, [vs, fs], opt_errFunc);
   *     twgl.createProgramInfo(gl, [vs, fs], opt_attribs, opt_errFunc);
   *     twgl.createProgramInfo(gl, [vs, fs], opt_attribs, opt_locations, opt_errFunc);
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext
   *        to use.
   * @param {string[]} shaderSourcess Array of sources for the
   *        shaders or ids. The first is assumed to be the vertex shader,
   *        the second the fragment shader.
   * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]} [opt_locations] The locations for the attributes. A parallel array to opt_attribs letting you assign locations.
   * @param {module:twgl.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
   *        on error. If you want something else pass an callback. It's passed an error message.
   * @return {module:twgl.ProgramInfo?} The created ProgramInfo or null if it failed to link or compile
   * @memberOf module:twgl/programs
   */
  function createProgramInfo(
      gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback) {
    if (typeof opt_locations === 'function') {
      opt_errorCallback = opt_locations;
      opt_locations = undefined;
    }
    if (typeof opt_attribs === 'function') {
      opt_errorCallback = opt_attribs;
      opt_attribs = undefined;
    }
    var errFn = opt_errorCallback || error;
    var good = true;
    shaderSources = shaderSources.map(function(source) {
      // Lets assume if there is no \n it's an id
      if (source.indexOf("\n") < 0) {
        var script = document.getElementById(source);
        if (!script) {
          errFn("no element with id: " + source);
          good = false;
        } else {
          source = script.text;
        }
      }
      return source;
    });
    if (!good) {
      return null;
    }
    var program = createProgramFromSources(gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback);
    if (!program) {
      return null;
    }
    return createProgramInfoFromProgram(gl, program);
  }

  // Using quotes prevents Uglify from changing the names.
  // No speed diff AFAICT.
  return {
    "createAttributeSetters": createAttributeSetters,

    "createProgram": createProgram,
    "createProgramFromScripts": createProgramFromScripts,
    "createProgramFromSources": createProgramFromSources,
    "createProgramInfo": createProgramInfo,
    "createProgramInfoFromProgram": createProgramInfoFromProgram,
    "createUniformSetters": createUniformSetters,
    "createUniformBlockSpecFromProgram": createUniformBlockSpecFromProgram,
    "createUniformBlockInfoFromProgram": createUniformBlockInfoFromProgram,
    "createUniformBlockInfo": createUniformBlockInfo,

    "setAttributes": setAttributes,
    "setBuffersAndAttributes": setBuffersAndAttributes,
    "setUniforms": setUniforms,
    "setUniformBlock": setUniformBlock,
    "setBlockUniforms": setBlockUniforms,
    "bindUniformBlock": bindUniformBlock,
  };

});

