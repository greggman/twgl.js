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
"use strict";

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else {
    // Browser globals
    var lib = factory.call(root);
    root.twgl = root.twgl || {};
    Object.keys(lib).forEach(function(key) {
      root.twgl[key] = lib[key];
    });
  }
}(this, function () {

  /** @module twgl */
  var error = this.console && this.console.error ? this.console.error.bind(this.console) : function() { };

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
   * @param {WebGLContextCreationAttirbutes?} opt_attribs optional webgl context creation attributes
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
      errFn("*** Error compiling shader '" + shader + "':" + lastError);
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  /**
   * Creates a program, attaches shaders, binds attrib locations, links the
   * program and calls useProgram.
   * @param {WebGLShader[]} shaders The shaders to attach
   * @param {string[]?} opt_attribs An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]?} opt_locations The locations for the. A parallel array to opt_attribs letting you assign locations.
   * @param {module:twgl.ErrorCallback?} opt_errorCallback callback for errors. By default it just prints an error to the console
   *        on error. If you want something else pass an callback. It's passed an error message.
   * @return {WebGLProgram?) the created program or null if error.
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
   * @param {number?} opt_shaderType The type of shader. If not passed in it will
   *     be derived from the type of the script tag.
   * @param {module:twgl.ErrorCallback?} opt_errorCallback callback for errors.
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
   * @param {string[]?} opt_attribs An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]?} opt_locations The locations for the. A parallel array to opt_attribs letting you assign locations.
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
   * @param {string[]?} opt_attribs An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]?} opt_locations The locations for the. A parallel array to opt_attribs letting you assign locations.
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
   * @typedef {Object.<string, function>} Setters
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
        return function(v) { gl.uniform1fv(location, v); };
      }
      if (type === gl.FLOAT) {
        return function(v) { gl.uniform1f(location, v); };
      }
      if (type === gl.FLOAT_VEC2) {
        return function(v) { gl.uniform2fv(location, v); };
      }
      if (type === gl.FLOAT_VEC3) {
        return function(v) { gl.uniform3fv(location, v); };
      }
      if (type === gl.FLOAT_VEC4) {
        return function(v) { gl.uniform4fv(location, v); };
      }
      if (type === gl.INT && isArray) {
        return function(v) { gl.uniform1iv(location, v); };
      }
      if (type === gl.INT) {
        return function(v) { gl.uniform1i(location, v); };
      }
      if (type === gl.INT_VEC2) {
        return function(v) { gl.uniform2iv(location, v); };
      }
      if (type === gl.INT_VEC3) {
        return function(v) { gl.uniform3iv(location, v); };
      }
      if (type === gl.INT_VEC4) {
        return function(v) { gl.uniform4iv(location, v); };
      }
      if (type === gl.BOOL) {
        return function(v) { gl.uniform1iv(location, v); };
      }
      if (type === gl.BOOL_VEC2) {
        return function(v) { gl.uniform2iv(location, v); };
      }
      if (type === gl.BOOL_VEC3) {
        return function(v) { gl.uniform3iv(location, v); };
      }
      if (type === gl.BOOL_VEC4) {
        return function(v) { gl.uniform4iv(location, v); };
      }
      if (type === gl.FLOAT_MAT2) {
        return function(v) { gl.uniformMatrix2fv(location, false, v); };
      }
      if (type === gl.FLOAT_MAT3) {
        return function(v) { gl.uniformMatrix3fv(location, false, v); };
      }
      if (type === gl.FLOAT_MAT4) {
        return function(v) { gl.uniformMatrix4fv(location, false, v); };
      }
      if ((type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) && isArray) {
        var units = [];
        for (var ii = 0; ii < info.size; ++ii) {
          units.push(textureUnit++);
        }
        return function(bindPoint, units) {
          return function(textures) {
            gl.uniform1iv(location, units);
            textures.forEach(function(texture, index) {
              gl.activeTexture(gl.TEXTURE0 + units[index]);
              gl.bindTexture(bindPoint, tetxure);
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
   * @param {module:twgl.ProgramInfo|Object.<string, function>} setters a `ProgramInfo` as returned from `createProgramInfo` or the setters returned from
   *        `createUniformSetters`.
   * @param {Object.<string, value>} an object with values for the
   *        uniforms.
   * @memberOf module:twgl
   */
  function setUniforms(setters, values) {
    setters = setters.uniformSetters || setters;
    Object.keys(values).forEach(function(name) {
      var setter = setters[name];
      if (setter) {
        setter(values[name]);
      }
    });
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
    Object.keys(buffers).forEach(function(name) {
      var setter = setters[name];
      if (setter) {
        setter(buffers[name]);
      }
    });
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
   * @param {module:twgl.ProgramInfo|Object.<string, function>} setters A `ProgramInfo` as returned from `createProgrmaInfo` Attribute setters as returned from `createAttributeSetters`
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
   * @property {Object<string, function>} uniformSetters: object of setters as returned from createUniformSetters,
   * @property {Object<string, function>} attribSetters: object of setters as returned from createAttribSetters,
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
   * @param {string[]?} opt_attribs An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]?} opt_locations The locations for the. A parallel array to opt_attribs letting you assign locations.
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
   * @param {number?} a multiplier. So you can pass in `window.devicePixelRatio` if you want to.
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
    type = type || gl.ARRAY_BUFFER;
    var buffer = gl.createBuffer();
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, array, drawType || gl.STATIC_DRAW);
    return buffer;
  }

  function allButIndices(name) {
    return name !== "indices";
  }

  function createMapping(obj) {
    var mapping = {};
    Object.keys(obj).filter(allButIndices).forEach(function(key) {
      mapping["a_" + key] = key;
    });
    return mapping;
  }

  function getGLTypeForTypedArray(gl, typedArray) {
    /*eslint brace-style:0*/
    if (typedArray instanceof Int8Array)    { return gl.BYTE; }
    if (typedArray instanceof Uint8Array)   { return gl.UNSIGNED_BYTE; }
    if (typedArray instanceof Int16Array)   { return gl.SHORT; }
    if (typedArray instanceof Uint16Array)  { return gl.UNSIGNED_SHORT; }
    if (typedArray instanceof Int32Array)   { return gl.INT; }
    if (typedArray instanceof Uint32Array)  { return gl.UNSIGNED_INT; }
    if (typedArray instanceof Float32Array) { return gl.FLOAT; }
    throw "unsupported typed array type";
  }

  // This is really just a guess. Though I can't really imagine using
  // anything else? Maybe for some compression?
  function getNormalizationForTypedArray(typedArray) {
    if (typedArray instanceof Int8Array)    { return true; }
    if (typedArray instanceof Uint8Array)   { return true; }
    return false;
  }

  function isArrayBuffer(a) {
    return a.buffer && a.buffer instanceof ArrayBuffer;
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

    if (Array.isArray(array)) {
      array = {
        data: array,
      };
    }

//    if (!array.numComponents) {
//      array.numComponents = guessNumComponentsFromName(name, array.length);
//    }

    var Type = array.type;
    if (!Type) {
      if (name === "indices") {
        Type = Uint16Array;
      } else {
        Type = Float32Array;
      }
    }
//    var numElements = array.data.length / array.numComponents;
//    if (numElements % 1) {
//      console.warn("numComponents = ", array.numComponents, "doesn't match length = ", array.length, "of data given");
//    }
//FIXME    var typedArray = createAugmentedTypedArray(array.length, type);
//FIXME    typedArray.push(array.data);
    return new Type(array.data);
  }

  /**
   * @typedef {Object} AttribInfo
   * @property {number?} numComponents the number of components for this attribute.
   * @property {number?} size the number of components for this attribute.
   * @property {number?} type the type of the attribute (eg. `gl.FLOAT`, `gl.UNSIGNED_BYTE`, etc...) Default = `gl.FLOAT`
   * @property {boolean?} normalized whether or not to normalize the data. Default = false
   * @property {number?} offset offset into buffer in bytes. Default = 0
   * @property {number?} stride the stride in bytes per element. Default = 0
   * @property {WebGLBuffer} buffer the buffer that contains the data for this attribute
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
   *        a_position: { numComponents: 3, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
   *        a_texcoord: { numComponents: 2, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
   *        a_normal:   { numComponents: 3, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
   *        a_color:    { numComponents: 4, type: gl.UNSIGNED_BYTE, normalize: true,  buffer: WebGLBuffer, },
   *      };
   *
   * @param {WebGLRenderingContext} gl The webgl rendering context.
   * @param {Object.<string, array|typedarray>} arrays The arrays
   * @param {Object.<string, string>?} opt_mapping mapping from attribute name to array name.
   *     if not specified defaults to "a_name" -> "name".
   * @return {Object.<string, module:twgl.AttribInfo>} the attribs
   * @memberOf module:twgl
   */
  function createAttribsFromArrays(gl, arrays, opt_mapping) {
    var mapping = opt_mapping || createMapping(arrays);
    var attribs = {};
    Object.keys(mapping).forEach(function(attribName) {
      var bufferName = mapping[attribName];
      var array = makeTypedArray(arrays[bufferName], bufferName);
      attribs[attribName] = {
        buffer:        createBufferFromTypedArray(gl, array),
        numComponents: array.numComponents || guessNumComponentsFromName(bufferName),
        type:          getGLTypeForTypedArray(gl, array),
        normalize:     getNormalizationForTypedArray(array),
      };
    });
    return attribs;
  }

  /**
   * tries to get the number of elements from a set of arrays.
   */
  var positionKeys = ['position', 'positions', 'a_position'];
