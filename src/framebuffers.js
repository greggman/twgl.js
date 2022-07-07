/*
 * Copyright 2019 Gregg Tavares
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

import * as textures from './textures.js';
import * as helper from './helper.js';

/**
 * Framebuffer related functions
 *
 * For backward compatibility they are available at both `twgl.framebuffer` and `twgl`
 * itself
 *
 * See {@link module:twgl} for core functions
 *
 * @module twgl/framebuffers
 */

// make sure we don't see a global gl
const gl = undefined;  /* eslint-disable-line */

const FRAMEBUFFER                    = 0x8d40;
const RENDERBUFFER                   = 0x8d41;
const TEXTURE_2D                     = 0x0de1;

const UNSIGNED_BYTE                  = 0x1401;

/* PixelFormat */
const DEPTH_COMPONENT                = 0x1902;
const RGBA                           = 0x1908;
const DEPTH_COMPONENT24              = 0x81a6;
const DEPTH_COMPONENT32F             = 0x8cac;
const DEPTH24_STENCIL8               = 0x88f0;
const DEPTH32F_STENCIL8              = 0x8cad;

/* Framebuffer Object. */
const RGBA4                          = 0x8056;
const RGB5_A1                        = 0x8057;
const RGB565                         = 0x8D62;
const DEPTH_COMPONENT16              = 0x81A5;
const STENCIL_INDEX                  = 0x1901;
const STENCIL_INDEX8                 = 0x8D48;
const DEPTH_STENCIL                  = 0x84F9;
const COLOR_ATTACHMENT0              = 0x8CE0;
const DEPTH_ATTACHMENT               = 0x8D00;
const STENCIL_ATTACHMENT             = 0x8D20;
const DEPTH_STENCIL_ATTACHMENT       = 0x821A;

/* TextureWrapMode */
const CLAMP_TO_EDGE                  = 0x812F;

/* TextureMagFilter */
const LINEAR                         = 0x2601;

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
 * @property {number} [attachmentPoint] The attachment point. Defaults
 *   to `gl.COLOR_ATTACHMENT0 + ndx` unless type is a depth or stencil type
 *   then it's gl.DEPTH_ATTACHMENT or `gl.DEPTH_STENCIL_ATTACHMENT` depending
 *   on the format or attachment type.
 * @property {number} [format] The format. If one of `gl.RGBA4`,
 *   `gl.RGB565`, `gl.RGB5_A1`, `gl.DEPTH_COMPONENT16`,
 *   `gl.STENCIL_INDEX8` or `gl.DEPTH_STENCIL` then will create a
 *   renderbuffer. Otherwise will create a texture. Default = `gl.RGBA`
 * @property {number} [type] The type. Used for texture. Default = `gl.UNSIGNED_BYTE`.
 * @property {number} [target] The texture target for `gl.framebufferTexture2D`.
 *   Defaults to `gl.TEXTURE_2D`. Set to appropriate face for cube maps.
 * @property {number} [samples] The number of samples. Default = 1
 * @property {number} [level] level for `gl.framebufferTexture2D`. Defaults to 0.
 * @property {number} [layer] layer for `gl.framebufferTextureLayer`. Defaults to undefined.
 *   If set then `gl.framebufferTextureLayer` is called, if not then `gl.framebufferTexture2D`
 * @property {(WebGLRenderbuffer | WebGLTexture)} [attachment] An existing renderbuffer or texture.
 *    If provided will attach this Object. This allows you to share
 *    attachments across framebuffers.
 * @memberOf module:twgl
 * @mixes module:twgl.TextureOptions
 */

const defaultAttachments = [
  { format: RGBA, type: UNSIGNED_BYTE, min: LINEAR, wrap: CLAMP_TO_EDGE, },
  { format: DEPTH_STENCIL, },
];

const attachmentsByFormat = {};
attachmentsByFormat[DEPTH_STENCIL] = DEPTH_STENCIL_ATTACHMENT;
attachmentsByFormat[STENCIL_INDEX] = STENCIL_ATTACHMENT;
attachmentsByFormat[STENCIL_INDEX8] = STENCIL_ATTACHMENT;
attachmentsByFormat[DEPTH_COMPONENT] = DEPTH_ATTACHMENT;
attachmentsByFormat[DEPTH_COMPONENT16] = DEPTH_ATTACHMENT;
attachmentsByFormat[DEPTH_COMPONENT24] = DEPTH_ATTACHMENT;
attachmentsByFormat[DEPTH_COMPONENT32F] = DEPTH_ATTACHMENT;
attachmentsByFormat[DEPTH24_STENCIL8] = DEPTH_STENCIL_ATTACHMENT;
attachmentsByFormat[DEPTH32F_STENCIL8] = DEPTH_STENCIL_ATTACHMENT;

