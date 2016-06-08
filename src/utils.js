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

define([], function() {
  "use strict";

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
   * Copy named properties
   *
   * @param {string[]} names names of properties to copy
   * @param {object} src object to copy properties from
   * @param {object} dst object to copy properties to
   */
  function copyNamedProperties(names, src, dst) {
    names.forEach(function(name) {
      var value = src[name];
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

  /**
   * Gets the gl version as a number
   * @param {WebGLRenderingContext} gl A WebGLRenderingContext
   * @return {number} version of gl
   */
  function getVersionAsNumber(gl) {
    return parseFloat(gl.getParameter(gl.VERSION).substr(6));
  }

  /**
   * Check if context is WebGL 2.0
   * @param {WebGLRenderingContext} gl A WebGLRenderingContext
   * @return {bool} true if it's WebGL 2.0
   * @memberOf module:twgl
   */
  function isWebGL2(gl) {
    return gl.getParameter(gl.VERSION).indexOf("WebGL 2.0") === 0;
  }

  /**
   * Check if context is WebGL 1.0
   * @param {WebGLRenderingContext} gl A WebGLRenderingContext
   * @return {bool} true if it's WebGL 1.0
   * @memberOf module:twgl
   */
  function isWebGL1(gl) {
    var version = getVersionAsNumber(gl);
    return version <= 1.0 && version > 0.0;  // because as of 2016/5 Edge returns 0.96
  }

  var error =
      (    window.console
        && window.console.error
        && typeof window.console.error === "function"
      )
      ? window.console.error.bind(window.console)
      : function() { };

  var warn =
      (    window.console
        && window.console.warn
        && typeof window.console.warn === "function"
      )
      ? window.console.warn.bind(window.console)
      : function() { };

  return {
    copyExistingProperties: copyExistingProperties,
    copyNamedProperties: copyNamedProperties,
    shallowCopy: shallowCopy,
    isWebGL1: isWebGL1,
    isWebGL2: isWebGL2,
    error: error,
    warn: warn,
  };
});

