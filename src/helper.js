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

/* eslint no-console: "off" */

/**
 * Copy named properties
 *
 * @param {string[]} names names of properties to copy
 * @param {object} src object to copy properties from
 * @param {object} dst object to copy properties to
 * @private
 */
function copyNamedProperties(names, src, dst) {
  names.forEach(function(name) {
    const value = src[name];
    if (value !== undefined) {
      dst[name] = value;
    }
  });
}

/**
 * Copies properties from source to dest only if a matching key is in dest
 *
 * @param {Object.<string, ?>} src the source
 * @param {Object.<string, ?>} dst the dest
 * @private
 */
function copyExistingProperties(src, dst) {
  Object.keys(dst).forEach(function(key) {
    if (dst.hasOwnProperty(key) && src.hasOwnProperty(key)) {
      dst[key] = src[key];
    }
  });
}

const error =
    ( typeof console !== 'undefined'
      && console.error
      && typeof console.error === "function"
    )
    ? console.error.bind(console)
    : function() { };

const warn =
    ( typeof console !== 'undefined'
      && console.warn
      && typeof console.warn === "function"
    )
    ? console.warn.bind(console)
    : function() { };

let repBuffer;
function isBuffer(gl, t) {
  if (!repBuffer) {
    repBuffer = gl.createBuffer();
  }
  return t instanceof repBuffer.constructor;
}

let repRenderbuffer;
function isRenderbuffer(gl, t) {
  if (!repRenderbuffer) {
    repRenderbuffer = gl.createRenderbuffer();
  }
  return t instanceof repRenderbuffer.constructor;
}

let repShader;
function isShader(gl, t) {
  if (!repShader) {
    repShader = gl.createShader(gl.VERTEX_SHADER);
  }
  return t instanceof repShader.constructor;
}

let repTexture;
function isTexture(gl, t) {
  if (!repTexture) {
    repTexture = gl.createTexture();
  }
  return t instanceof repTexture.constructor;
}

let repSampler;
function isSampler(gl, t) {
  if (!repSampler) {
    if (gl.createSampler) {
      repSampler = gl.createSampler();
    } else {
      return false;  // it can't be a sampler if this is not WebGL2
    }
  }
  return t instanceof repSampler.constructor;
}

export {
  copyExistingProperties,
  copyNamedProperties,
  error,
  warn,
  isBuffer,
  isRenderbuffer,
  isShader,
  isTexture,
  isSampler,
};

