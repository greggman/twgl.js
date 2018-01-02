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

import global from './global-object.js';

/**
 * Copy named properties
 *
 * @param {string[]} names names of properties to copy
 * @param {object} src object to copy properties from
 * @param {object} dst object to copy properties to
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
 */
function copyExistingProperties(src, dst) {
  Object.keys(dst).forEach(function(key) {
    if (dst.hasOwnProperty(key) && src.hasOwnProperty(key)) {
      dst[key] = src[key];
    }
  });
}

const error =
    (    global.console
      && global.console.error
      && typeof global.console.error === "function"
    )
    ? global.console.error.bind(global.console)
    : function() { };

const warn =
    (    global.console
      && global.console.warn
      && typeof global.console.warn === "function"
    )
    ? global.console.warn.bind(global.console)
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

