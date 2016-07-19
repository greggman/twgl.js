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
    './textures',
    './utils',
  ], function(
    textures,
    utils) {
  "use strict";

  /**
   * Framebuffer related functions
   *
   * For backward compatibily they are available at both `twgl.framebuffer` and `twgl`
   * itself
   *
   * See {@link module:twgl} for core functions
   *
   * @module twgl/framebuffers
   */

  // make sure we don't see a global gl
  var gl = undefined;  // eslint-disable-line

  var UNSIGNED_BYTE                  = 0x1401;

  /* PixelFormat */
  var DEPTH_COMPONENT                = 0x1902;
  var RGBA                           = 0x1908;

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
   * The options for a framebuffer attachment.
   *
   * Note: For a `format` that is a texture include all the texture
   * options from {@link module:twgl.TextureOptions} for example
   * `min`, `mag`, `clamp`, etc... Note that unlike {@link module:twgl.TextureOptions}
   * `auto` defaults to `false` for attachment textures but `min` and `mag` default
   * to `gl.LINEAR` and `wrap` defaults to `CLAMP_TO_EDGE`
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
   * @memberOf module:twgl/framebuffers
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
      width: width,
      height: height,
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
          var textureOptions = utils.shallowCopy(attachmentOptions);
          textureOptions.width = width;
          textureOptions.height = height;
          if (textureOptions.auto === undefined) {
            textureOptions.auto = false;
            textureOptions.min = textureOptions.min || gl.LINEAR;
            textureOptions.mag = textureOptions.mag || gl.LINEAR;
            textureOptions.wrapS = textureOptions.wrapS || textureOptions.wrap || gl.CLAMP_TO_EDGE;
            textureOptions.wrapT = textureOptions.wrapT || textureOptions.wrap || gl.CLAMP_TO_EDGE;
          }
          attachment = textures.createTexture(gl, textureOptions);
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
   * @memberOf module:twgl/framebuffers
   */
  function resizeFramebufferInfo(gl, framebufferInfo, attachments, width, height) {
    width  = width  || gl.drawingBufferWidth;
    height = height || gl.drawingBufferHeight;
    framebufferInfo.width = width;
    framebufferInfo.height = height;
    attachments = attachments || defaultAttachments;
    attachments.forEach(function(attachmentOptions, ndx) {
      var attachment = framebufferInfo.attachments[ndx];
      var format = attachmentOptions.format;
      if (attachment instanceof WebGLRenderbuffer) {
        gl.bindRenderbuffer(gl.RENDERBUFFER, attachment);
        gl.renderbufferStorage(gl.RENDERBUFFER, format, width, height);
      } else if (attachment instanceof WebGLTexture) {
        textures.resizeTexture(gl, attachment, attachmentOptions, width, height);
      } else {
        throw "unknown attachment type";
      }
    });
  }

  /**
   * Binds a framebuffer
   *
   * This function pretty much soley exists because I spent hours
   * trying to figure out why something I wrote wasn't working only
   * to realize I forget to set the viewport dimensions.
   * My hope is this function will fix that.
   *
   * It is effectively the same as
   *
   *     gl.bindFramebuffer(gl.FRAMEBUFFER, someFramebufferInfo.framebuffer);
   *     gl.viewport(0, 0, someFramebufferInfo.width, someFramebufferInfo.height);
   *
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {module:twgl.FramebufferInfo} [framebufferInfo] a framebufferInfo as returned from {@link module:twgl.createFramebuffer}.
   *   If not passed will bind the canvas.
   * @param {number} [target] The target. If not passed `gl.FRAMEBUFFER` will be used.
   * @memberOf module:twgl/framebuffers
   */

  function bindFramebufferInfo(gl, framebufferInfo, target) {
    target = target || gl.FRAMEBUFFER;
    if (framebufferInfo) {
      gl.bindFramebuffer(target, framebufferInfo.framebuffer);
      gl.viewport(0, 0, framebufferInfo.width, framebufferInfo.height);
    } else {
      gl.bindFramebuffer(target, null);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }
  }

  // Using quotes prevents Uglify from changing the names.
  // No speed diff AFAICT.
  return {
    "bindFramebufferInfo": bindFramebufferInfo,
    "createFramebufferInfo": createFramebufferInfo,
    "resizeFramebufferInfo": resizeFramebufferInfo,
  };
});

