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
    './typedarrays',
    './utils',
  ], function(
    typedArrays,
    utils) {
  "use strict";

  /**
   * Low level texture related functions
   *
   * You should generally not need to use these functions. They are provided
   * for those cases where you're doing something out of the ordinary
   * and you need lower level access.
   *
   * For backward compatibily they are available at both `twgl.textures` and `twgl`
   * itself
   *
   * See {@link module:twgl} for core functions
   *
   * @module twgl/textures
   */

  // make sure we don't see a global gl
  var gl = undefined;  // eslint-disable-line
  var defaults = {
    textureColor: new Uint8Array([128, 192, 255, 255]),
    textureOptions: {},
    crossOrigin: undefined,
  };
  var isArrayBuffer = typedArrays.isArrayBuffer;

  /* PixelFormat */
  var ALPHA                          = 0x1906;
  var RGB                            = 0x1907;
  var RGBA                           = 0x1908;
  var LUMINANCE                      = 0x1909;
  var LUMINANCE_ALPHA                = 0x190A;

  /* TextureWrapMode */
  var REPEAT                         = 0x2901;  // eslint-disable-line
  var MIRRORED_REPEAT                = 0x8370;  // eslint-disable-line

  /* TextureMagFilter */
  var NEAREST                        = 0x2600;  // eslint-disable-line

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
   * @deprecated see {@link module:twgl.setDefaults}
   * @memberOf module:twgl/textures
   */
  function setDefaultTextureColor(color) {
    defaults.textureColor = new Uint8Array([color[0] * 255, color[1] * 255, color[2] * 255, color[3] * 255]);
  }

  function setDefaults(newDefaults) {
    utils.copyExistingProperties(newDefaults, defaults);
    if (newDefaults.textureColor) {
      setDefaultTextureColor(newDefaults.textureColor);
    }
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
   * @property {number} [depth] the depth of a texture. Only used if src is an array or type array or null and target is `TEXTURE_3D` .
   * @property {number} [min] the min filter setting (eg. `gl.LINEAR`). Defaults to `gl.NEAREST_MIPMAP_LINEAR`
   *     or if texture is not a power of 2 on both dimensions then defaults to `gl.LINEAR`.
   * @property {number} [mag] the mag filter setting (eg. `gl.LINEAR`). Defaults to `gl.LINEAR`
   * @property {number} [internalFormat] internal format for texture. Defaults to `gl.RGBA`
   * @property {number} [format] format for texture. Defaults to `gl.RGBA`.
   * @property {number} [type] type for texture. Defaults to `gl.UNSIGNED_BYTE` unless `src` is ArrayBuffer. If `src`
   *     is ArrayBuffer defaults to type that matches ArrayBuffer type.
   * @property {number} [wrap] Texture wrapping for both S and T (and R if TEXTURE_3D). Defaults to `gl.REPEAT` for 2D unless src is WebGL1 and src not npot and `gl.CLAMP_TO_EDGE` for cube
   * @property {number} [wrapS] Texture wrapping for S. Defaults to `gl.REPEAT` and `gl.CLAMP_TO_EDGE` for cube. If set takes precedence over `wrap`.
   * @property {number} [wrapT] Texture wrapping for T. Defaults to `gl.REPEAT` and `gl.CLAMP_TO_EDGE` for cube. If set takes precedence over `wrap`.
   * @property {number} [wrapR] Texture wrapping for R. Defaults to `gl.REPEAT` and `gl.CLAMP_TO_EDGE` for cube. If set takes precedence over `wrap`.
   * @property {number} [minLod] TEXTURE_MIN_LOD setting
   * @property {number} [maxLod] TEXTURE_MAX_LOD setting
   * @property {number} [baseLevel] TEXTURE_BASE_LEVEL setting
   * @property {number} [maxLevel] TEXTURE_MAX_LEVEL setting
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
   *    If it's a JavaScript array assumes color is 0 to 1 like most GL colors as in `[1, 0, 0, 1] = red=1, green=0, blue=0, alpha=0`.
   *    Defaults to `[0.5, 0.75, 1, 1]`. See {@link module:twgl.setDefaultTextureColor}. If `false` texture is set. Can be used to re-load a texture
   * @property {boolean} [auto] If not `false` then texture working filtering is set automatically for non-power of 2 images and
   *    mips are generated for power of 2 images.
   * @property {number[]} [cubeFaceOrder] The order that cube faces are pulled out of an img or set of images. The default is
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
   *    *   If neither `width` nor `height` are specified and `sqrt(numElements)` is an integer then width and height
   *        are set to `sqrt(numElements)`. Otherwise `width = numElements` and `height = 1`.
   *
   *    *   If only one of `width` or `height` is specified then the other equals `numElements / specifiedDimension`.
   *
   * If `number[]` will be converted to `type`.
   *
   * If `src` is a function it will be called with a `WebGLRenderingContext` and these options.
   * Whatever it returns is subject to these rules. So it can return a string url, an `HTMLElement`
   * an array etc...
   *
   * If `src` is undefined then an empty texture will be created of size `width` by `height`.
   *
   * @property {string} [crossOrigin] What to set the crossOrigin property of images when they are downloaded.
   *    default: undefined. Also see {@link module:twgl.setDefaults}.
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
      lastPackState.colorspaceConversion = gl.getParameter(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL);
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, options.colorspaceConversion);
    }
    if (options.premultiplyAlpha !== undefined) {
      lastPackState.premultiplyAlpha = gl.getParameter(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, options.premultiplyAlpha);
    }
    if (options.flipY !== undefined) {
      lastPackState.flipY = gl.getParameter(gl.UNPACK_FLIP_Y_WEBGL);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, options.flipY);
    }
  }

  /**
   * Restores any packing state that was set based on the options.
   * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   */
  function restorePackState(gl, options) {
    if (options.colorspaceConversion !== undefined) {
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, lastPackState.colorspaceConversion);
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
   *   This is often the same options you passed in when you created the texture.
   * @memberOf module:twgl/textures
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
      if (target === gl.TEXTURE_3D) {
        gl.texParameteri(target, gl.TEXTURE_WRAP_R, options.wrap);
      }
    }
    if (options.wrapR) {
      gl.texParameteri(target, gl.TEXTURE_WRAP_R, options.wrapR);
    }
    if (options.wrapS) {
      gl.texParameteri(target, gl.TEXTURE_WRAP_S, options.wrapS);
    }
    if (options.wrapT) {
      gl.texParameteri(target, gl.TEXTURE_WRAP_T, options.wrapT);
    }
    if (options.minLod) {
      gl.texParameteri(target, gl.TEXTURE_MIN_LOD, options.minLod);
    }
    if (options.maxLod) {
      gl.texParameteri(target, gl.TEXTURE_MAX_LOD, options.maxLod);
    }
    if (options.baseLevel) {
      gl.texParameteri(target, gl.TEXTURE_BASE_LEVEL, options.baseLevel);
    }
    if (options.maxLevel) {
      gl.texParameteri(target, gl.TEXTURE_MAX_LEVEL, options.maxLevel);
    }
  }

  /**
   * Makes a 1x1 pixel
   * If no color is passed in uses the default color which can be set by calling `setDefaultTextureColor`.
   * @param {(number[]|ArrayBuffer)} [color] The color using 0-1 values
   * @return {Uint8Array} Unit8Array with color.
   */
  function make1Pixel(color) {
    color = color || defaults.textureColor;
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
   *   This is often the same options you passed in when you created the texture.
   * @param {number} [width] width of texture
   * @param {number} [height] height of texture
   * @memberOf module:twgl/textures
   */
  function setTextureFilteringForSize(gl, tex, options, width, height) {
    options = options || defaults.textureOptions;
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
   *   This is often the same options you passed in when you created the texture.
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
   * @ignore
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
   *   This is often the same options you passed in when you created the texture.
   * @memberOf module:twgl/textures
   * @kind function
   */
  var setTextureFromElement = function() {
    var ctx = document.createElement("canvas").getContext("2d");
    return function setTextureFromElement(gl, tex, element, options) {
      options = options || defaults.textureOptions;
      var target = options.target || gl.TEXTURE_2D;
      var width = element.width;
      var height = element.height;
      var format = options.format || gl.RGBA;
      var internalFormat = options.internalFormat || format;
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
          gl.texImage2D(f.face, 0, internalFormat, format, type, ctx.canvas);
        });
        // Free up the canvas memory
        ctx.canvas.width = 1;
        ctx.canvas.height = 1;
      } else if (target === gl.TEXTURE_3D) {
        var smallest = Math.min(element.width, element.height);
        var largest = Math.max(element.width, element.height);
        var depth = largest / smallest;
        if (depth % 1 !== 0) {
          throw "can not compute 3D dimensions of element";
        }
        var xMult = element.width  === largest ? 1 : 0;
        var yMult = element.height === largest ? 1 : 0;
        gl.texImage3D(target, 0, internalFormat, smallest, smallest, smallest, 0, format, type, null);
        // remove this is texSubImage3D gets width and height arguments
        ctx.canvas.width = smallest;
        ctx.canvas.height = smallest;
        for (var d = 0; d < depth; ++d) {
//          gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, d * smallest);
//          gl.texSubImage3D(target, 0, 0, 0, d, format, type, element);
            var srcX = d * smallest * xMult;
            var srcY = d * smallest * yMult;
            var srcW = smallest;
            var srcH = smallest;
            var dstX = 0;
            var dstY = 0;
            var dstW = smallest;
            var dstH = smallest;
            ctx.drawImage(element, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);
            gl.texSubImage3D(target, 0, 0, 0, d, format, type, ctx.canvas);
        }
        ctx.canvas.width = 0;
        ctx.canvas.height = 0;
// FIX (save state)
//        gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, 0);
      } else {
        gl.texImage2D(target, 0, internalFormat, format, type, element);
      }
      restorePackState(gl, options);
      if (options.auto !== false) {
        setTextureFilteringForSize(gl, tex, options, width, height);
      }
      setTextureParameters(gl, tex, options);
    };
  }();

  function noop() {
  }

  /**
   * Loads an image
   * @param {string} url url to image
   * @param {function(err, img)} [callback] a callback that's passed an error and the image. The error will be non-null
   *     if there was an error
   * @return {HTMLImageElement} the image being loaded.
   */
  function loadImage(url, crossOrigin, callback) {
    callback = callback || noop;
    var img = new Image();
    crossOrigin = crossOrigin !== undefined ? crossOrigin : defaults.crossOrigin;
    if (crossOrigin !== undefined) {
      img.crossOrigin = crossOrigin;
    }

    function clearEventHandlers() {
      img.removeEventListener('error', onError);  // eslint-disable-line
      img.removeEventListener('load', onLoad);  // eslint-disable-line
      img = null;
    }

    function onError() {
      var msg = "couldn't load image: " + url;
      utils.error(msg);
      callback(msg, img);
      clearEventHandlers();
    }

    function onLoad() {
      callback(null, img);
      clearEventHandlers();
    }

    img.addEventListener('error', onError);
    img.addEventListener('load', onLoad);
    img.src = url;
    return img;
  }

  /**
   * Sets a texture to a 1x1 pixel color. If `options.color === false` is nothing happens. If it's not set
   * the default texture color is used which can be set by calling `setDefaultTextureColor`.
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {WebGLTexture} tex the WebGLTexture to set parameters for
   * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
   *   This is often the same options you passed in when you created the texture.
   * @memberOf module:twgl/textures
   */
  function setTextureTo1PixelColor(gl, tex, options) {
    options = options || defaults.textureOptions;
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
    } else if (target === gl.TEXTURE_3D) {
      gl.texImage3D(target, 0, gl.RGBA, 1, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, color);
    } else {
      gl.texImage2D(target, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, color);
    }
  }

  /**
   * The src image(s) used to create a texture.
   *
   * When you call {@link module:twgl.createTexture} or {@link module:twgl.createTextures}
   * you can pass in urls for images to load into the textures. If it's a single url
   * then this will be a single HTMLImageElement. If it's an array of urls used for a cubemap
   * this will be a corresponding array of images for the cubemap.
   *
   * @typedef {HTMLImageElement|HTMLImageElement[]} TextureSrc
   * @memberOf module:twgl
   */

  /**
   * A callback for when an image finished downloading and been uploaded into a texture
   * @callback TextureReadyCallback
   * @param {*} err If truthy there was an error.
   * @param {WebGLTexture} texture the texture.
   * @param {module:twgl.TextureSrc} souce image(s) used to as the src for the texture
   * @memberOf module:twgl
   */

  /**
   * A callback for when all images have finished downloading and been uploaded into their respective textures
   * @callback TexturesReadyCallback
   * @param {*} err If truthy there was an error.
   * @param {Object.<string, WebGLTexture>} textures the created textures by name. Same as returned by {@link module:twgl.createTextures}.
   * @param {Object.<string, module:twgl.TextureSrc>} sources the image(s) used for the texture by name.
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
   * @memberOf module:twgl/textures
   */
  function loadTextureFromUrl(gl, tex, options, callback) {
    callback = callback || noop;
    options = options || defaults.textureOptions;
    setTextureTo1PixelColor(gl, tex, options);
    // Because it's async we need to copy the options.
    options = utils.shallowCopy(options);
    var img = loadImage(options.src, options.crossOrigin, function(err, img) {
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
   * @param {module:twgl.CubemapReadyCallback} [callback] A function to be called when all the images have finished loading. err will
   *    be non null if there was an error.
   * @memberOf module:twgl/textures
   */
  function loadCubemapFromUrls(gl, tex, options, callback) {
    callback = callback || noop;
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
    options = utils.shallowCopy(options);
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
          callback(errors.length ? errors : undefined, imgs, tex);
        }
      };
    }

    imgs = urls.map(function(url, ndx) {
      return loadImage(url, options.crossOrigin, uploadImg(faces[ndx]));
    });
  }

  /**
   * Gets the number of compontents for a given image format.
   * @param {number} format the format.
   * @return {number} the number of components for the format.
   * @memberOf module:twgl/textures
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
      return typedArrays.getGLTypeForTypedArray(src);
    }
    return gl.UNSIGNED_BYTE;
  }

  function guessDimensions(gl, target, width, height, numElements) {
    if (numElements % 1 !== 0) {
      throw "can't guess dimensions";
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
        throw "can't guess dimensions";
      }
    } else if (!width) {
      width = numElements / height;
      if (width % 1) {
        throw "can't guess dimensions";
      }
    }
    return {
      width: width,
      height: height,
    };
  }

  /**
   * Sets a texture from an array or typed array. If the width or height is not provided will attempt to
   * guess the size. See {@link module:twgl.TextureOptions}.
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {WebGLTexture} tex the WebGLTexture to set parameters for
   * @param {(number[]|ArrayBuffer)} src An array or typed arry with texture data.
   * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
   *   This is often the same options you passed in when you created the texture.
   * @memberOf module:twgl/textures
   */
  function setTextureFromArray(gl, tex, src, options) {
    options = options || defaults.textureOptions;
    var target = options.target || gl.TEXTURE_2D;
    gl.bindTexture(target, tex);
    var width = options.width;
    var height = options.height;
    var depth = options.depth;
    var format = options.format || gl.RGBA;
    var internalFormat = options.internalFormat || format;
    var type = options.type || getTextureTypeForArrayType(gl, src);
    var numComponents = getNumComponentsForFormat(format);
    var numElements = src.length / numComponents;
    if (numElements % 1) {
      throw "length wrong size for format: " + glEnumToString(gl, format);
    }
    var dimensions;
    if (target === gl.TEXTURE_3D) {
      if (!width && !height && !depth) {
        var size = Math.cbrt(numElements);
        if (size % 1 !== 0) {
          throw "can't guess cube size of array of numElements: " + numElements;
        }
        width = size;
        height = size;
        depth = size;
      } else if (width && (!height || !depth)) {
        dimensions = guessDimensions(gl, target, height, depth, numElements / width);
        height = dimensions.width;
        depth = dimensions.height;
      } else if (height && (!width || !depth)) {
        dimensions = guessDimensions(gl, target, width, depth, numElements / height);
        width = dimensions.width;
        depth = dimensions.height;
      } else {
        dimensions = guessDimensions(gl, target, width, height, numElements / depth);
        width = dimensions.width;
        height = dimensions.height;
      }
    } else {
      dimensions = guessDimensions(gl, target, width, height, numElements);
      width = dimensions.width;
      height = dimensions.height;
    }
    if (!isArrayBuffer(src)) {
      var Type = typedArrays.getTypedArrayTypeForGLType(type);
      src = new Type(src);
    } else {
      if (src instanceof Uint8ClampedArray) {
        src = new Uint8Array(src.buffer);
      }
    }
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, options.unpackAlignment || 1);
    savePackState(gl, options);
    if (target === gl.TEXTURE_CUBE_MAP) {
      var faceSize = numElements / 6 * numComponents;
      getCubeFacesWithNdx(gl, options).forEach(function(f) {
        var offset = faceSize * f.ndx;
        var data = src.subarray(offset, offset + faceSize);
        gl.texImage2D(f.face, 0, internalFormat, width, height, 0, format, type, data);
      });
    } else if (target === gl.TEXTURE_3D) {
      gl.texImage3D(target, 0, internalFormat, width, height, depth, 0, format, type, src);
    } else {
      gl.texImage2D(target, 0, internalFormat, width, height, 0, format, type, src);
    }
    restorePackState(gl, options);
    return {
      width: width,
      height: height,
      depth: depth,
    };
  }

  /**
   * Sets a texture with no contents of a certain size. In other words calls `gl.texImage2D` with `null`.
   * You must set `options.width` and `options.height`.
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {WebGLTexture} tex the WebGLTexture to set parameters for
   * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
   * @memberOf module:twgl/textures
   */
  function setEmptyTexture(gl, tex, options) {
    var target = options.target || gl.TEXTURE_2D;
    gl.bindTexture(target, tex);
    var format = options.format || gl.RGBA;
    var internalFormat = options.internalFormat || format;
    var type = options.type || gl.UNSIGNED_BYTE;
    savePackState(gl, options);
    if (target === gl.TEXTURE_CUBE_MAP) {
      for (var ii = 0; ii < 6; ++ii) {
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + ii, 0, internalFormat, options.width, options.height, 0, format, type, null);
      }
    } else if (target === gl.TEXTURE_3D) {
      gl.texImage3D(target, 0, internalFormat, options.width, options.height, options.depth, 0, format, type, null);
    } else {
      gl.texImage2D(target, 0, internalFormat, options.width, options.height, 0, format, type, null);
    }
    restorePackState(gl, options);
  }

  /**
   * Creates a texture based on the options passed in.
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
   * @param {module:twgl.TextureReadyCallback} [callback] A callback called when an image has been downloaded and uploaded to the texture.
   * @return {WebGLTexture} the created texture.
   * @memberOf module:twgl/textures
   */
  function createTexture(gl, options, callback) {
    callback = callback || noop;
    options = options || defaults.textureOptions;
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
   * @memberOf module:twgl/textures
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
   * @return {Object.<string,WebGLTexture>} the created textures by name
   * @memberOf module:twgl/textures
   */
  function createTextures(gl, textureOptions, callback) {
    callback = callback || noop;
    var numDownloading = 0;
    var errors = [];
    var textures = {};
    var images = {};

    function callCallbackIfReady() {
      if (numDownloading === 0) {
        setTimeout(function() {
          callback(errors.length ? errors : undefined, textures, images);
        }, 0);
      }
    }

    Object.keys(textureOptions).forEach(function(name) {
      var options = textureOptions[name];
      var onLoadFn;
      if (isAsyncSrc(options.src)) {
        onLoadFn = function(err, tex, img) {
          images[name] = img;
          --numDownloading;
          if (err) {
            errors.push(err);
          }
          callCallbackIfReady();
        };
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

  // Using quotes prevents Uglify from changing the names.
  // No speed diff AFAICT.
  return {
    "setDefaults_": setDefaults,

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
    "getNumComponentsForFormat": getNumComponentsForFormat,
  };
});