function getAttachmentPointForFormat(format, internalFormat) {
  return attachmentsByFormat[format] || attachmentsByFormat[internalFormat];
}

const renderbufferFormats = {};
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

const MAX_COLOR_ATTACHMENT_POINTS = 32;  // even an 3090 only supports 8 but WebGL/OpenGL ES define constants for 32

function isColorAttachmentPoint(attachmentPoint) {
  return attachmentPoint >= COLOR_ATTACHMENT0 && attachmentPoint < COLOR_ATTACHMENT0 + MAX_COLOR_ATTACHMENT_POINTS;
}

/**
 * @typedef {Object} FramebufferInfo
 * @property {WebGLFramebuffer} framebuffer The WebGLFramebuffer for this framebufferInfo
 * @property {Array.<(WebGLRenderbuffer | WebGLTexture)>} attachments The created attachments in the same order as passed in to {@link module:twgl.createFramebufferInfo}.
 * @property {number} width The width of the framebuffer and its attachments
 * @property {number} height The width of the framebuffer and its attachments
 * @memberOf module:twgl
 */

/**
 * Creates a framebuffer and attachments.
 *
 * This returns a {@link module:twgl.FramebufferInfo} because it needs to return the attachments as well as the framebuffer.
 * It also leaves the framebuffer it just created as the currently bound `FRAMEBUFFER`.
 * Note: If this is WebGL2 or if you called {@link module:twgl.addExtensionsToContext} then it will set the drawBuffers
 * to `[COLOR_ATTACHMENT0, COLOR_ATTACHMENT1, ...]` for how ever many color attachments were created.
 *
 * The simplest usage
 *
 *     // create an RGBA/UNSIGNED_BYTE texture and DEPTH_STENCIL renderbuffer
 *     const fbi = twgl.createFramebufferInfo(gl);
 *
 * More complex usage
 *
 *     // create an RGB565 renderbuffer and a STENCIL_INDEX8 renderbuffer
 *     const attachments = [
 *       { format: RGB565, mag: NEAREST },
 *       { format: STENCIL_INDEX8 },
 *     ]
 *     const fbi = twgl.createFramebufferInfo(gl, attachments);
 *
 * Passing in a specific size
 *
 *     const width = 256;
 *     const height = 256;
 *     const fbi = twgl.createFramebufferInfo(gl, attachments, width, height);
 *
 * **Note!!** It is up to you to check if the framebuffer is renderable by calling `gl.checkFramebufferStatus`.
 * [WebGL1 only guarantees 3 combinations of attachments work](https://www.khronos.org/registry/webgl/specs/latest/1.0/#6.6).
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {module:twgl.AttachmentOptions[]} [attachments] which attachments to create. If not provided the default is a framebuffer with an
 *    `RGBA`, `UNSIGNED_BYTE` texture `COLOR_ATTACHMENT0` and a `DEPTH_STENCIL` renderbuffer `DEPTH_STENCIL_ATTACHMENT`.
 * @param {number} [width] the width for the attachments. Default = size of drawingBuffer
 * @param {number} [height] the height for the attachments. Default = size of drawingBuffer
 * @return {module:twgl.FramebufferInfo} the framebuffer and attachments.
 * @memberOf module:twgl/framebuffers
 */
