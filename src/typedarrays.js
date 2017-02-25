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
  const UNSIGNED_SHORT_4_4_4_4       = 0x8033;
  const UNSIGNED_SHORT_5_5_5_1       = 0x8034;
  const UNSIGNED_SHORT_5_6_5         = 0x8363;
  const HALF_FLOAT                   = 0x140B;
  const UNSIGNED_INT_2_10_10_10_REV  = 0x8368;
  const UNSIGNED_INT_10F_11F_11F_REV = 0x8C3B;
  const UNSIGNED_INT_5_9_9_9_REV     = 0x8C3E;
  const FLOAT_32_UNSIGNED_INT_24_8_REV = 0x8DAD;
  const UNSIGNED_INT_24_8            = 0x84FA;

  const glTypeToTypedArray = {};
  {
    const tt = glTypeToTypedArray;
    tt[BYTE]                           = Int8Array;
    tt[UNSIGNED_BYTE]                  = Uint8Array;
    tt[SHORT]                          = Int16Array;
    tt[UNSIGNED_SHORT]                 = Uint16Array;
    tt[INT]                            = Int32Array;
    tt[UNSIGNED_INT]                   = Uint32Array;
    tt[FLOAT]                          = Float32Array;
    tt[UNSIGNED_SHORT_4_4_4_4]         = Uint16Array;
    tt[UNSIGNED_SHORT_5_5_5_1]         = Uint16Array;
    tt[UNSIGNED_SHORT_5_6_5]           = Uint16Array;
    tt[HALF_FLOAT]                     = Uint16Array;
    tt[UNSIGNED_INT_2_10_10_10_REV]    = Uint32Array;
    tt[UNSIGNED_INT_10F_11F_11F_REV]   = Uint32Array;
    tt[UNSIGNED_INT_5_9_9_9_REV]       = Uint32Array;
    tt[FLOAT_32_UNSIGNED_INT_24_8_REV] = Uint32Array;
    tt[UNSIGNED_INT_24_8]              = Uint32Array;
  }

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
   * Get the GL type for a typedArray type
   * @param {ArrayBufferViewType} typedArrayType a typedArray constructor
   * @return {number} the GL type for type. For example pass in `Int8Array` and `gl.BYTE` will
   *   be returned. Pass in `Uint32Array` and `gl.UNSIGNED_INT` will be returned
   * @memberOf module:twgl/typedArray
   */
  function getGLTypeForTypedArrayType(typedArrayType) {
    if (typedArrayType === Int8Array)         { return BYTE; }           // eslint-disable-line
    if (typedArrayType === Uint8Array)        { return UNSIGNED_BYTE; }  // eslint-disable-line
    if (typedArrayType === Uint8ClampedArray) { return UNSIGNED_BYTE; }  // eslint-disable-line
    if (typedArrayType === Int16Array)        { return SHORT; }          // eslint-disable-line
    if (typedArrayType === Uint16Array)       { return UNSIGNED_SHORT; } // eslint-disable-line
    if (typedArrayType === Int32Array)        { return INT; }            // eslint-disable-line
    if (typedArrayType === Uint32Array)       { return UNSIGNED_INT; }   // eslint-disable-line
    if (typedArrayType === Float32Array)      { return FLOAT; }          // eslint-disable-line
    throw "unsupported typed array type";
  }

  /**
   * Get the typed array constructor for a given GL type
   * @param {number} type the GL type. (eg: `gl.UNSIGNED_INT`)
   * @return {function} the constructor for a the corresponding typed array. (eg. `Uint32Array`).
   * @memberOf module:twgl/typedArray
   */
  function getTypedArrayTypeForGLType(type) {
    const CTOR = glTypeToTypedArray[type];
    if (!CTOR) {
      throw "unknown gl type";
    }
    return CTOR;
  }

  function isArrayBuffer(a) {
    return a && a.buffer && a.buffer instanceof ArrayBuffer;
  }

  // Using quotes prevents Uglify from changing the names.
  return {
    "getGLTypeForTypedArray": getGLTypeForTypedArray,
    "getGLTypeForTypedArrayType": getGLTypeForTypedArrayType,
    "getTypedArrayTypeForGLType": getTypedArrayTypeForGLType,
    "isArrayBuffer": isArrayBuffer,
  };
});

