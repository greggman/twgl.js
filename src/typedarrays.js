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
   * Low level shader typed array related functions
   *
   * You should generally not need to use these functions. They are provided
   * for those cases where you're doing something out of the ordinary
   * and you need lower level access.
   *
   * For backward compatibily they are available at both `twgl.typedArray` and `twgl`
   * itself
   *
   * See {@link module:twgl} for core functions
   *
   * @module twgl/typedArray
   */


  // make sure we don't see a global gl
  var gl = undefined;  // eslint-disable-line

  /* DataType */
  var BYTE                           = 0x1400;
  var UNSIGNED_BYTE                  = 0x1401;
  var SHORT                          = 0x1402;
  var UNSIGNED_SHORT                 = 0x1403;
  var INT                            = 0x1404;
  var UNSIGNED_INT                   = 0x1405;
  var FLOAT                          = 0x1406;

  /**
   * Get the GL type for a typedArray
   * @param {ArrayBuffer|ArrayBufferView} typedArray a typedArray
   * @return {number} the GL type for array. For example pass in an `Int8Array` and `gl.BYTE` will
   *   be returned. Pass in a `Uint32Array` and `gl.UNSIGNED_INT` will be returned
   * @memberOf module:twgl/typedArray
   */
  function getGLTypeForTypedArray(typedArray) {
    if (typedArray instanceof Int8Array)         { return BYTE; }           // eslint-disable-line
    if (typedArray instanceof Uint8Array)        { return UNSIGNED_BYTE; }  // eslint-disable-line
    if (typedArray instanceof Uint8ClampedArray) { return UNSIGNED_BYTE; }  // eslint-disable-line
    if (typedArray instanceof Int16Array)        { return SHORT; }          // eslint-disable-line
    if (typedArray instanceof Uint16Array)       { return UNSIGNED_SHORT; } // eslint-disable-line
    if (typedArray instanceof Int32Array)        { return INT; }            // eslint-disable-line
    if (typedArray instanceof Uint32Array)       { return UNSIGNED_INT; }   // eslint-disable-line
    if (typedArray instanceof Float32Array)      { return FLOAT; }          // eslint-disable-line
    throw "unsupported typed array type";
  }

  /**
   * Get the typed array constructor for a given GL type
   * @param {number} type the GL type. (eg: `gl.UNSIGNED_INT`)
   * @return {function} the constructor for a the corresponding typed array. (eg. `Uint32Array`).
   * @memberOf module:twgl/typedArray
   */
  function getTypedArrayTypeForGLType(type) {
    switch (type) {
      case BYTE:           return Int8Array;     // eslint-disable-line
      case UNSIGNED_BYTE:  return Uint8Array;    // eslint-disable-line
      case SHORT:          return Int16Array;    // eslint-disable-line
      case UNSIGNED_SHORT: return Uint16Array;   // eslint-disable-line
      case INT:            return Int32Array;    // eslint-disable-line
      case UNSIGNED_INT:   return Uint32Array;   // eslint-disable-line
      case FLOAT:          return Float32Array;  // eslint-disable-line
      default:
        throw "unknown gl type";
    }
  }

  function isArrayBuffer(a) {
    return a && a.buffer && a.buffer instanceof ArrayBuffer;
  }

  // Using quotes prevents Uglify from changing the names.
  return {
    "getGLTypeForTypedArray": getGLTypeForTypedArray,
    "getTypedArrayTypeForGLType": getTypedArrayTypeForGLType,
    "isArrayBuffer": isArrayBuffer,
  };
});