function createFramebufferInfo(gl, attachments, width, height) {
  const target = FRAMEBUFFER;
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(target, fb);
  width  = width  || gl.drawingBufferWidth;
  height = height || gl.drawingBufferHeight;
  attachments = attachments || defaultAttachments;
  const usedColorAttachmentsPoints = [];
  const framebufferInfo = {
    framebuffer: fb,
    attachments: [],
    width: width,
    height: height,
  };

  attachments.forEach(function(attachmentOptions, i) {
    let attachment = attachmentOptions.attachment;
    const samples = attachmentOptions.samples;
    const format = attachmentOptions.format;
    let attachmentPoint = attachmentOptions.attachmentPoint || getAttachmentPointForFormat(format, attachmentOptions.internalFormat);
    if (!attachmentPoint) {
      attachmentPoint = COLOR_ATTACHMENT0 + i;
    }
    if (isColorAttachmentPoint(attachmentPoint)) {
      usedColorAttachmentsPoints.push(attachmentPoint);
    }
    if (!attachment) {
      if (samples !== undefined || isRenderbufferFormat(format)) {
        attachment = gl.createRenderbuffer();
        gl.bindRenderbuffer(RENDERBUFFER, attachment);
        if (samples > 1) {
          gl.renderbufferStorageMultisample(RENDERBUFFER, samples, format, width, height);
        } else {
          gl.renderbufferStorage(RENDERBUFFER, format, width, height);
        }
      } else {
        const textureOptions = Object.assign({}, attachmentOptions);
        textureOptions.width = width;
        textureOptions.height = height;
        if (textureOptions.auto === undefined) {
          textureOptions.auto = false;
          textureOptions.min = textureOptions.min || textureOptions.minMag || LINEAR;
          textureOptions.mag = textureOptions.mag || textureOptions.minMag || LINEAR;
          textureOptions.wrapS = textureOptions.wrapS || textureOptions.wrap || CLAMP_TO_EDGE;
          textureOptions.wrapT = textureOptions.wrapT || textureOptions.wrap || CLAMP_TO_EDGE;
        }
        attachment = textures.createTexture(gl, textureOptions);
      }
    }
    if (helper.isRenderbuffer(gl, attachment)) {
      gl.framebufferRenderbuffer(target, attachmentPoint, RENDERBUFFER, attachment);
    } else if (helper.isTexture(gl, attachment)) {
      if (attachmentOptions.layer !== undefined) {
        gl.framebufferTextureLayer(
          target,
          attachmentPoint,
          attachment,
          attachmentOptions.level || 0,
          attachmentOptions.layer);
      } else {
        gl.framebufferTexture2D(
            target,
            attachmentPoint,
            attachmentOptions.target || TEXTURE_2D,
            attachment,
            attachmentOptions.level || 0);
      }
    } else {
      throw new Error('unknown attachment type');
    }
    framebufferInfo.attachments.push(attachment);
  });
  if (gl.drawBuffers) {
    gl.drawBuffers(usedColorAttachmentsPoints);
  }
  return framebufferInfo;
}

/**
 * Resizes the attachments of a framebuffer.
 *
 * You need to pass in the same `attachments` as you passed in {@link module:twgl.createFramebufferInfo}
 * because TWGL has no idea the format/type of each attachment.
 *
 * The simplest usage
 *
 *     // create an RGBA/UNSIGNED_BYTE texture and DEPTH_STENCIL renderbuffer
 *     const fbi = twgl.createFramebufferInfo(gl);
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
 *     const attachments = [
 *       { format: RGB565, mag: NEAREST },
 *       { format: STENCIL_INDEX8 },
 *     ]
 *     const fbi = twgl.createFramebufferInfo(gl, attachments);
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
 * @param {module:twgl.FramebufferInfo} framebufferInfo a framebufferInfo as returned from {@link module:twgl.createFramebufferInfo}.
 * @param {module:twgl.AttachmentOptions[]} [attachments] the same attachments options as passed to {@link module:twgl.createFramebufferInfo}.
 * @param {number} [width] the width for the attachments. Default = size of drawingBuffer
 * @param {number} [height] the height for the attachments. Default = size of drawingBuffer
 * @memberOf module:twgl/framebuffers
 */
function resizeFramebufferInfo(gl, framebufferInfo, attachments, width, height) {
  width  = width  || gl.drawingBufferWidth;
  height = height || gl.drawingBufferHeight;
  framebufferInfo.width = width;
  framebufferInfo.height = height;
  attachments = attachments || defaultAttachments;
  attachments.forEach(function(attachmentOptions, ndx) {
    const attachment = framebufferInfo.attachments[ndx];
    const format = attachmentOptions.format;
    const samples = attachmentOptions.samples;
    if (samples !== undefined || helper.isRenderbuffer(gl, attachment)) {
      gl.bindRenderbuffer(RENDERBUFFER, attachment);
      if (samples > 1) {
        gl.renderbufferStorageMultisample(RENDERBUFFER, samples, format, width, height);
      } else {
        gl.renderbufferStorage(RENDERBUFFER, format, width, height);
      }
    } else if (helper.isTexture(gl, attachment)) {
      textures.resizeTexture(gl, attachment, attachmentOptions, width, height);
    } else {
      throw new Error('unknown attachment type');
    }
  });
}

/**
 * Binds a framebuffer
 *
 * This function pretty much solely exists because I spent hours
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
 * @param {module:twgl.FramebufferInfo|null} [framebufferInfo] a framebufferInfo as returned from {@link module:twgl.createFramebufferInfo}.
 *   If falsy will bind the canvas.
 * @param {number} [target] The target. If not passed `gl.FRAMEBUFFER` will be used.
 * @memberOf module:twgl/framebuffers
 */

function bindFramebufferInfo(gl, framebufferInfo, target) {
  target = target || FRAMEBUFFER;
  if (framebufferInfo) {
    gl.bindFramebuffer(target, framebufferInfo.framebuffer);
    gl.viewport(0, 0, framebufferInfo.width, framebufferInfo.height);
  } else {
    gl.bindFramebuffer(target, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  }
}

export {
  bindFramebufferInfo,
  createFramebufferInfo,
  resizeFramebufferInfo,
};


