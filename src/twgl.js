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
    './attributes',
    './draw',
    './framebuffers',
    './programs',
    './textures',
    './typedarrays',
    './utils',
  ], function(
    attributes,
    draw,
    framebuffers,
    programs,
    textures,
    typedArrays,
    utils) {
  "use strict";

  /**
   * The main TWGL module.
   *
   * For most use cases you shouldn't need anything outside this module.
   * Exceptions between the stuff added to twgl-full (v3, m4, primitives)
   *
   * @module twgl
   * @borrows module:twgl/attributes.setAttribInfoBufferFromArray as setAttribInfoBufferFromArray
   * @borrows module:twgl/attributes.createBufferInfoFromArrays as createBufferInfoFromArrays
   * @borrows module:twgl/attributes.createVertexArrayInfo as createVertexArrayInfo
   * @borrows module:twgl/draw.drawBufferInfo as drawBufferInfo
   * @borrows module:twgl/draw.drawObjectList as drawObjectList
   * @borrows module:twgl/framebuffers.createFramebufferInfo as createFramebufferInfo
   * @borrows module:twgl/framebuffers.resizeFramebufferInfo as resizeFramebufferInfo
   * @borrows module:twgl/framebuffers.bindFramebufferInfo as bindFramebufferInfo
   * @borrows module:twgl/programs.createProgramInfo as createProgramInfo
   * @borrows module:twgl/programs.createUniformBlockInfo as createUniformBlockInfo
   * @borrows module:twgl/programs.bindUniformBlock as bindUniformBlock
   * @borrows module:twgl/programs.setUniformBlock as setUniformBlock
   * @borrows module:twgl/programs.setBlockUniforms as setBlockUniforms
   * @borrows module:twgl/programs.setUniforms as setUniforms
   * @borrows module:twgl/programs.setBuffersAndAttributes as setBuffersAndAttributes
   * @borrows module:twgl/textures.setTextureFromArray as setTextureFromArray
   * @borrows module:twgl/textures.createTexture as createTexture
   * @borrows module:twgl/textures.resizeTexture as resizeTexture
   * @borrows module:twgl/textures.createTextures as createTextures
   */

  // make sure we don't see a global gl
  var gl = undefined;  // eslint-disable-line
  var defaults = {
    enableVertexArrayObjects: true,
  };

  /**
   * Various default settings for twgl.
   *
   * Note: You can call this any number of times. Example:
   *
   *     twgl.setDefaults({ textureColor: [1, 0, 0, 1] });
   *     twgl.setDefaults({ attribPrefix: 'a_' });
   *
   * is equivalent to
   *
   *     twgl.setDefaults({
   *       textureColor: [1, 0, 0, 1],
   *       attribPrefix: 'a_',
   *     });
   *
   * @typedef {Object} Defaults
   * @property {string} attribPrefix The prefix to stick on attributes
   *
   *   When writing shaders I prefer to name attributes with `a_`, uniforms with `u_` and varyings with `v_`
   *   as it makes it clear where they came from. But, when building geometry I prefer using unprefixed names.
   *
   *   In otherwords I'll create arrays of geometry like this
   *
   *       var arrays = {
   *         position: ...
   *         normal: ...
   *         texcoord: ...
   *       };
   *
   *   But need those mapped to attributes and my attributes start with `a_`.
   *
   *   Default: `""`
   *
   * @property {number[]} textureColor Array of 4 values in the range 0 to 1
   *
   *   The default texture color is used when loading textures from
   *   urls. Because the URL will be loaded async we'd like to be
   *   able to use the texture immediately. By putting a 1x1 pixel
   *   color in the texture we can start using the texture before
   *   the URL has loaded.
   *
   *   Default: `[0.5, 0.75, 1, 1]`
   *
   * @property {string} crossOrigin
   *
   *   If not undefined sets the crossOrigin attribute on images
   *   that twgl creates when downloading images for textures.
   *
   *   Also see {@link module:twgl.TextureOptions}.
   *
   * @property {bool} enableVertexArrayObjects
   *
   *   If true then in WebGL 1.0 will attempt to get the `OES_vertex_array_object` extension.
   *   If successful it will copy create/bind/delete/isVertexArrayOES from the extension to
   *   the WebGLRenderingContext removing the OES at the end which is the standard entry point
   *   for WebGL 2.
   *
   *   Note: According to webglstats.com 90% of devices support `OES_vertex_array_object`.
   *   If you just want to count on support I suggest using [this polyfill](https://github.com/KhronosGroup/WebGL/blob/master/sdk/demos/google/resources/OESVertexArrayObject.js)
   *   or ignoring devices that don't support them.
   *
   *   Default: `true`
   *
   * @memberOf module:twgl
   */

  /**
   * Sets various defaults for twgl.
   *
   * In the interest of terseness which is kind of the point
   * of twgl I've integrated a few of the older functions here
   *
   * @param {module:twgl.Defaults} newDefaults The default settings.
   * @memberOf module:twgl
   */
  function setDefaults(newDefaults) {
    utils.copyExistingProperties(newDefaults, defaults);
    attributes.setDefaults_(newDefaults);  // eslint-disable-line
    textures.setDefaults_(newDefaults);  // eslint-disable-line
  }

  /**
   * Adds Vertex Array Objects to WebGL 1 GL contexts if available
   * @param {WebGLRenderingContext} gl A WebGLRenderingContext
   */
  function addVertexArrayObjectSupport(gl) {
    if (!gl || !defaults.enableVertexArrayObjects) {
      return;
    }
    if (utils.isWebGL1(gl)) {
      var ext = gl.getExtension("OES_vertex_array_object");
      if (ext) {
        gl.createVertexArray = function() {
          return ext.createVertexArrayOES();
        };
        gl.deleteVertexArray = function(v) {
          ext.deleteVertexArrayOES(v);
        };
        gl.isVertexArray = function(v) {
          return ext.isVertexArrayOES(v);
        };
        gl.bindVertexArray = function(v) {
          ext.bindVertexArrayOES(v);
        };
        gl.VERTEX_ARRAY_BINDING = ext.VERTEX_ARRAY_BINDING_OES;
      }
    }
  }

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
    addVertexArrayObjectSupport(gl);
    return gl;
  }

  /**
   * Creates a webgl context.
   *
   * Will return a WebGL2 context if possible.
   *
   * You can check if it's WebGL2 with
   *
   *     twgl.isWebGL2(gl);
   *
   * @param {HTMLCanvasElement} canvas The canvas tag to get
   *     context from. If one is not passed in one will be
   *     created.
   * @return {WebGLRenderingContext} The created context.
   */
  function createContext(canvas, opt_attribs) {
    var names = ["webgl2", "experimental-webgl2", "webgl", "experimental-webgl"];
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
   * Gets a WebGL context.  Will create a WebGL2 context if possible.
   *
   * You can check if it's WebGL2 with
   *
   *    function isWebGL2(gl) {
   *      return gl.getParameter(gl.VERSION).indexOf("WebGL 2.0 ") == 0;
   *    }
   *
   * @param {HTMLCanvasElement} canvas a canvas element.
   * @param {WebGLContextCreationAttirbutes} [opt_attribs] optional webgl context creation attributes
   * @return {WebGLRenderingContext} The created context.
   * @memberOf module:twgl
   */
  function getContext(canvas, opt_attribs) {
    var gl = createContext(canvas, opt_attribs);
    addVertexArrayObjectSupport(gl);
    return gl;
  }

  /**
   * Resize a canvas to match the size it's displayed.
   * @param {HTMLCanvasElement} canvas The canvas to resize.
   * @param {number} [multiplier] So you can pass in `window.devicePixelRatio` if you want to.
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

  // Using quotes prevents Uglify from changing the names.
  // No speed diff AFAICT.
  var api = {
    "getContext": getContext,
    "getWebGLContext": getWebGLContext,
    "isWebGL1": utils.isWebGL1,
    "isWebGL2": utils.isWebGL2,
    "resizeCanvasToDisplaySize": resizeCanvasToDisplaySize,
    "setDefaults": setDefaults,
  };

  function notPrivate(name) {
    return name[name.length - 1] !== '_';
  }

  function copyPublicProperties(src, dst) {
    Object.keys(src).filter(notPrivate).forEach(function(key) {
      dst[key] = src[key];
    });
    return dst;
  }

  var apis = {
    attributes: attributes,
    draw: draw,
    framebuffers: framebuffers,
    programs: programs,
    textures: textures,
    typedArrays: typedArrays,
  };
  Object.keys(apis).forEach(function(name) {
    var srcApi = apis[name];
    copyPublicProperties(srcApi, api);
    api[name] = copyPublicProperties(srcApi, {});
  });

  return api;

});