//FIXME
  function getNumElementsFromNonIndexedArrays(arrays) {
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
      throw "numComponents " + numComponent + " not correct for length " + length;
    }
    return numElements;
  }

  /**
   * @typedef {Object} BufferInfo
   * @property {number} numElements The number of elements to pass to `gl.drawArrays` or `gl.drawElements`.
   * @property {WebGLBuffer?} indices The indices `ELEMENT_ARRAY_BUFFER` if any indices exist.
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
   * @param {Object.<string, array|object|typedarray>} arrays Your data
   * @param {Object.<string, string>?} opt_mapping an optional mapping of attribute to array name.
   *    If not passed in it's assumed the array names will be mapped to an attibute
   *    of the same name with "a_" prefixed to it. An other words.
   *
   *        var arrays = {
   *           position: ...,
   *           texcoord: ...,
   *           normal:   ...,
   *           indices:  ...,
   *        };
   *
   *        bufferInfo = createBufferInfoFromArrays(gl, arrays);
   *
   *    Is the same as
   *
   *        var arrays = {
   *           position: ...,
   *           texcoord: ...,
   *           normal:   ...,
   *           indices:  ...,
   *        };
   *
   *        var mapping = {
   *          a_position: "position",
   *          a_texcoord: "texcoord",
   *          a_normal:   "normal",
   *        };
   *
   *        bufferInfo = createBufferInfoFromArrays(gl, arrays, mapping);
   *
   * @return {module:twgl.BufferInfo} A BufferInfo
   * @memberOf module:twgl
   */
  function createBufferInfoFromArrays(gl, arrays, opt_mapping) {
    var bufferInfo = {
      attribs: createAttribsFromArrays(gl, arrays, opt_mapping),
    };
    var indices = arrays.indices;
    if (indices) {
      indices = makeTypedArray(indices, "indices");
      bufferInfo.indices = createBufferFromTypedArray(gl, indices, gl.ELEMENT_ARRAY_BUFFER);
      bufferInfo.numElements = indices.length;
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
   * @param {Object<string, array|typedarray>} arrays
   * @return {Object<string, WebGLBuffer>} returns an object with one WebGLBuffer per array
   * @memberOf module:twgl
   */
  function createBuffersFromArrays(gl, arrays) {
    var buffers = { };
    Object.keys(arrays).forEach(function(key) {
      var type = key === "indices" ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
      var array = makeTypedArray(arrays[key], name);
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
   * @param {number?} count An optional count. Defaults to bufferInfo.numElements
   * @param {number?} offset An optional offset. Defaults to 0.
   * @memberOf module:twgl
   */
  function drawBufferInfo(gl, type, bufferInfo, count, offset) {
    var indices = bufferInfo.indices;
    var numElements = count === undefined ? bufferInfo.numElements : count;
    offset = offset === undefined ? offset : 0;
    if (indices) {
      gl.drawElements(type, numElements, gl.UNSIGNED_SHORT, offset);
    } else {
      gl.drawArrays(type, offset, numElements);
    }
  }

  /**
   * @typedef {Object} DrawObject
   * @property {number?} type type to draw eg. `gl.TRIANGLES`, `gl.LINES`, etc...
   * @property {module:twgl.ProgramInfo} programInfo A ProgramInfo as returned from createProgramInfo
   * @property {module:twgl.BufferInfo} bufferInfo A BufferInfo as returned from createBufferInfoFromArrays
   * @property {Object<string, ?>} uniforms The values for the uniforms
   * @memberOf module:twgl
   */

  /**
   * Draws a list of objects
   * @param {DrawObject[]} objectsToDraw an array of objects to draw.
   * @memberOf module:twgl
   */
  function drawObjectList(objectsToDraw) {
    var lastUsedProgramInfo = null;
    var lastUsedBufferInfo = null;

    objectsToDraw.forEach(function(object) {
      var programInfo = object.programInfo;
      var bufferInfo = object.bufferInfo;

      if (programInfo !== lastUsedProgramInfo) {
        lastUsedProgramInfo = programInfo;
        gl.useProgram(programInfo.program);
      }

      // Setup all the needed attributes.
      if (bufferInfo !== lastUsedBufferInfo) {
        lastUsedBufferInfo = bufferInfo;
        setBuffersAndAttributes(gl, programInfo, bufferInfo);
      }

      // Set the uniforms.
      setUniforms(programInfo, object.uniforms);

      // Draw
      drawBufferInfo(gl, object.type || gl.TRIANGLES, bufferInfo);
    });
  }

  return {
    createAttribsFromArrays: createAttribsFromArrays,
    createBuffersFromArrays: createBuffersFromArrays,
    createBufferInfoFromArrays: createBufferInfoFromArrays,
    createAttributeSetters: createAttributeSetters,
    createProgram: createProgram,
    createProgramFromScripts: createProgramFromScripts,
    createProgramFromSources: createProgramFromSources,
    createProgramInfo: createProgramInfo,
    createUniformSetters: createUniformSetters,
    drawBufferInfo: drawBufferInfo,
    drawObjectList: drawObjectList,
    getWebGLContext: getWebGLContext,
    resizeCanvasToDisplaySize: resizeCanvasToDisplaySize,
    setAttributes: setAttributes,
    setBuffersAndAttributes: setBuffersAndAttributes,
    setUniforms: setUniforms,
  };

}));

