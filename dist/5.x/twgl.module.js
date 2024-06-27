/* @license twgl.js 5.6.0 Copyright (c) 2015, Gregg Tavares All Rights Reserved.
Available via the MIT license.
see: http://github.com/greggman/twgl.js for details */
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

/* DataType */
const BYTE$2                           = 0x1400;
const UNSIGNED_BYTE$3                  = 0x1401;
const SHORT$2                          = 0x1402;
const UNSIGNED_SHORT$3                 = 0x1403;
const INT$3                            = 0x1404;
const UNSIGNED_INT$3                   = 0x1405;
const FLOAT$3                          = 0x1406;
const UNSIGNED_SHORT_4_4_4_4$1       = 0x8033;
const UNSIGNED_SHORT_5_5_5_1$1       = 0x8034;
const UNSIGNED_SHORT_5_6_5$1         = 0x8363;
const HALF_FLOAT$1                   = 0x140B;
const UNSIGNED_INT_2_10_10_10_REV$1  = 0x8368;
const UNSIGNED_INT_10F_11F_11F_REV$1 = 0x8C3B;
const UNSIGNED_INT_5_9_9_9_REV$1     = 0x8C3E;
const FLOAT_32_UNSIGNED_INT_24_8_REV$1 = 0x8DAD;
const UNSIGNED_INT_24_8$1            = 0x84FA;

const glTypeToTypedArray = {};
{
  const tt = glTypeToTypedArray;
  tt[BYTE$2]                           = Int8Array;
  tt[UNSIGNED_BYTE$3]                  = Uint8Array;
  tt[SHORT$2]                          = Int16Array;
  tt[UNSIGNED_SHORT$3]                 = Uint16Array;
  tt[INT$3]                            = Int32Array;
  tt[UNSIGNED_INT$3]                   = Uint32Array;
  tt[FLOAT$3]                          = Float32Array;
  tt[UNSIGNED_SHORT_4_4_4_4$1]         = Uint16Array;
  tt[UNSIGNED_SHORT_5_5_5_1$1]         = Uint16Array;
  tt[UNSIGNED_SHORT_5_6_5$1]           = Uint16Array;
  tt[HALF_FLOAT$1]                     = Uint16Array;
  tt[UNSIGNED_INT_2_10_10_10_REV$1]    = Uint32Array;
  tt[UNSIGNED_INT_10F_11F_11F_REV$1]   = Uint32Array;
  tt[UNSIGNED_INT_5_9_9_9_REV$1]       = Uint32Array;
  tt[FLOAT_32_UNSIGNED_INT_24_8_REV$1] = Uint32Array;
  tt[UNSIGNED_INT_24_8$1]              = Uint32Array;
}

/**
 * Get the GL type for a typedArray
 * @param {ArrayBufferView} typedArray a typedArray
 * @return {number} the GL type for array. For example pass in an `Int8Array` and `gl.BYTE` will
 *   be returned. Pass in a `Uint32Array` and `gl.UNSIGNED_INT` will be returned
 * @memberOf module:twgl/typedArray
 */
function getGLTypeForTypedArray(typedArray) {
  if (typedArray instanceof Int8Array)         { return BYTE$2; }           // eslint-disable-line
  if (typedArray instanceof Uint8Array)        { return UNSIGNED_BYTE$3; }  // eslint-disable-line
  if (typedArray instanceof Uint8ClampedArray) { return UNSIGNED_BYTE$3; }  // eslint-disable-line
  if (typedArray instanceof Int16Array)        { return SHORT$2; }          // eslint-disable-line
  if (typedArray instanceof Uint16Array)       { return UNSIGNED_SHORT$3; } // eslint-disable-line
  if (typedArray instanceof Int32Array)        { return INT$3; }            // eslint-disable-line
  if (typedArray instanceof Uint32Array)       { return UNSIGNED_INT$3; }   // eslint-disable-line
  if (typedArray instanceof Float32Array)      { return FLOAT$3; }          // eslint-disable-line
  throw new Error('unsupported typed array type');
}

/**
 * Get the GL type for a typedArray type
 * @param {ArrayBufferView} typedArrayType a typedArray constructor
 * @return {number} the GL type for type. For example pass in `Int8Array` and `gl.BYTE` will
 *   be returned. Pass in `Uint32Array` and `gl.UNSIGNED_INT` will be returned
 * @memberOf module:twgl/typedArray
 */
function getGLTypeForTypedArrayType(typedArrayType) {
  if (typedArrayType === Int8Array)         { return BYTE$2; }           // eslint-disable-line
  if (typedArrayType === Uint8Array)        { return UNSIGNED_BYTE$3; }  // eslint-disable-line
  if (typedArrayType === Uint8ClampedArray) { return UNSIGNED_BYTE$3; }  // eslint-disable-line
  if (typedArrayType === Int16Array)        { return SHORT$2; }          // eslint-disable-line
  if (typedArrayType === Uint16Array)       { return UNSIGNED_SHORT$3; } // eslint-disable-line
  if (typedArrayType === Int32Array)        { return INT$3; }            // eslint-disable-line
  if (typedArrayType === Uint32Array)       { return UNSIGNED_INT$3; }   // eslint-disable-line
  if (typedArrayType === Float32Array)      { return FLOAT$3; }          // eslint-disable-line
  throw new Error('unsupported typed array type');
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
    throw new Error('unknown gl type');
  }
  return CTOR;
}

const isArrayBuffer$1 = typeof SharedArrayBuffer !== 'undefined'
  ? function isArrayBufferOrSharedArrayBuffer(a) {
    return a && a.buffer && (a.buffer instanceof ArrayBuffer || a.buffer instanceof SharedArrayBuffer);
  }
  : function isArrayBuffer(a) {
    return a && a.buffer && a.buffer instanceof ArrayBuffer;
  };

var typedarrays = /*#__PURE__*/Object.freeze({
  __proto__: null,
  getGLTypeForTypedArray: getGLTypeForTypedArray,
  getGLTypeForTypedArrayType: getGLTypeForTypedArrayType,
  getTypedArrayTypeForGLType: getTypedArrayTypeForGLType,
  isArrayBuffer: isArrayBuffer$1
});

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

/**
 * Copies properties from source to dest only if a matching key is in dest
 *
 * @param {Object.<string, ?>} src the source
 * @param {Object.<string, ?>} dst the dest
 * @private
 */
function copyExistingProperties(src, dst) {
  Object.keys(dst).forEach(function(key) {
    if (dst.hasOwnProperty(key) && src.hasOwnProperty(key)) {  /* eslint no-prototype-builtins: 0 */
      dst[key] = src[key];
    }
  });
}

function error$1(...args) {
  console.error(...args);
}

function warn$1(...args) {
  console.warn(...args);
}

const isTypeWeakMaps = new Map();

function isType(object, type) {
  if (!object || typeof object !== 'object') {
    return false;
  }
  let weakMap = isTypeWeakMaps.get(type);
  if (!weakMap) {
    weakMap = new WeakMap();
    isTypeWeakMaps.set(type, weakMap);
  }
  let isOfType = weakMap.get(object);
  if (isOfType === undefined) {
    const s = Object.prototype.toString.call(object);
    isOfType = s.substring(8, s.length - 1) === type;
    weakMap.set(object, isOfType);
  }
  return isOfType;
}

function isBuffer(gl, t) {
  return typeof WebGLBuffer !== 'undefined' && isType(t, 'WebGLBuffer');
}

function isRenderbuffer(gl, t) {
  return typeof WebGLRenderbuffer !== 'undefined' && isType(t, 'WebGLRenderbuffer');
}

function isTexture(gl, t) {
  return typeof WebGLTexture !== 'undefined' && isType(t, 'WebGLTexture');
}

function isSampler(gl, t) {
  return typeof WebGLSampler !== 'undefined' && isType(t, 'WebGLSampler');
}

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

const STATIC_DRAW                  = 0x88e4;
const ARRAY_BUFFER$1                 = 0x8892;
const ELEMENT_ARRAY_BUFFER$2         = 0x8893;
const BUFFER_SIZE                  = 0x8764;

const BYTE$1                         = 0x1400;
const UNSIGNED_BYTE$2                = 0x1401;
const SHORT$1                        = 0x1402;
const UNSIGNED_SHORT$2               = 0x1403;
const INT$2                          = 0x1404;
const UNSIGNED_INT$2                 = 0x1405;
const FLOAT$2                        = 0x1406;
const defaults$2 = {
  attribPrefix: "",
};

/**
 * Sets the default attrib prefix
 *
 * When writing shaders I prefer to name attributes with `a_`, uniforms with `u_` and varyings with `v_`
 * as it makes it clear where they came from. But, when building geometry I prefer using un-prefixed names.
 *
 * In other words I'll create arrays of geometry like this
 *
 *     var arrays = {
 *       position: ...
 *       normal: ...
 *       texcoord: ...
 *     };
 *
 * But need those mapped to attributes and my attributes start with `a_`.
 *
 * @deprecated see {@link module:twgl.setDefaults}
 * @param {string} prefix prefix for attribs
 * @memberOf module:twgl/attributes
 */
function setAttributePrefix(prefix) {
  defaults$2.attribPrefix = prefix;
}

function setDefaults$2(newDefaults) {
  copyExistingProperties(newDefaults, defaults$2);
}

function setBufferFromTypedArray(gl, type, buffer, array, drawType) {
  gl.bindBuffer(type, buffer);
  gl.bufferData(type, array, drawType || STATIC_DRAW);
}

/**
 * Given typed array creates a WebGLBuffer and copies the typed array
 * into it.
 *
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @param {ArrayBuffer|SharedArrayBuffer|ArrayBufferView|WebGLBuffer} typedArray the typed array. Note: If a WebGLBuffer is passed in it will just be returned. No action will be taken
 * @param {number} [type] the GL bind type for the buffer. Default = `gl.ARRAY_BUFFER`.
 * @param {number} [drawType] the GL draw type for the buffer. Default = 'gl.STATIC_DRAW`.
 * @return {WebGLBuffer} the created WebGLBuffer
 * @memberOf module:twgl/attributes
 */
function createBufferFromTypedArray(gl, typedArray, type, drawType) {
  if (isBuffer(gl, typedArray)) {
    return typedArray;
  }
  type = type || ARRAY_BUFFER$1;
  const buffer = gl.createBuffer();
  setBufferFromTypedArray(gl, type, buffer, typedArray, drawType);
  return buffer;
}

function isIndices(name) {
  return name === "indices";
}

// This is really just a guess. Though I can't really imagine using
// anything else? Maybe for some compression?
function getNormalizationForTypedArrayType(typedArrayType) {
  if (typedArrayType === Int8Array)    { return true; }  // eslint-disable-line
  if (typedArrayType === Uint8Array)   { return true; }  // eslint-disable-line
  return false;
}

function getArray(array) {
  return array.length ? array : array.data;
}

const texcoordRE = /coord|texture/i;
const colorRE = /color|colour/i;

function guessNumComponentsFromName(name, length) {
  let numComponents;
  if (texcoordRE.test(name)) {
    numComponents = 2;
  } else if (colorRE.test(name)) {
    numComponents = 4;
  } else {
    numComponents = 3;  // position, normals, indices ...
  }

  if (length % numComponents > 0) {
    throw new Error(`Can not guess numComponents for attribute '${name}'. Tried ${numComponents} but ${length} values is not evenly divisible by ${numComponents}. You should specify it.`);
  }

  return numComponents;
}

function getNumComponents(array, arrayName, numValues) {
  return array.numComponents || array.size || guessNumComponentsFromName(arrayName, numValues || getArray(array).length);
}

function makeTypedArray(array, name) {
  if (isArrayBuffer$1(array)) {
    return array;
  }

  if (isArrayBuffer$1(array.data)) {
    return array.data;
  }

  if (Array.isArray(array)) {
    array = {
      data: array,
    };
  }

  let Type = array.type ? typedArrayTypeFromGLTypeOrTypedArrayCtor(array.type) : undefined;
  if (!Type) {
    if (isIndices(name)) {
      Type = Uint16Array;
    } else {
      Type = Float32Array;
    }
  }
  return new Type(array.data);
}

function glTypeFromGLTypeOrTypedArrayType(glTypeOrTypedArrayCtor) {
  return typeof glTypeOrTypedArrayCtor === 'number'
      ? glTypeOrTypedArrayCtor
      : glTypeOrTypedArrayCtor ? getGLTypeForTypedArrayType(glTypeOrTypedArrayCtor) : FLOAT$2;
}

function typedArrayTypeFromGLTypeOrTypedArrayCtor(glTypeOrTypedArrayCtor) {
  return typeof glTypeOrTypedArrayCtor === 'number'
      ? getTypedArrayTypeForGLType(glTypeOrTypedArrayCtor)
      : glTypeOrTypedArrayCtor || Float32Array;
}

function attribBufferFromBuffer(gl, array/*, arrayName */) {
  return {
    buffer: array.buffer,
    numValues: 2 * 3 * 4,  // safely divided by 2, 3, 4
    type: glTypeFromGLTypeOrTypedArrayType(array.type),
    arrayType: typedArrayTypeFromGLTypeOrTypedArrayCtor(array.type),
  };
}

function attribBufferFromSize(gl, array/*, arrayName*/) {
  const numValues = array.data || array;
  const arrayType = typedArrayTypeFromGLTypeOrTypedArrayCtor(array.type);
  const numBytes = numValues * arrayType.BYTES_PER_ELEMENT;
  const buffer = gl.createBuffer();
  gl.bindBuffer(ARRAY_BUFFER$1, buffer);
  gl.bufferData(ARRAY_BUFFER$1, numBytes, array.drawType || STATIC_DRAW);
  return {
    buffer,
    numValues,
    type: getGLTypeForTypedArrayType(arrayType),
    arrayType,
  };
}

function attribBufferFromArrayLike(gl, array, arrayName) {
  const typedArray = makeTypedArray(array, arrayName);
  return {
    arrayType: typedArray.constructor,
    buffer: createBufferFromTypedArray(gl, typedArray, undefined, array.drawType),
    type: getGLTypeForTypedArray(typedArray),
    numValues: 0,
  };
}

/**
 * The info for an attribute. This is effectively just the arguments to `gl.vertexAttribPointer` plus the WebGLBuffer
 * for the attribute.
 *
 * @typedef {Object} AttribInfo
 * @property {number[]|ArrayBufferView} [value] a constant value for the attribute. Note: if this is set the attribute will be
 *    disabled and set to this constant value and all other values will be ignored.
 * @property {number} [numComponents] the number of components for this attribute.
 * @property {number} [size] synonym for `numComponents`.
 * @property {number} [type] the type of the attribute (eg. `gl.FLOAT`, `gl.UNSIGNED_BYTE`, etc...) Default = `gl.FLOAT`
 * @property {boolean} [normalize] whether or not to normalize the data. Default = false
 * @property {number} [offset] offset into buffer in bytes. Default = 0
 * @property {number} [stride] the stride in bytes per element. Default = 0
 * @property {number} [divisor] the divisor in instances. Default = 0.
 *    Requires WebGL2 or the ANGLE_instanced_arrays extension.
 *    and, if you're using WebGL1 you must have called {@link module:twgl.addExtensionsToContext}
 * @property {WebGLBuffer} buffer the buffer that contains the data for this attribute
 * @property {number} [drawType] the draw type passed to gl.bufferData. Default = gl.STATIC_DRAW
 * @memberOf module:twgl
 */

/**
 * @typedef {(Int8ArrayConstructor|Uint8ArrayConstructor|Int16ArrayConstructor|Uint16ArrayConstructor|Int32ArrayConstructor|Uint32ArrayConstructor|Float32ArrayConstructor)} TypedArrayConstructor
 */

/**
 * Use this type of array spec when TWGL can't guess the type or number of components of an array
 * @typedef {Object} FullArraySpec
 * @property {number[]|ArrayBufferView} [value] a constant value for the attribute. Note: if this is set the attribute will be
 *    disabled and set to this constant value and all other values will be ignored.
 * @property {(number|number[]|ArrayBufferView)} [data] The data of the array. A number alone becomes the number of elements of type.
 * @property {number} [numComponents] number of components for `vertexAttribPointer`. Default is based on the name of the array.
 *    If `coord` is in the name assumes `numComponents = 2`.
 *    If `color` is in the name assumes `numComponents = 4`.
 *    otherwise assumes `numComponents = 3`
 * @property {number|TypedArrayConstructor} [type] type. This is used if `data` is a JavaScript array, or `buffer` is passed in, or `data` is a number.
 *   It can either be the constructor for a typedarray. (eg. `Uint8Array`) OR a WebGL type, (eg `gl.UNSIGNED_BYTE`).
 *   For example if you want colors in a `Uint8Array` you might have a `FullArraySpec` like `{ type: gl.UNSIGNED_BYTE, data: [255,0,255,255, ...], }`.
 * @property {number} [size] synonym for `numComponents`.
 * @property {boolean} [normalize] normalize for `vertexAttribPointer`. Default is true if type is `Int8Array` or `Uint8Array` otherwise false.
 * @property {number} [stride] stride for `vertexAttribPointer`. Default = 0
 * @property {number} [offset] offset for `vertexAttribPointer`. Default = 0
 * @property {number} [divisor] divisor for `vertexAttribDivisor`. Default = 0.
 *     Requires WebGL2 or the ANGLE_instanced_arrays extension.
 *     and, if you using WebGL1 you must have called {@link module:twgl.addExtensionsToContext}
 * @property {string} [attrib] name of attribute this array maps to. Defaults to same name as array prefixed by the default attribPrefix.
 * @property {string} [name] synonym for `attrib`.
 * @property {string} [attribName] synonym for `attrib`.
 * @property {WebGLBuffer} [buffer] Buffer to use for this attribute. This lets you use your own buffer
 *    but you will need to supply `numComponents` and `type`. You can effectively pass an `AttribInfo`
 *    to provide this. Example:
 *
 *         const bufferInfo1 = twgl.createBufferInfoFromArrays(gl, {
 *           position: [1, 2, 3, ... ],
 *         });
 *         const bufferInfo2 = twgl.createBufferInfoFromArrays(gl, {
 *           position: bufferInfo1.attribs.position,  // use the same buffer from bufferInfo1
 *         });
 *
 * @property {number} [drawType] the draw type passed to gl.bufferData. Default = gl.STATIC_DRAW
 * @memberOf module:twgl
 */

/**
 * An individual array in {@link module:twgl.Arrays}
 *
 * When passed to {@link module:twgl.createBufferInfoFromArrays} if an ArraySpec is `number[]` or `ArrayBufferView`
 * the types will be guessed based on the name. `indices` will be `Uint16Array`, everything else will
 * be `Float32Array`. If an ArraySpec is a number it's the number of floats for an empty (zeroed) buffer.
 *
 * @typedef {(number|number[]|ArrayBufferView|module:twgl.FullArraySpec)} ArraySpec
 * @memberOf module:twgl
 */

/**
 * This is a JavaScript object of arrays by name. The names should match your shader's attributes. If your
 * attributes have a common prefix you can specify it by calling {@link module:twgl.setAttributePrefix}.
 *
 *     Bare JavaScript Arrays
 *
 *         var arrays = {
 *            position: [-1, 1, 0],
 *            normal: [0, 1, 0],
 *            ...
 *         }
 *
 *     Bare TypedArrays
 *
 *         var arrays = {
 *            position: new Float32Array([-1, 1, 0]),
 *            color: new Uint8Array([255, 128, 64, 255]),
 *            ...
 *         }
 *
 * *   Will guess at `numComponents` if not specified based on name.
 *
 *     If `coord` is in the name assumes `numComponents = 2`
 *
 *     If `color` is in the name assumes `numComponents = 4`
 *
 *     otherwise assumes `numComponents = 3`
 *
 * Objects with various fields. See {@link module:twgl.FullArraySpec}.
 *
 *     var arrays = {
 *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
 *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
 *       normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
 *       indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
 *     };
 *
 * @typedef {Object.<string, module:twgl.ArraySpec>} Arrays
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
 *        position: { numComponents: 3, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
 *        texcoord: { numComponents: 2, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
 *        normal:   { numComponents: 3, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
 *        color:    { numComponents: 4, type: gl.UNSIGNED_BYTE, normalize: true,  buffer: WebGLBuffer, },
 *      };
 *
 * notes:
 *
 * *   Arrays can take various forms
 *
 *     Bare JavaScript Arrays
 *
 *         var arrays = {
 *            position: [-1, 1, 0],
 *            normal: [0, 1, 0],
 *            ...
 *         }
 *
 *     Bare TypedArrays
 *
 *         var arrays = {
 *            position: new Float32Array([-1, 1, 0]),
 *            color: new Uint8Array([255, 128, 64, 255]),
 *            ...
 *         }
 *
 * *   Will guess at `numComponents` if not specified based on name.
 *
 *     If `coord` is in the name assumes `numComponents = 2`
 *
 *     If `color` is in the name assumes `numComponents = 4`
 *
 *     otherwise assumes `numComponents = 3`
 *
 * @param {WebGLRenderingContext} gl The webgl rendering context.
 * @param {module:twgl.Arrays} arrays The arrays
 * @param {module:twgl.BufferInfo} [srcBufferInfo] a BufferInfo to copy from
 *   This lets you share buffers. Any arrays you supply will override
 *   the buffers from srcBufferInfo.
 * @return {Object.<string, module:twgl.AttribInfo>} the attribs
 * @memberOf module:twgl/attributes
 */
function createAttribsFromArrays(gl, arrays) {
  const attribs = {};
  Object.keys(arrays).forEach(function(arrayName) {
    if (!isIndices(arrayName)) {
      const array = arrays[arrayName];
      const attribName = array.attrib || array.name || array.attribName || (defaults$2.attribPrefix + arrayName);
      if (array.value) {
        if (!Array.isArray(array.value) && !isArrayBuffer$1(array.value)) {
          throw new Error('array.value is not array or typedarray');
        }
        attribs[attribName] = {
          value: array.value,
        };
      } else {
        let fn;
        if (array.buffer && array.buffer instanceof WebGLBuffer) {
          fn = attribBufferFromBuffer;
        } else if (typeof array === "number" || typeof array.data === "number") {
          fn = attribBufferFromSize;
        } else {
          fn = attribBufferFromArrayLike;
        }
        const {buffer, type, numValues, arrayType} = fn(gl, array, arrayName);
        const normalization = array.normalize !== undefined ? array.normalize : getNormalizationForTypedArrayType(arrayType);
        const numComponents = getNumComponents(array, arrayName, numValues);
        attribs[attribName] = {
          buffer:        buffer,
          numComponents: numComponents,
          type:          type,
          normalize:     normalization,
          stride:        array.stride || 0,
          offset:        array.offset || 0,
          divisor:       array.divisor === undefined ? undefined : array.divisor,
          drawType:      array.drawType,
        };
      }
    }
  });
  gl.bindBuffer(ARRAY_BUFFER$1, null);
  return attribs;
}

/**
 * Sets the contents of a buffer attached to an attribInfo
 *
 * This is helper function to dynamically update a buffer.
 *
 * Let's say you make a bufferInfo
 *
 *     var arrays = {
 *        position: new Float32Array([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]),
 *        texcoord: new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]),
 *        normal:   new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
 *        indices:  new Uint16Array([0, 1, 2, 1, 2, 3]),
 *     };
 *     var bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
 *
 *  And you want to dynamically update the positions. You could do this
 *
 *     // assuming arrays.position has already been updated with new data.
 *     twgl.setAttribInfoBufferFromArray(gl, bufferInfo.attribs.position, arrays.position);
 *
 * @param {WebGLRenderingContext} gl
 * @param {AttribInfo} attribInfo The attribInfo who's buffer contents to set. NOTE: If you have an attribute prefix
 *   the name of the attribute will include the prefix.
 * @param {ArraySpec} array Note: it is arguably inefficient to pass in anything but a typed array because anything
 *    else will have to be converted to a typed array before it can be used by WebGL. During init time that
 *    inefficiency is usually not important but if you're updating data dynamically best to be efficient.
 * @param {number} [offset] an optional offset into the buffer. This is only an offset into the WebGL buffer
 *    not the array. To pass in an offset into the array itself use a typed array and create an `ArrayBufferView`
 *    for the portion of the array you want to use.
 *
 *        var someArray = new Float32Array(1000); // an array with 1000 floats
 *        var someSubArray = new Float32Array(someArray.buffer, offsetInBytes, sizeInUnits); // a view into someArray
 *
 *    Now you can pass `someSubArray` into setAttribInfoBufferFromArray`
 * @memberOf module:twgl/attributes
 */
function setAttribInfoBufferFromArray(gl, attribInfo, array, offset) {
  array = makeTypedArray(array);
  if (offset !== undefined) {
    gl.bindBuffer(ARRAY_BUFFER$1, attribInfo.buffer);
    gl.bufferSubData(ARRAY_BUFFER$1, offset, array);
  } else {
    setBufferFromTypedArray(gl, ARRAY_BUFFER$1, attribInfo.buffer, array, attribInfo.drawType);
  }
}

function getBytesPerValueForGLType(gl, type) {
  if (type === BYTE$1)           return 1;  // eslint-disable-line
  if (type === UNSIGNED_BYTE$2)  return 1;  // eslint-disable-line
  if (type === SHORT$1)          return 2;  // eslint-disable-line
  if (type === UNSIGNED_SHORT$2) return 2;  // eslint-disable-line
  if (type === INT$2)            return 4;  // eslint-disable-line
  if (type === UNSIGNED_INT$2)   return 4;  // eslint-disable-line
  if (type === FLOAT$2)          return 4;  // eslint-disable-line
  return 0;
}

// Tries to get the number of elements from a set of arrays.
const positionKeys = ['position', 'positions', 'a_position'];
function getNumElementsFromNonIndexedArrays(arrays) {
  let key;
  let ii;
  for (ii = 0; ii < positionKeys.length; ++ii) {
    key = positionKeys[ii];
    if (key in arrays) {
      break;
    }
  }
  if (ii === positionKeys.length) {
    key = Object.keys(arrays)[0];
  }
  const array = arrays[key];
  const length = getArray(array).length;
  if (length === undefined) {
    return 1;   // There's no arrays
  }
  const numComponents = getNumComponents(array, key);
  const numElements = length / numComponents;
  if (length % numComponents > 0) {
    throw new Error(`numComponents ${numComponents} not correct for length ${length}`);
  }
  return numElements;
}

function getNumElementsFromAttributes(gl, attribs) {
  let key;
  let ii;
  for (ii = 0; ii < positionKeys.length; ++ii) {
    key = positionKeys[ii];
    if (key in attribs) {
      break;
    }
    key = defaults$2.attribPrefix + key;
    if (key in attribs) {
      break;
    }
  }
  if (ii === positionKeys.length) {
    key = Object.keys(attribs)[0];
  }
  const attrib = attribs[key];
  if (!attrib.buffer) {
    return 1; // There's no buffer
  }
  gl.bindBuffer(ARRAY_BUFFER$1, attrib.buffer);
  const numBytes = gl.getBufferParameter(ARRAY_BUFFER$1, BUFFER_SIZE);
  gl.bindBuffer(ARRAY_BUFFER$1, null);

  const bytesPerValue = getBytesPerValueForGLType(gl, attrib.type);
  const totalElements = numBytes / bytesPerValue;
  const numComponents = attrib.numComponents || attrib.size;
  // TODO: check stride
  const numElements = totalElements / numComponents;
  if (numElements % 1 !== 0) {
    throw new Error(`numComponents ${numComponents} not correct for length ${length}`);
  }
  return numElements;
}

/**
 * @typedef {Object} BufferInfo
 * @property {number} numElements The number of elements to pass to `gl.drawArrays` or `gl.drawElements`.
 * @property {number} [elementType] The type of indices `UNSIGNED_BYTE`, `UNSIGNED_SHORT` etc..
 * @property {WebGLBuffer} [indices] The indices `ELEMENT_ARRAY_BUFFER` if any indices exist.
 * @property {Object.<string, module:twgl.AttribInfo>} [attribs] The attribs appropriate to call `setAttributes`
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
 *         position: { buffer: WebGLBuffer, numComponents: 3, },
 *         normal:   { buffer: WebGLBuffer, numComponents: 3, },
 *         texcoord: { buffer: WebGLBuffer, numComponents: 2, },
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
 *  They can also be TypedArrays
 *
 *     var arrays = {
 *        position: new Float32Array([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]),
 *        texcoord: new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]),
 *        normal:   new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
 *        indices:  new Uint16Array([0, 1, 2, 1, 2, 3]),
 *     };
 *
 *  Or AugmentedTypedArrays
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
 *         position: { numComponents: 3, buffer: gl.createBuffer(), },
 *         texcoord: { numComponents: 2, buffer: gl.createBuffer(), },
 *         normal: { numComponents: 3, buffer: gl.createBuffer(), },
 *       },
 *       indices: gl.createBuffer(),
 *       numElements: 6,
 *     };
 *
 *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.position.buffer);
 *     gl.bufferData(gl.ARRAY_BUFFER, arrays.position, gl.STATIC_DRAW);
 *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.texcoord.buffer);
 *     gl.bufferData(gl.ARRAY_BUFFER, arrays.texcoord, gl.STATIC_DRAW);
 *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.normal.buffer);
 *     gl.bufferData(gl.ARRAY_BUFFER, arrays.normal, gl.STATIC_DRAW);
 *     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indices);
 *     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrays.indices, gl.STATIC_DRAW);
 *
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @param {module:twgl.Arrays} arrays Your data
 * @param {module:twgl.BufferInfo} [srcBufferInfo] An existing
 *        buffer info to start from. WebGLBuffers etc specified
 *        in the srcBufferInfo will be used in a new BufferInfo
 *        with any arrays specified overriding the ones in
 *        srcBufferInfo.
 * @return {module:twgl.BufferInfo} A BufferInfo
 * @memberOf module:twgl/attributes
 */
function createBufferInfoFromArrays(gl, arrays, srcBufferInfo) {
  const newAttribs = createAttribsFromArrays(gl, arrays);
  const bufferInfo = Object.assign({}, srcBufferInfo ? srcBufferInfo : {});
  bufferInfo.attribs = Object.assign({}, srcBufferInfo ? srcBufferInfo.attribs : {}, newAttribs);
  const indices = arrays.indices;
  if (indices) {
    const newIndices = makeTypedArray(indices, "indices");
    bufferInfo.indices = createBufferFromTypedArray(gl, newIndices, ELEMENT_ARRAY_BUFFER$2);
    bufferInfo.numElements = newIndices.length;
    bufferInfo.elementType = getGLTypeForTypedArray(newIndices);
  } else if (!bufferInfo.numElements) {
    bufferInfo.numElements = getNumElementsFromAttributes(gl, bufferInfo.attribs);
  }

  return bufferInfo;
}

/**
 * Creates a buffer from an array, typed array, or array spec
 *
 * Given something like this
 *
 *     [1, 2, 3],
 *
 * or
 *
 *     new Uint16Array([1,2,3]);
 *
 * or
 *
 *     {
 *        data: [1, 2, 3],
 *        type: Uint8Array,
 *     }
 *
 * returns a WebGLBuffer that contains the given data.
 *
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext.
 * @param {module:twgl.ArraySpec} array an array, typed array, or array spec.
 * @param {string} arrayName name of array. Used to guess the type if type can not be derived otherwise.
 * @return {WebGLBuffer} a WebGLBuffer containing the data in array.
 * @memberOf module:twgl/attributes
 */
function createBufferFromArray(gl, array, arrayName) {
  const type = arrayName === "indices" ? ELEMENT_ARRAY_BUFFER$2 : ARRAY_BUFFER$1;
  const typedArray = makeTypedArray(array, arrayName);
  return createBufferFromTypedArray(gl, typedArray, type);
}

/**
 * Creates buffers from arrays or typed arrays
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
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext.
 * @param {module:twgl.Arrays} arrays
 * @return {Object<string, WebGLBuffer>} returns an object with one WebGLBuffer per array
 * @memberOf module:twgl/attributes
 */
function createBuffersFromArrays(gl, arrays) {
  const buffers = { };
  Object.keys(arrays).forEach(function(key) {
    buffers[key] = createBufferFromArray(gl, arrays[key], key);
  });

  // Ugh!
  if (arrays.indices) {
    buffers.numElements = arrays.indices.length;
    buffers.elementType = getGLTypeForTypedArray(makeTypedArray(arrays.indices));
  } else {
    buffers.numElements = getNumElementsFromNonIndexedArrays(arrays);
  }

  return buffers;
}

var attributes = /*#__PURE__*/Object.freeze({
  __proto__: null,
  createAttribsFromArrays: createAttribsFromArrays,
  createBuffersFromArrays: createBuffersFromArrays,
  createBufferFromArray: createBufferFromArray,
  createBufferFromTypedArray: createBufferFromTypedArray,
  createBufferInfoFromArrays: createBufferInfoFromArrays,
  setAttribInfoBufferFromArray: setAttribInfoBufferFromArray,
  setAttributePrefix: setAttributePrefix,
  setAttributeDefaults_: setDefaults$2,
  getNumComponents_: getNumComponents,
  getArray_: getArray
});

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

/**
 * Gets the gl version as a number
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @return {number} version of gl
 * @private
 */
//function getVersionAsNumber(gl) {
//  return parseFloat(gl.getParameter(gl.VERSION).substr(6));
//}

/**
 * Check if context is WebGL 2.0
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @return {bool} true if it's WebGL 2.0
 * @memberOf module:twgl
 */
function isWebGL2(gl) {
  // This is the correct check but it's slow
  //  return gl.getParameter(gl.VERSION).indexOf("WebGL 2.0") === 0;
  // This might also be the correct check but I'm assuming it's slow-ish
  // return gl instanceof WebGL2RenderingContext;
  return !!gl.texStorage2D;
}

/**
 * Check if context is WebGL 1.0
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @return {bool} true if it's WebGL 1.0
 * @memberOf module:twgl
 */
function isWebGL1(gl) {
  // This is the correct check but it's slow
  // const version = getVersionAsNumber(gl);
  // return version <= 1.0 && version > 0.0;  // because as of 2016/5 Edge returns 0.96
  // This might also be the correct check but I'm assuming it's slow-ish
  // return gl instanceof WebGLRenderingContext;
  return !gl.texStorage2D;
}

/**
 * Gets a string for WebGL enum
 *
 * Note: Several enums are the same. Without more
 * context (which function) it's impossible to always
 * give the correct enum. As it is, for matching values
 * it gives all enums. Checking the WebGL2RenderingContext
 * that means
 *
 *      0     = ZERO | POINT | NONE | NO_ERROR
 *      1     = ONE | LINES | SYNC_FLUSH_COMMANDS_BIT
 *      32777 = BLEND_EQUATION_RGB | BLEND_EQUATION_RGB
 *      36662 = COPY_READ_BUFFER | COPY_READ_BUFFER_BINDING
 *      36663 = COPY_WRITE_BUFFER | COPY_WRITE_BUFFER_BINDING
 *      36006 = FRAMEBUFFER_BINDING | DRAW_FRAMEBUFFER_BINDING
 *
 * It's also not useful for bits really unless you pass in individual bits.
 * In other words
 *
 *     const bits = gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT;
 *     twgl.glEnumToString(gl, bits);  // not going to work
 *
 * Note that some enums only exist on extensions. If you
 * want them to show up you need to pass the extension at least
 * once. For example
 *
 *     const ext = gl.getExtension('WEBGL_compressed_texture_s3tc');
 *     if (ext) {
 *        twgl.glEnumToString(ext, 0);  // just prime the function
 *
 *        ..later..
 *
 *        const internalFormat = ext.COMPRESSED_RGB_S3TC_DXT1_EXT;
 *        console.log(twgl.glEnumToString(gl, internalFormat));
 *
 * Notice I didn't have to pass the extension the second time. This means
 * you can have place that generically gets an enum for texture formats for example.
 * and as long as you primed the function with the extensions
 *
 * If you're using `twgl.addExtensionsToContext` to enable your extensions
 * then twgl will automatically get the extension's enums.
 *
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext or any extension object
 * @param {number} value the value of the enum you want to look up.
 * @return {string} enum string or hex value
 * @memberOf module:twgl
 * @function glEnumToString
 */
const glEnumToString = (function() {
  const haveEnumsForType = {};
  const enums = {};

  function addEnums(gl) {
    const type = gl.constructor.name;
    if (!haveEnumsForType[type]) {
      for (const key in gl) {
        if (typeof gl[key] === 'number') {
          const existing = enums[gl[key]];
          enums[gl[key]] = existing ? `${existing} | ${key}` : key;
        }
      }
      haveEnumsForType[type] = true;
    }
  }

  return function glEnumToString(gl, value) {
    addEnums(gl);
    return enums[value] || (typeof value === 'number' ? `0x${value.toString(16)}` : value);
  };
}());

var utils = /*#__PURE__*/Object.freeze({
  __proto__: null,
  glEnumToString: glEnumToString,
  isWebGL1: isWebGL1,
  isWebGL2: isWebGL2
});

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
const defaults$1 = {
  textureColor: new Uint8Array([128, 192, 255, 255]),
  textureOptions: {},
  crossOrigin: undefined,
};
const isArrayBuffer = isArrayBuffer$1;

// Should we make this on demand?
const getShared2DContext = function() {
  let s_ctx;
  return function getShared2DContext() {
    s_ctx = s_ctx ||
        ((typeof document !== 'undefined' && document.createElement)
          ? document.createElement("canvas").getContext("2d")
          : null);
    return s_ctx;
  };
}();

// NOTE: Chrome supports 2D canvas in a Worker (behind flag as of v64 but
//       not only does Firefox NOT support it but Firefox freezes immediately
//       if you try to create one instead of just returning null and continuing.
//  : (global.OffscreenCanvas && (new global.OffscreenCanvas(1, 1)).getContext("2d"));  // OffscreenCanvas may not support 2d

// NOTE: We can maybe remove some of the need for the 2d canvas. In WebGL2
// we can use the various unpack settings. Otherwise we could try using
// the ability of an ImageBitmap to be cut. Unfortunately cutting an ImageBitmap
// is async and the current TWGL code expects a non-Async result though that
// might not be a problem. ImageBitmap though is not available in Edge or Safari
// as of 2018-01-02

/* PixelFormat */
const ALPHA                          = 0x1906;
const RGB                            = 0x1907;
const RGBA$1                           = 0x1908;
const LUMINANCE                      = 0x1909;
const LUMINANCE_ALPHA                = 0x190A;
const DEPTH_COMPONENT$1                = 0x1902;
const DEPTH_STENCIL$1                  = 0x84F9;

/* TextureWrapMode */
// const REPEAT                         = 0x2901;
// const MIRRORED_REPEAT                = 0x8370;
const CLAMP_TO_EDGE$1                  = 0x812f;

/* TextureMagFilter */
const NEAREST                        = 0x2600;
const LINEAR$1                         = 0x2601;

/* TextureMinFilter */
// const NEAREST_MIPMAP_NEAREST         = 0x2700;
// const LINEAR_MIPMAP_NEAREST          = 0x2701;
// const NEAREST_MIPMAP_LINEAR          = 0x2702;
// const LINEAR_MIPMAP_LINEAR           = 0x2703;

/* Texture Target */
const TEXTURE_2D$2                     = 0x0de1;
const TEXTURE_CUBE_MAP$1               = 0x8513;
const TEXTURE_3D$1                     = 0x806f;
const TEXTURE_2D_ARRAY$1               = 0x8c1a;

/* Cubemap Targets */
const TEXTURE_CUBE_MAP_POSITIVE_X    = 0x8515;
const TEXTURE_CUBE_MAP_NEGATIVE_X    = 0x8516;
const TEXTURE_CUBE_MAP_POSITIVE_Y    = 0x8517;
const TEXTURE_CUBE_MAP_NEGATIVE_Y    = 0x8518;
const TEXTURE_CUBE_MAP_POSITIVE_Z    = 0x8519;
const TEXTURE_CUBE_MAP_NEGATIVE_Z    = 0x851a;

/* Texture Parameters */
const TEXTURE_MIN_FILTER             = 0x2801;
const TEXTURE_MAG_FILTER             = 0x2800;
const TEXTURE_WRAP_S                 = 0x2802;
const TEXTURE_WRAP_T                 = 0x2803;
const TEXTURE_WRAP_R                 = 0x8072;
const TEXTURE_MIN_LOD                = 0x813a;
const TEXTURE_MAX_LOD                = 0x813b;
const TEXTURE_BASE_LEVEL             = 0x813c;
const TEXTURE_MAX_LEVEL              = 0x813d;
const TEXTURE_COMPARE_MODE           = 0x884C;
const TEXTURE_COMPARE_FUNC           = 0x884D;

/* Pixel store */
const UNPACK_ALIGNMENT                   = 0x0cf5;
const UNPACK_ROW_LENGTH                  = 0x0cf2;
const UNPACK_IMAGE_HEIGHT                = 0x806e;
const UNPACK_SKIP_PIXELS                 = 0x0cf4;
const UNPACK_SKIP_ROWS                   = 0x0cf3;
const UNPACK_SKIP_IMAGES                 = 0x806d;
const UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243;
const UNPACK_PREMULTIPLY_ALPHA_WEBGL     = 0x9241;
const UNPACK_FLIP_Y_WEBGL                = 0x9240;

const R8                           = 0x8229;
const R8_SNORM                     = 0x8F94;
const R16F                         = 0x822D;
const R32F                         = 0x822E;
const R8UI                         = 0x8232;
const R8I                          = 0x8231;
const RG16UI                       = 0x823A;
const RG16I                        = 0x8239;
const RG32UI                       = 0x823C;
const RG32I                        = 0x823B;
const RG8                          = 0x822B;
const RG8_SNORM                    = 0x8F95;
const RG16F                        = 0x822F;
const RG32F                        = 0x8230;
const RG8UI                        = 0x8238;
const RG8I                         = 0x8237;
const R16UI                        = 0x8234;
const R16I                         = 0x8233;
const R32UI                        = 0x8236;
const R32I                         = 0x8235;
const RGB8                         = 0x8051;
const SRGB8                        = 0x8C41;
const RGB565$1                       = 0x8D62;
const RGB8_SNORM                   = 0x8F96;
const R11F_G11F_B10F               = 0x8C3A;
const RGB9_E5                      = 0x8C3D;
const RGB16F                       = 0x881B;
const RGB32F                       = 0x8815;
const RGB8UI                       = 0x8D7D;
const RGB8I                        = 0x8D8F;
const RGB16UI                      = 0x8D77;
const RGB16I                       = 0x8D89;
const RGB32UI                      = 0x8D71;
const RGB32I                       = 0x8D83;
const RGBA8                        = 0x8058;
const SRGB8_ALPHA8                 = 0x8C43;
const RGBA8_SNORM                  = 0x8F97;
const RGB5_A1$1                      = 0x8057;
const RGBA4$1                        = 0x8056;
const RGB10_A2                     = 0x8059;
const RGBA16F                      = 0x881A;
const RGBA32F                      = 0x8814;
const RGBA8UI                      = 0x8D7C;
const RGBA8I                       = 0x8D8E;
const RGB10_A2UI                   = 0x906F;
const RGBA16UI                     = 0x8D76;
const RGBA16I                      = 0x8D88;
const RGBA32I                      = 0x8D82;
const RGBA32UI                     = 0x8D70;

const DEPTH_COMPONENT16$1            = 0x81A5;
const DEPTH_COMPONENT24$1            = 0x81A6;
const DEPTH_COMPONENT32F$1           = 0x8CAC;
const DEPTH32F_STENCIL8$1            = 0x8CAD;
const DEPTH24_STENCIL8$1             = 0x88F0;

/* DataType */
const BYTE                         = 0x1400;
const UNSIGNED_BYTE$1                = 0x1401;
const SHORT                        = 0x1402;
const UNSIGNED_SHORT$1               = 0x1403;
const INT$1                          = 0x1404;
const UNSIGNED_INT$1                 = 0x1405;
const FLOAT$1                        = 0x1406;
const UNSIGNED_SHORT_4_4_4_4       = 0x8033;
const UNSIGNED_SHORT_5_5_5_1       = 0x8034;
const UNSIGNED_SHORT_5_6_5         = 0x8363;
const HALF_FLOAT                   = 0x140B;
const HALF_FLOAT_OES               = 0x8D61;  // Thanks Khronos for making this different >:(
const UNSIGNED_INT_2_10_10_10_REV  = 0x8368;
const UNSIGNED_INT_10F_11F_11F_REV = 0x8C3B;
const UNSIGNED_INT_5_9_9_9_REV     = 0x8C3E;
const FLOAT_32_UNSIGNED_INT_24_8_REV = 0x8DAD;
const UNSIGNED_INT_24_8            = 0x84FA;

const RG                           = 0x8227;
const RG_INTEGER                   = 0x8228;
const RED                          = 0x1903;
const RED_INTEGER                  = 0x8D94;
const RGB_INTEGER                  = 0x8D98;
const RGBA_INTEGER                 = 0x8D99;

const formatInfo = {};
{
  // NOTE: this is named `numColorComponents` vs `numComponents` so we can let Uglify mangle
  // the name.
  const f = formatInfo;
  f[ALPHA]           = { numColorComponents: 1, };
  f[LUMINANCE]       = { numColorComponents: 1, };
  f[LUMINANCE_ALPHA] = { numColorComponents: 2, };
  f[RGB]             = { numColorComponents: 3, };
  f[RGBA$1]            = { numColorComponents: 4, };
  f[RED]             = { numColorComponents: 1, };
  f[RED_INTEGER]     = { numColorComponents: 1, };
  f[RG]              = { numColorComponents: 2, };
  f[RG_INTEGER]      = { numColorComponents: 2, };
  f[RGB]             = { numColorComponents: 3, };
  f[RGB_INTEGER]     = { numColorComponents: 3, };
  f[RGBA$1]            = { numColorComponents: 4, };
  f[RGBA_INTEGER]    = { numColorComponents: 4, };
  f[DEPTH_COMPONENT$1] = { numColorComponents: 1, };
  f[DEPTH_STENCIL$1]   = { numColorComponents: 2, };
}

/**
 * @typedef {Object} TextureFormatDetails
 * @property {number} textureFormat format to pass texImage2D and similar functions.
 * @property {boolean} colorRenderable true if you can render to this format of texture.
 * @property {boolean} textureFilterable true if you can filter the texture, false if you can ony use `NEAREST`.
 * @property {number[]} type Array of possible types you can pass to texImage2D and similar function
 * @property {Object.<number,number>} bytesPerElementMap A map of types to bytes per element
 * @private
 */

let s_textureInternalFormatInfo;
function getTextureInternalFormatInfo(internalFormat) {
  if (!s_textureInternalFormatInfo) {
    // NOTE: these properties need unique names so we can let Uglify mangle the name.
    const t = {};
    // unsized formats
    t[ALPHA]              = { textureFormat: ALPHA,           colorRenderable: true,  textureFilterable: true,  bytesPerElement: [1, 2, 2, 4],        type: [UNSIGNED_BYTE$1, HALF_FLOAT, HALF_FLOAT_OES, FLOAT$1], };
    t[LUMINANCE]          = { textureFormat: LUMINANCE,       colorRenderable: true,  textureFilterable: true,  bytesPerElement: [1, 2, 2, 4],        type: [UNSIGNED_BYTE$1, HALF_FLOAT, HALF_FLOAT_OES, FLOAT$1], };
    t[LUMINANCE_ALPHA]    = { textureFormat: LUMINANCE_ALPHA, colorRenderable: true,  textureFilterable: true,  bytesPerElement: [2, 4, 4, 8],        type: [UNSIGNED_BYTE$1, HALF_FLOAT, HALF_FLOAT_OES, FLOAT$1], };
    t[RGB]                = { textureFormat: RGB,             colorRenderable: true,  textureFilterable: true,  bytesPerElement: [3, 6, 6, 12, 2],    type: [UNSIGNED_BYTE$1, HALF_FLOAT, HALF_FLOAT_OES, FLOAT$1, UNSIGNED_SHORT_5_6_5], };
    t[RGBA$1]               = { textureFormat: RGBA$1,            colorRenderable: true,  textureFilterable: true,  bytesPerElement: [4, 8, 8, 16, 2, 2], type: [UNSIGNED_BYTE$1, HALF_FLOAT, HALF_FLOAT_OES, FLOAT$1, UNSIGNED_SHORT_4_4_4_4, UNSIGNED_SHORT_5_5_5_1], };
    t[DEPTH_COMPONENT$1]    = { textureFormat: DEPTH_COMPONENT$1, colorRenderable: true,  textureFilterable: false, bytesPerElement: [2, 4],              type: [UNSIGNED_INT$1, UNSIGNED_SHORT$1], };

    // sized formats
    t[R8]                 = { textureFormat: RED,             colorRenderable: true,  textureFilterable: true,  bytesPerElement: [1],        type: [UNSIGNED_BYTE$1], };
    t[R8_SNORM]           = { textureFormat: RED,             colorRenderable: false, textureFilterable: true,  bytesPerElement: [1],        type: [BYTE], };
    t[R16F]               = { textureFormat: RED,             colorRenderable: false, textureFilterable: true,  bytesPerElement: [4, 2],     type: [FLOAT$1, HALF_FLOAT], };
    t[R32F]               = { textureFormat: RED,             colorRenderable: false, textureFilterable: false, bytesPerElement: [4],        type: [FLOAT$1], };
    t[R8UI]               = { textureFormat: RED_INTEGER,     colorRenderable: true,  textureFilterable: false, bytesPerElement: [1],        type: [UNSIGNED_BYTE$1], };
    t[R8I]                = { textureFormat: RED_INTEGER,     colorRenderable: true,  textureFilterable: false, bytesPerElement: [1],        type: [BYTE], };
    t[R16UI]              = { textureFormat: RED_INTEGER,     colorRenderable: true,  textureFilterable: false, bytesPerElement: [2],        type: [UNSIGNED_SHORT$1], };
    t[R16I]               = { textureFormat: RED_INTEGER,     colorRenderable: true,  textureFilterable: false, bytesPerElement: [2],        type: [SHORT], };
    t[R32UI]              = { textureFormat: RED_INTEGER,     colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [UNSIGNED_INT$1], };
    t[R32I]               = { textureFormat: RED_INTEGER,     colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [INT$1], };
    t[RG8]                = { textureFormat: RG,              colorRenderable: true,  textureFilterable: true,  bytesPerElement: [2],        type: [UNSIGNED_BYTE$1], };
    t[RG8_SNORM]          = { textureFormat: RG,              colorRenderable: false, textureFilterable: true,  bytesPerElement: [2],        type: [BYTE], };
    t[RG16F]              = { textureFormat: RG,              colorRenderable: false, textureFilterable: true,  bytesPerElement: [8, 4],     type: [FLOAT$1, HALF_FLOAT], };
    t[RG32F]              = { textureFormat: RG,              colorRenderable: false, textureFilterable: false, bytesPerElement: [8],        type: [FLOAT$1], };
    t[RG8UI]              = { textureFormat: RG_INTEGER,      colorRenderable: true,  textureFilterable: false, bytesPerElement: [2],        type: [UNSIGNED_BYTE$1], };
    t[RG8I]               = { textureFormat: RG_INTEGER,      colorRenderable: true,  textureFilterable: false, bytesPerElement: [2],        type: [BYTE], };
    t[RG16UI]             = { textureFormat: RG_INTEGER,      colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [UNSIGNED_SHORT$1], };
    t[RG16I]              = { textureFormat: RG_INTEGER,      colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [SHORT], };
    t[RG32UI]             = { textureFormat: RG_INTEGER,      colorRenderable: true,  textureFilterable: false, bytesPerElement: [8],        type: [UNSIGNED_INT$1], };
    t[RG32I]              = { textureFormat: RG_INTEGER,      colorRenderable: true,  textureFilterable: false, bytesPerElement: [8],        type: [INT$1], };
    t[RGB8]               = { textureFormat: RGB,             colorRenderable: true,  textureFilterable: true,  bytesPerElement: [3],        type: [UNSIGNED_BYTE$1], };
    t[SRGB8]              = { textureFormat: RGB,             colorRenderable: false, textureFilterable: true,  bytesPerElement: [3],        type: [UNSIGNED_BYTE$1], };
    t[RGB565$1]             = { textureFormat: RGB,             colorRenderable: true,  textureFilterable: true,  bytesPerElement: [3, 2],     type: [UNSIGNED_BYTE$1, UNSIGNED_SHORT_5_6_5], };
    t[RGB8_SNORM]         = { textureFormat: RGB,             colorRenderable: false, textureFilterable: true,  bytesPerElement: [3],        type: [BYTE], };
    t[R11F_G11F_B10F]     = { textureFormat: RGB,             colorRenderable: false, textureFilterable: true,  bytesPerElement: [12, 6, 4], type: [FLOAT$1, HALF_FLOAT, UNSIGNED_INT_10F_11F_11F_REV], };
    t[RGB9_E5]            = { textureFormat: RGB,             colorRenderable: false, textureFilterable: true,  bytesPerElement: [12, 6, 4], type: [FLOAT$1, HALF_FLOAT, UNSIGNED_INT_5_9_9_9_REV], };
    t[RGB16F]             = { textureFormat: RGB,             colorRenderable: false, textureFilterable: true,  bytesPerElement: [12, 6],    type: [FLOAT$1, HALF_FLOAT], };
    t[RGB32F]             = { textureFormat: RGB,             colorRenderable: false, textureFilterable: false, bytesPerElement: [12],       type: [FLOAT$1], };
    t[RGB8UI]             = { textureFormat: RGB_INTEGER,     colorRenderable: false, textureFilterable: false, bytesPerElement: [3],        type: [UNSIGNED_BYTE$1], };
    t[RGB8I]              = { textureFormat: RGB_INTEGER,     colorRenderable: false, textureFilterable: false, bytesPerElement: [3],        type: [BYTE], };
    t[RGB16UI]            = { textureFormat: RGB_INTEGER,     colorRenderable: false, textureFilterable: false, bytesPerElement: [6],        type: [UNSIGNED_SHORT$1], };
    t[RGB16I]             = { textureFormat: RGB_INTEGER,     colorRenderable: false, textureFilterable: false, bytesPerElement: [6],        type: [SHORT], };
    t[RGB32UI]            = { textureFormat: RGB_INTEGER,     colorRenderable: false, textureFilterable: false, bytesPerElement: [12],       type: [UNSIGNED_INT$1], };
    t[RGB32I]             = { textureFormat: RGB_INTEGER,     colorRenderable: false, textureFilterable: false, bytesPerElement: [12],       type: [INT$1], };
    t[RGBA8]              = { textureFormat: RGBA$1,            colorRenderable: true,  textureFilterable: true,  bytesPerElement: [4],        type: [UNSIGNED_BYTE$1], };
    t[SRGB8_ALPHA8]       = { textureFormat: RGBA$1,            colorRenderable: true,  textureFilterable: true,  bytesPerElement: [4],        type: [UNSIGNED_BYTE$1], };
    t[RGBA8_SNORM]        = { textureFormat: RGBA$1,            colorRenderable: false, textureFilterable: true,  bytesPerElement: [4],        type: [BYTE], };
    t[RGB5_A1$1]            = { textureFormat: RGBA$1,            colorRenderable: true,  textureFilterable: true,  bytesPerElement: [4, 2, 4],  type: [UNSIGNED_BYTE$1, UNSIGNED_SHORT_5_5_5_1, UNSIGNED_INT_2_10_10_10_REV], };
    t[RGBA4$1]              = { textureFormat: RGBA$1,            colorRenderable: true,  textureFilterable: true,  bytesPerElement: [4, 2],     type: [UNSIGNED_BYTE$1, UNSIGNED_SHORT_4_4_4_4], };
    t[RGB10_A2]           = { textureFormat: RGBA$1,            colorRenderable: true,  textureFilterable: true,  bytesPerElement: [4],        type: [UNSIGNED_INT_2_10_10_10_REV], };
    t[RGBA16F]            = { textureFormat: RGBA$1,            colorRenderable: false, textureFilterable: true,  bytesPerElement: [16, 8],    type: [FLOAT$1, HALF_FLOAT], };
    t[RGBA32F]            = { textureFormat: RGBA$1,            colorRenderable: false, textureFilterable: false, bytesPerElement: [16],       type: [FLOAT$1], };
    t[RGBA8UI]            = { textureFormat: RGBA_INTEGER,    colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [UNSIGNED_BYTE$1], };
    t[RGBA8I]             = { textureFormat: RGBA_INTEGER,    colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [BYTE], };
    t[RGB10_A2UI]         = { textureFormat: RGBA_INTEGER,    colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [UNSIGNED_INT_2_10_10_10_REV], };
    t[RGBA16UI]           = { textureFormat: RGBA_INTEGER,    colorRenderable: true,  textureFilterable: false, bytesPerElement: [8],        type: [UNSIGNED_SHORT$1], };
    t[RGBA16I]            = { textureFormat: RGBA_INTEGER,    colorRenderable: true,  textureFilterable: false, bytesPerElement: [8],        type: [SHORT], };
    t[RGBA32I]            = { textureFormat: RGBA_INTEGER,    colorRenderable: true,  textureFilterable: false, bytesPerElement: [16],       type: [INT$1], };
    t[RGBA32UI]           = { textureFormat: RGBA_INTEGER,    colorRenderable: true,  textureFilterable: false, bytesPerElement: [16],       type: [UNSIGNED_INT$1], };
    // Sized Internal
    t[DEPTH_COMPONENT16$1]  = { textureFormat: DEPTH_COMPONENT$1, colorRenderable: true,  textureFilterable: false, bytesPerElement: [2, 4],     type: [UNSIGNED_SHORT$1, UNSIGNED_INT$1], };
    t[DEPTH_COMPONENT24$1]  = { textureFormat: DEPTH_COMPONENT$1, colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [UNSIGNED_INT$1], };
    t[DEPTH_COMPONENT32F$1] = { textureFormat: DEPTH_COMPONENT$1, colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [FLOAT$1], };
    t[DEPTH24_STENCIL8$1]   = { textureFormat: DEPTH_STENCIL$1,   colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [UNSIGNED_INT_24_8], };
    t[DEPTH32F_STENCIL8$1]  = { textureFormat: DEPTH_STENCIL$1,   colorRenderable: true,  textureFilterable: false, bytesPerElement: [4],        type: [FLOAT_32_UNSIGNED_INT_24_8_REV], };

    Object.keys(t).forEach(function(internalFormat) {
      const info = t[internalFormat];
      info.bytesPerElementMap = {};
      info.bytesPerElement.forEach(function(bytesPerElement, ndx) {
        const type = info.type[ndx];
        info.bytesPerElementMap[type] = bytesPerElement;
      });
    });
    s_textureInternalFormatInfo = t;
  }
  return s_textureInternalFormatInfo[internalFormat];
}

/**
 * Gets the number of bytes per element for a given internalFormat / type
 * @param {number} internalFormat The internalFormat parameter from texImage2D etc..
 * @param {number} type The type parameter for texImage2D etc..
 * @return {number} the number of bytes per element for the given internalFormat, type combo
 * @memberOf module:twgl/textures
 */
function getBytesPerElementForInternalFormat(internalFormat, type) {
  const info = getTextureInternalFormatInfo(internalFormat);
  if (!info) {
    throw "unknown internal format";
  }
  const bytesPerElement = info.bytesPerElementMap[type];
  if (bytesPerElement === undefined) {
    throw "unknown internal format";
  }
  return bytesPerElement;
}

/**
 * Info related to a specific texture internalFormat as returned
 * from {@link module:twgl/textures.getFormatAndTypeForInternalFormat}.
 *
 * @typedef {Object} TextureFormatInfo
 * @property {number} format Format to pass to texImage2D and related functions
 * @property {number} type Type to pass to texImage2D and related functions
 * @memberOf module:twgl/textures
 */

/**
 * Gets the format and type for a given internalFormat
 *
 * @param {number} internalFormat The internal format
 * @return {module:twgl/textures.TextureFormatInfo} the corresponding format and type,
 * @memberOf module:twgl/textures
 */
function getFormatAndTypeForInternalFormat(internalFormat) {
  const info = getTextureInternalFormatInfo(internalFormat);
  if (!info) {
    throw "unknown internal format";
  }
  return {
    format: info.textureFormat,
    type: info.type[0],
  };
}

/**
 * Returns true if value is power of 2
 * @param {number} value number to check.
 * @return true if value is power of 2
 * @private
 */
function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}

/**
 * Gets whether or not we can generate mips for the given
 * internal format.
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {number} width The width parameter from texImage2D etc..
 * @param {number} height The height parameter from texImage2D etc..
 * @param {number} internalFormat The internalFormat parameter from texImage2D etc..
 * @return {boolean} true if we can generate mips
 * @memberOf module:twgl/textures
 */
function canGenerateMipmap(gl, width, height, internalFormat) {
  if (!isWebGL2(gl)) {
    return isPowerOf2(width) && isPowerOf2(height);
  }
  const info = getTextureInternalFormatInfo(internalFormat);
  if (!info) {
    throw "unknown internal format";
  }
  return info.colorRenderable && info.textureFilterable;
}

/**
 * Gets whether or not we can generate mips for the given format
 * @param {number} internalFormat The internalFormat parameter from texImage2D etc..
 * @return {boolean} true if we can generate mips
 * @memberOf module:twgl/textures
 */
function canFilter(internalFormat) {
  const info = getTextureInternalFormatInfo(internalFormat);
  if (!info) {
    throw "unknown internal format";
  }
  return info.textureFilterable;
}

/**
 * Gets the number of components for a given image format.
 * @param {number} format the format.
 * @return {number} the number of components for the format.
 * @memberOf module:twgl/textures
 */
function getNumComponentsForFormat(format) {
  const info = formatInfo[format];
  if (!info) {
    throw "unknown format: " + format;
  }
  return info.numColorComponents;
}

/**
 * Gets the texture type for a given array type.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @return {number} the gl texture type
 * @private
 */
function getTextureTypeForArrayType(gl, src, defaultType) {
  if (isArrayBuffer(src)) {
    return getGLTypeForTypedArray(src);
  }
  return defaultType || UNSIGNED_BYTE$1;
}

function guessDimensions(gl, target, width, height, numElements) {
  if (numElements % 1 !== 0) {
    throw "can't guess dimensions";
  }
  if (!width && !height) {
    const size = Math.sqrt(numElements / (target === TEXTURE_CUBE_MAP$1 ? 6 : 1));
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
  defaults$1.textureColor = new Uint8Array([color[0] * 255, color[1] * 255, color[2] * 255, color[3] * 255]);
}

function setDefaults$1(newDefaults) {
  copyExistingProperties(newDefaults, defaults$1);
  if (newDefaults.textureColor) {
    setDefaultTextureColor(newDefaults.textureColor);
  }
}

/**
 * A function to generate the source for a texture.
 * @callback TextureFunc
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @param {module:twgl.TextureOptions} options the texture options
 * @return {*} Returns any of the things documented for `src` for {@link module:twgl.TextureOptions}.
 * @memberOf module:twgl
 */

/**
 * Texture options passed to most texture functions. Each function will use whatever options
 * are appropriate for its needs. This lets you pass the same options to all functions.
 *
 * Note: A `TexImageSource` is defined in the WebGL spec as a `HTMLImageElement`, `HTMLVideoElement`,
 * `HTMLCanvasElement`, `ImageBitmap`, or `ImageData`.
 *
 * @typedef {Object} TextureOptions
 * @property {number} [target] the type of texture `gl.TEXTURE_2D` or `gl.TEXTURE_CUBE_MAP`. Defaults to `gl.TEXTURE_2D`.
 * @property {number} [level] the mip level to affect. Defaults to 0. Note, if set auto will be considered false unless explicitly set to true.
 * @property {number} [width] the width of the texture. Only used if src is an array or typed array or null.
 * @property {number} [height] the height of a texture. Only used if src is an array or typed array or null.
 * @property {number} [depth] the depth of a texture. Only used if src is an array or type array or null and target is `TEXTURE_3D` .
 * @property {number} [min] the min filter setting (eg. `gl.LINEAR`). Defaults to `gl.NEAREST_MIPMAP_LINEAR`
 *     or if texture is not a power of 2 on both dimensions then defaults to `gl.LINEAR`.
 * @property {number} [mag] the mag filter setting (eg. `gl.LINEAR`). Defaults to `gl.LINEAR`
 * @property {number} [minMag] both the min and mag filter settings.
 * @property {number} [internalFormat] internal format for texture. Defaults to `gl.RGBA`
 * @property {number} [format] format for texture. Defaults to `gl.RGBA`.
 * @property {number} [type] type for texture. Defaults to `gl.UNSIGNED_BYTE` unless `src` is ArrayBufferView. If `src`
 *     is ArrayBufferView defaults to type that matches ArrayBufferView type.
 * @property {number} [wrap] Texture wrapping for both S and T (and R if TEXTURE_3D or WebGLSampler). Defaults to `gl.REPEAT` for 2D unless src is WebGL1 and src not npot and `gl.CLAMP_TO_EDGE` for cube
 * @property {number} [wrapS] Texture wrapping for S. Defaults to `gl.REPEAT` and `gl.CLAMP_TO_EDGE` for cube. If set takes precedence over `wrap`.
 * @property {number} [wrapT] Texture wrapping for T. Defaults to `gl.REPEAT` and `gl.CLAMP_TO_EDGE` for cube. If set takes precedence over `wrap`.
 * @property {number} [wrapR] Texture wrapping for R. Defaults to `gl.REPEAT` and `gl.CLAMP_TO_EDGE` for cube. If set takes precedence over `wrap`.
 * @property {number} [minLod] TEXTURE_MIN_LOD setting
 * @property {number} [maxLod] TEXTURE_MAX_LOD setting
 * @property {number} [baseLevel] TEXTURE_BASE_LEVEL setting
 * @property {number} [maxLevel] TEXTURE_MAX_LEVEL setting
 * @property {number} [compareFunc] TEXTURE_COMPARE_FUNC setting
 * @property {number} [compareMode] TEXTURE_COMPARE_MODE setting
 * @property {number} [unpackAlignment] The `gl.UNPACK_ALIGNMENT` used when uploading an array. Defaults to 1.
 * @property {number[]|ArrayBufferView} [color] Color to initialize this texture with if loading an image asynchronously.
 *     The default use a blue 1x1 pixel texture. You can set another default by calling `twgl.setDefaults`
 *     or you can set an individual texture's initial color by setting this property. Example: `[1, .5, .5, 1]` = pink
 * @property {number} [premultiplyAlpha] Whether or not to premultiply alpha. Defaults to whatever the current setting is.
 *     This lets you set it once before calling `twgl.createTexture` or `twgl.createTextures` and only override
 *     the current setting for specific textures.
 * @property {number} [flipY] Whether or not to flip the texture vertically on upload. Defaults to whatever the current setting is.
 *     This lets you set it once before calling `twgl.createTexture` or `twgl.createTextures` and only override
 *     the current setting for specific textures.
 * @property {number} [colorspaceConversion] Whether or not to let the browser do colorspace conversion of the texture on upload. Defaults to whatever the current setting is.
 *     This lets you set it once before calling `twgl.createTexture` or `twgl.createTextures` and only override
 *     the current setting for specific textures.
 * @property {boolean} [auto] If `undefined` or `true`, in WebGL1, texture filtering is set automatically for non-power of 2 images and
 *    mips are generated for power of 2 images. In WebGL2 mips are generated if they can be. Note: if `level` is set above
 *    then then `auto` is assumed to be `false` unless explicity set to `true`.
 * @property {number[]} [cubeFaceOrder] The order that cube faces are pulled out of an img or set of images. The default is
 *
 *     [gl.TEXTURE_CUBE_MAP_POSITIVE_X,
 *      gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
 *      gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
 *      gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
 *      gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
 *      gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]
 *
 * @property {(number[]|ArrayBufferView|TexImageSource|TexImageSource[]|string|string[]|module:twgl.TextureFunc)} [src] source for texture
 *
 *    If `string` then it's assumed to be a URL to an image. The image will be downloaded async. A usable
 *    1x1 pixel texture will be returned immediately. The texture will be updated once the image has downloaded.
 *    If `target` is `gl.TEXTURE_CUBE_MAP` will attempt to divide image into 6 square pieces. 1x6, 6x1, 3x2, 2x3.
 *    The pieces will be uploaded in `cubeFaceOrder`
 *
 *    If `string[]` or `TexImageSource[]` and target is `gl.TEXTURE_CUBE_MAP` then it must have 6 entries, one for each face of a cube map.
 *
 *    If `string[]` or `TexImageSource[]` and target is `gl.TEXTURE_2D_ARRAY` then each entry is a slice of the a 2d array texture
 *    and will be scaled to the specified width and height OR to the size of the first image that loads.
 *
 *    If `TexImageSource` then it wil be used immediately to create the contents of the texture. Examples `HTMLImageElement`,
 *    `HTMLCanvasElement`, `HTMLVideoElement`.
 *
 *    If `number[]` or `ArrayBufferView` it's assumed to be data for a texture. If `width` or `height` is
 *    not specified it is guessed as follows. First the number of elements is computed by `src.length / numComponents`
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

/**
 * Sets any packing state that will be set based on the options.
 * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @private
 */
function setPackState(gl, options) {
  if (options.colorspaceConversion !== undefined) {
    gl.pixelStorei(UNPACK_COLORSPACE_CONVERSION_WEBGL, options.colorspaceConversion);
  }
  if (options.premultiplyAlpha !== undefined) {
    gl.pixelStorei(UNPACK_PREMULTIPLY_ALPHA_WEBGL, options.premultiplyAlpha);
  }
  if (options.flipY !== undefined) {
    gl.pixelStorei(UNPACK_FLIP_Y_WEBGL, options.flipY);
  }
}

/**
 * Set skip state to defaults
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @private
 */
function setSkipStateToDefault(gl) {
  gl.pixelStorei(UNPACK_ALIGNMENT, 4);
  if (isWebGL2(gl)) {
    gl.pixelStorei(UNPACK_ROW_LENGTH, 0);
    gl.pixelStorei(UNPACK_IMAGE_HEIGHT, 0);
    gl.pixelStorei(UNPACK_SKIP_PIXELS, 0);
    gl.pixelStorei(UNPACK_SKIP_ROWS, 0);
    gl.pixelStorei(UNPACK_SKIP_IMAGES, 0);
  }
}

/**
 * Sets the parameters of a texture or sampler
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {number|WebGLSampler} target texture target or sampler
 * @param {function()} parameteriFn texParameteri or samplerParameteri fn
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
 *   This is often the same options you passed in when you created the texture.
 * @private
 */
function setTextureSamplerParameters(gl, target, parameteriFn, options) {
  if (options.minMag) {
    parameteriFn.call(gl, target, TEXTURE_MIN_FILTER, options.minMag);
    parameteriFn.call(gl, target, TEXTURE_MAG_FILTER, options.minMag);
  }
  if (options.min) {
    parameteriFn.call(gl, target, TEXTURE_MIN_FILTER, options.min);
  }
  if (options.mag) {
    parameteriFn.call(gl, target, TEXTURE_MAG_FILTER, options.mag);
  }
  if (options.wrap) {
    parameteriFn.call(gl, target, TEXTURE_WRAP_S, options.wrap);
    parameteriFn.call(gl, target, TEXTURE_WRAP_T, options.wrap);
    if (target === TEXTURE_3D$1 || isSampler(gl, target)) {
      parameteriFn.call(gl, target, TEXTURE_WRAP_R, options.wrap);
    }
  }
  if (options.wrapR) {
    parameteriFn.call(gl, target, TEXTURE_WRAP_R, options.wrapR);
  }
  if (options.wrapS) {
    parameteriFn.call(gl, target, TEXTURE_WRAP_S, options.wrapS);
  }
  if (options.wrapT) {
    parameteriFn.call(gl, target, TEXTURE_WRAP_T, options.wrapT);
  }
  if (options.minLod !== undefined) {
    parameteriFn.call(gl, target, TEXTURE_MIN_LOD, options.minLod);
  }
  if (options.maxLod !== undefined) {
    parameteriFn.call(gl, target, TEXTURE_MAX_LOD, options.maxLod);
  }
  if (options.baseLevel !== undefined) {
    parameteriFn.call(gl, target, TEXTURE_BASE_LEVEL, options.baseLevel);
  }
  if (options.maxLevel !== undefined) {
    parameteriFn.call(gl, target, TEXTURE_MAX_LEVEL, options.maxLevel);
  }
  if (options.compareFunc !== undefined) {
    parameteriFn.call(gl, target, TEXTURE_COMPARE_FUNC, options.compareFunc);
  }
  if (options.compareMode !== undefined) {
    parameteriFn.call(gl, target, TEXTURE_COMPARE_MODE, options.compareMode);
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
  const target = options.target || TEXTURE_2D$2;
  gl.bindTexture(target, tex);
  setTextureSamplerParameters(gl, target, gl.texParameteri, options);
}

/**
 * Sets the sampler parameters of a sampler.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLSampler} sampler the WebGLSampler to set parameters for
 * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
 * @memberOf module:twgl/textures
 */
function setSamplerParameters(gl, sampler, options) {
  setTextureSamplerParameters(gl, sampler, gl.samplerParameteri, options);
}

/**
 * Creates a new sampler object and sets parameters.
 *
 * Example:
 *
 *      const sampler = twgl.createSampler(gl, {
 *        minMag: gl.NEAREST,         // sets both TEXTURE_MIN_FILTER and TEXTURE_MAG_FILTER
 *        wrap: gl.CLAMP_TO_NEAREST,  // sets both TEXTURE_WRAP_S and TEXTURE_WRAP_T and TEXTURE_WRAP_R
 *      });
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {Object.<string,module:twgl.TextureOptions>} options A object of TextureOptions one per sampler.
 * @return {Object.<string,WebGLSampler>} the created samplers by name
 * @private
 */
function createSampler(gl, options) {
  const sampler = gl.createSampler();
  setSamplerParameters(gl, sampler, options);
  return sampler;
}

/**
 * Creates a multiple sampler objects and sets parameters on each.
 *
 * Example:
 *
 *      const samplers = twgl.createSamplers(gl, {
 *        nearest: {
 *          minMag: gl.NEAREST,
 *        },
 *        nearestClampS: {
 *          minMag: gl.NEAREST,
 *          wrapS: gl.CLAMP_TO_NEAREST,
 *        },
 *        linear: {
 *          minMag: gl.LINEAR,
 *        },
 *        nearestClamp: {
 *          minMag: gl.NEAREST,
 *          wrap: gl.CLAMP_TO_EDGE,
 *        },
 *        linearClamp: {
 *          minMag: gl.LINEAR,
 *          wrap: gl.CLAMP_TO_EDGE,
 *        },
 *        linearClampT: {
 *          minMag: gl.LINEAR,
 *          wrapT: gl.CLAMP_TO_EDGE,
 *        },
 *      });
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set on the sampler
 * @private
 */
function createSamplers(gl, samplerOptions) {
  const samplers = {};
  Object.keys(samplerOptions).forEach(function(name) {
    samplers[name] = createSampler(gl, samplerOptions[name]);
  });
  return samplers;
}

/**
 * Makes a 1x1 pixel
 * If no color is passed in uses the default color which can be set by calling `setDefaultTextureColor`.
 * @param {(number[]|ArrayBufferView)} [color] The color using 0-1 values
 * @return {Uint8Array} Unit8Array with color.
 * @private
 */
function make1Pixel(color) {
  color = color || defaults$1.textureColor;
  if (isArrayBuffer(color)) {
    return color;
  }
  return new Uint8Array([color[0] * 255, color[1] * 255, color[2] * 255, color[3] * 255]);
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
 * @param {number} [internalFormat] The internalFormat parameter from texImage2D etc..
 * @memberOf module:twgl/textures
 */
function setTextureFilteringForSize(gl, tex, options, width, height, internalFormat) {
  options = options || defaults$1.textureOptions;
  internalFormat = internalFormat || RGBA$1;
  const target = options.target || TEXTURE_2D$2;
  width = width || options.width;
  height = height || options.height;
  gl.bindTexture(target, tex);
  if (canGenerateMipmap(gl, width, height, internalFormat)) {
    gl.generateMipmap(target);
  } else {
    const filtering = canFilter(internalFormat) ? LINEAR$1 : NEAREST;
    gl.texParameteri(target, TEXTURE_MIN_FILTER, filtering);
    gl.texParameteri(target, TEXTURE_MAG_FILTER, filtering);
    gl.texParameteri(target, TEXTURE_WRAP_S, CLAMP_TO_EDGE$1);
    gl.texParameteri(target, TEXTURE_WRAP_T, CLAMP_TO_EDGE$1);
  }
}

function shouldAutomaticallySetTextureFilteringForSize(options) {
  return options.auto === true || (options.auto === undefined && options.level === undefined);
}

/**
 * Gets an array of cubemap face enums
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
 *   This is often the same options you passed in when you created the texture.
 * @return {number[]} cubemap face enums
 * @private
 */
function getCubeFaceOrder(gl, options) {
  options = options || {};
  return options.cubeFaceOrder || [
      TEXTURE_CUBE_MAP_POSITIVE_X,
      TEXTURE_CUBE_MAP_NEGATIVE_X,
      TEXTURE_CUBE_MAP_POSITIVE_Y,
      TEXTURE_CUBE_MAP_NEGATIVE_Y,
      TEXTURE_CUBE_MAP_POSITIVE_Z,
      TEXTURE_CUBE_MAP_NEGATIVE_Z,
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
 * @return {FaceInfo[]} cubemap face infos. Arguably the `face` property of each element is redundant but
 *    it's needed internally to sort the array of `ndx` properties by `face`.
 * @private
 */
function getCubeFacesWithNdx(gl, options) {
  const faces = getCubeFaceOrder(gl, options);
  // work around bug in NVidia drivers. We have to upload the first face first else the driver crashes :(
  const facesWithNdx = faces.map(function(face, ndx) {
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
function setTextureFromElement(gl, tex, element, options) {
  options = options || defaults$1.textureOptions;
  const target = options.target || TEXTURE_2D$2;
  const level = options.level || 0;
  let width = element.width;
  let height = element.height;
  const internalFormat = options.internalFormat || options.format || RGBA$1;
  const formatType = getFormatAndTypeForInternalFormat(internalFormat);
  const format = options.format || formatType.format;
  const type = options.type || formatType.type;
  setPackState(gl, options);
  gl.bindTexture(target, tex);
  if (target === TEXTURE_CUBE_MAP$1) {
    // guess the parts
    const imgWidth  = element.width;
    const imgHeight = element.height;
    let size;
    let slices;
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
    const ctx = getShared2DContext();
    if (ctx) {
      ctx.canvas.width = size;
      ctx.canvas.height = size;
      width = size;
      height = size;
      getCubeFacesWithNdx(gl, options).forEach(function(f) {
        const xOffset = slices[f.ndx * 2 + 0] * size;
        const yOffset = slices[f.ndx * 2 + 1] * size;
        ctx.drawImage(element, xOffset, yOffset, size, size, 0, 0, size, size);
        gl.texImage2D(f.face, level, internalFormat, format, type, ctx.canvas);
      });
      // Free up the canvas memory
      ctx.canvas.width = 1;
      ctx.canvas.height = 1;
    } else if (typeof createImageBitmap !== 'undefined') {
      // NOTE: It seems like we should prefer ImageBitmap because unlike canvas it's
      // note lossy? (alpha is not premultiplied? although I'm not sure what
      width = size;
      height = size;
      getCubeFacesWithNdx(gl, options).forEach(function(f) {
        const xOffset = slices[f.ndx * 2 + 0] * size;
        const yOffset = slices[f.ndx * 2 + 1] * size;
        // We can't easily use a default texture color here as it would have to match
        // the type across all faces where as with a 2D one there's only one face
        // so we're replacing everything all at once. It also has to be the correct size.
        // On the other hand we need all faces to be the same size so as one face loads
        // the rest match else the texture will be un-renderable.
        gl.texImage2D(f.face, level, internalFormat, size, size, 0, format, type, null);
        createImageBitmap(element, xOffset, yOffset, size, size, {
          premultiplyAlpha: 'none',
          colorSpaceConversion: 'none',
        })
        .then(function(imageBitmap) {
          setPackState(gl, options);
          gl.bindTexture(target, tex);
          gl.texImage2D(f.face, level, internalFormat, format, type, imageBitmap);
          if (shouldAutomaticallySetTextureFilteringForSize(options)) {
            setTextureFilteringForSize(gl, tex, options, width, height, internalFormat);
          }
        });
      });
    }
  } else if (target === TEXTURE_3D$1 || target === TEXTURE_2D_ARRAY$1) {
    const smallest = Math.min(element.width, element.height);
    const largest = Math.max(element.width, element.height);
    const depth = largest / smallest;
    if (depth % 1 !== 0) {
      throw "can not compute 3D dimensions of element";
    }
    const xMult = element.width  === largest ? 1 : 0;
    const yMult = element.height === largest ? 1 : 0;
    gl.pixelStorei(UNPACK_ALIGNMENT, 1);
    gl.pixelStorei(UNPACK_ROW_LENGTH, element.width);
    gl.pixelStorei(UNPACK_IMAGE_HEIGHT, 0);
    gl.pixelStorei(UNPACK_SKIP_IMAGES, 0);
    gl.texImage3D(target, level, internalFormat, smallest, smallest, smallest, 0, format, type, null);
    for (let d = 0; d < depth; ++d) {
      const srcX = d * smallest * xMult;
      const srcY = d * smallest * yMult;
      gl.pixelStorei(UNPACK_SKIP_PIXELS, srcX);
      gl.pixelStorei(UNPACK_SKIP_ROWS, srcY);
      gl.texSubImage3D(target, level, 0, 0, d, smallest, smallest, 1, format, type, element);
    }
    setSkipStateToDefault(gl);
  } else {
    gl.texImage2D(target, level, internalFormat, format, type, element);
  }
  if (shouldAutomaticallySetTextureFilteringForSize(options)) {
    setTextureFilteringForSize(gl, tex, options, width, height, internalFormat);
  }
  setTextureParameters(gl, tex, options);
}

function noop() {
}

/**
 * Checks whether the url's origin is the same so that we can set the `crossOrigin`
 * @param {string} url url to image
 * @returns {boolean} true if the window's origin is the same as image's url
 * @private
 */
function urlIsSameOrigin(url) {
  if (typeof document !== 'undefined') {
    // for IE really
    const a = document.createElement('a');
    a.href = url;
    return a.hostname === location.hostname &&
           a.port     === location.port &&
           a.protocol === location.protocol;
  } else {
    const localOrigin = (new URL(location.href)).origin;
    const urlOrigin = (new URL(url, location.href)).origin;
    return urlOrigin === localOrigin;
  }
}

function setToAnonymousIfUndefinedAndURLIsNotSameOrigin(url, crossOrigin) {
  return crossOrigin === undefined && !urlIsSameOrigin(url)
     ? 'anonymous'
     : crossOrigin;
}

/**
 * Loads an image
 * @param {string} url url to image
 * @param {string} crossOrigin
 * @param {function(err, img)} [callback] a callback that's passed an error and the image. The error will be non-null
 *     if there was an error
 * @return {HTMLImageElement} the image being loaded.
 * @private
 */
function loadImage(url, crossOrigin, callback) {
  callback = callback || noop;
  let img;
  crossOrigin = crossOrigin !== undefined ? crossOrigin : defaults$1.crossOrigin;
  crossOrigin = setToAnonymousIfUndefinedAndURLIsNotSameOrigin(url, crossOrigin);
  if (typeof Image !== 'undefined') {
    img = new Image();
    if (crossOrigin !== undefined) {
      img.crossOrigin = crossOrigin;
    }

    const clearEventHandlers = function clearEventHandlers() {
      img.removeEventListener('error', onError);  // eslint-disable-line
      img.removeEventListener('load', onLoad);  // eslint-disable-line
      img = null;
    };

    const onError = function onError() {
      const msg = "couldn't load image: " + url;
      error$1(msg);
      callback(msg, img);
      clearEventHandlers();
    };

    const onLoad = function onLoad() {
      callback(null, img);
      clearEventHandlers();
    };

    img.addEventListener('error', onError);
    img.addEventListener('load', onLoad);
    img.src = url;
    return img;
  } else if (typeof ImageBitmap !== 'undefined') {
    let err;
    let bm;
    const cb = function cb() {
      callback(err, bm);
    };

    const options = {};
    if (crossOrigin) {
      options.mode = 'cors'; // TODO: not sure how to translate image.crossOrigin
    }
    fetch(url, options).then(function(response) {
      if (!response.ok) {
        throw response;
      }
      return response.blob();
    }).then(function(blob) {
      return createImageBitmap(blob, {
        premultiplyAlpha: 'none',
        colorSpaceConversion: 'none',
      });
    }).then(function(bitmap) {
      // not sure if this works. We don't want
      // to catch the user's error. So, call
      // the callback in a timeout so we're
      // not in this scope inside the promise.
      bm = bitmap;
      setTimeout(cb);
    }).catch(function(e) {
      err = e;
      setTimeout(cb);
    });
    img = null;
  }
  return img;
}

/**
 * check if object is a TexImageSource
 *
 * @param {Object} obj Object to test
 * @return {boolean} true if object is a TexImageSource
 * @private
 */
function isTexImageSource(obj) {
  return (typeof ImageBitmap !== 'undefined' && obj instanceof ImageBitmap) ||
         (typeof ImageData !== 'undefined'  && obj instanceof ImageData) ||
         (typeof HTMLElement !== 'undefined'  && obj instanceof HTMLElement);
}

/**
 * if obj is an TexImageSource then just
 * uses it otherwise if obj is a string
 * then load it first.
 *
 * @param {string|TexImageSource} obj
 * @param {string} crossOrigin
 * @param {function(err, img)} [callback] a callback that's passed an error and the image. The error will be non-null
 *     if there was an error
 * @private
 */
function loadAndUseImage(obj, crossOrigin, callback) {
  if (isTexImageSource(obj)) {
    setTimeout(function() {
      callback(null, obj);
    });
    return obj;
  }

  return loadImage(obj, crossOrigin, callback);
}

/**
 * Sets a texture to a 1x1 pixel color. If `options.color === false` is nothing happens. If it's not set
 * the default texture color is used which can be set by calling `setDefaultTextureColor`.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
 *   This is often the same options you passed in when you created the texture.
 * @memberOf module:twgl/textures
 * @private
 */
function setTextureTo1PixelColor(gl, tex, options) {
  options = options || defaults$1.textureOptions;
  const target = options.target || TEXTURE_2D$2;
  gl.bindTexture(target, tex);
  if (options.color === false) {
    return;
  }
  // Assume it's a URL
  // Put 1x1 pixels in texture. That makes it renderable immediately regardless of filtering.
  const color = make1Pixel(options.color);
  if (target === TEXTURE_CUBE_MAP$1) {
    for (let ii = 0; ii < 6; ++ii) {
      gl.texImage2D(TEXTURE_CUBE_MAP_POSITIVE_X + ii, 0, RGBA$1, 1, 1, 0, RGBA$1, UNSIGNED_BYTE$1, color);
    }
  } else if (target === TEXTURE_3D$1 || target === TEXTURE_2D_ARRAY$1) {
    gl.texImage3D(target, 0, RGBA$1, 1, 1, 1, 0, RGBA$1, UNSIGNED_BYTE$1, color);
  } else {
    gl.texImage2D(target, 0, RGBA$1, 1, 1, 0, RGBA$1, UNSIGNED_BYTE$1, color);
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
 * @param {module:twgl.TextureSrc} source image(s) used to as the src for the texture
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
 * A callback for when an image finished downloading and been uploaded into a texture
 * @callback ThreeDReadyCallback
 * @param {*} err If truthy there was an error.
 * @param {WebGLTexture} tex the texture.
 * @param {HTMLImageElement[]} imgs the images for each slice.
 * @memberOf module:twgl
 */

/**
 * Loads a texture from an image from a Url as specified in `options.src`
 * If `options.color !== false` will set the texture to a 1x1 pixel color so that the texture is
 * immediately useable. It will be updated with the contents of the image once the image has finished
 * downloading. Filtering options will be set as appropriate for image unless `options.auto === false`.
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
  options = options || defaults$1.textureOptions;
  setTextureTo1PixelColor(gl, tex, options);
  // Because it's async we need to copy the options.
  options = Object.assign({}, options);
  const img = loadAndUseImage(options.src, options.crossOrigin, function(err, img) {
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
 * Loads a cubemap from 6 urls or TexImageSources as specified in `options.src`. Will set the cubemap to a 1x1 pixel color
 * so that it is usable immediately unless `option.color === false`.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
 * @param {module:twgl.CubemapReadyCallback} [callback] A function to be called when all the images have finished loading. err will
 *    be non null if there was an error.
 * @memberOf module:twgl/textures
 * @private
 */
function loadCubemapFromUrls(gl, tex, options, callback) {
  callback = callback || noop;
  const urls = options.src;
  if (urls.length !== 6) {
    throw "there must be 6 urls for a cubemap";
  }
  const level = options.level || 0;
  const internalFormat = options.internalFormat || options.format || RGBA$1;
  const formatType = getFormatAndTypeForInternalFormat(internalFormat);
  const format = options.format || formatType.format;
  const type = options.type || UNSIGNED_BYTE$1;
  const target = options.target || TEXTURE_2D$2;
  if (target !== TEXTURE_CUBE_MAP$1) {
    throw "target must be TEXTURE_CUBE_MAP";
  }
  setTextureTo1PixelColor(gl, tex, options);
  // Because it's async we need to copy the options.
  options = Object.assign({}, options);
  let numToLoad = 6;
  const errors = [];
  const faces = getCubeFaceOrder(gl, options);
  let imgs;  // eslint-disable-line

  function uploadImg(faceTarget) {
    return function(err, img) {
      --numToLoad;
      if (err) {
        errors.push(err);
      } else {
        if (img.width !== img.height) {
          errors.push("cubemap face img is not a square: " + img.src);
        } else {
          setPackState(gl, options);
          gl.bindTexture(target, tex);

          // So assuming this is the first image we now have one face that's img sized
          // and 5 faces that are 1x1 pixel so size the other faces
          if (numToLoad === 5) {
            // use the default order
            getCubeFaceOrder().forEach(function(otherTarget) {
              // Should we re-use the same face or a color?
              gl.texImage2D(otherTarget, level, internalFormat, format, type, img);
            });
          } else {
            gl.texImage2D(faceTarget, level, internalFormat, format, type, img);
          }

          if (shouldAutomaticallySetTextureFilteringForSize(options)) {
            gl.generateMipmap(target);
          }
        }
      }

      if (numToLoad === 0) {
        callback(errors.length ? errors : undefined, tex, imgs);
      }
    };
  }

  imgs = urls.map(function(url, ndx) {
    return loadAndUseImage(url, options.crossOrigin, uploadImg(faces[ndx]));
  });
}

/**
 * Loads a 2d array or 3d texture from urls OR TexImageSources as specified in `options.src`.
 * Will set the texture to a 1x1 pixel color
 * so that it is usable immediately unless `option.color === false`.
 *
 * If the width and height is not specified the width and height of the first
 * image loaded will be used. Note that since images are loaded async
 * which image downloads first is unknown.
 *
 * If an image is not the same size as the width and height it will be scaled
 * to that width and height.
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
 * @param {module:twgl.ThreeDReadyCallback} [callback] A function to be called when all the images have finished loading. err will
 *    be non null if there was an error.
 * @memberOf module:twgl/textures
 * @private
 */
function loadSlicesFromUrls(gl, tex, options, callback) {
  callback = callback || noop;
  const urls = options.src;
  const internalFormat = options.internalFormat || options.format || RGBA$1;
  const formatType = getFormatAndTypeForInternalFormat(internalFormat);
  const format = options.format || formatType.format;
  const type = options.type || UNSIGNED_BYTE$1;
  const target = options.target || TEXTURE_2D_ARRAY$1;
  if (target !== TEXTURE_3D$1 && target !== TEXTURE_2D_ARRAY$1) {
    throw "target must be TEXTURE_3D or TEXTURE_2D_ARRAY";
  }
  setTextureTo1PixelColor(gl, tex, options);
  // Because it's async we need to copy the options.
  options = Object.assign({}, options);
  let numToLoad = urls.length;
  const errors = [];
  let imgs;  // eslint-disable-line
  const level = options.level || 0;
  let width = options.width;
  let height = options.height;
  const depth = urls.length;
  let firstImage = true;

  function uploadImg(slice) {
    return function(err, img) {
      --numToLoad;
      if (err) {
        errors.push(err);
      } else {
        setPackState(gl, options);
        gl.bindTexture(target, tex);

        if (firstImage) {
          firstImage = false;
          width = options.width || img.width;
          height = options.height || img.height;
          gl.texImage3D(target, level, internalFormat, width, height, depth, 0, format, type, null);

          // put it in every slice otherwise some slices will be 0,0,0,0
          for (let s = 0; s < depth; ++s) {
            gl.texSubImage3D(target, level, 0, 0, s, width, height, 1, format, type, img);
          }
        } else {
          let src = img;
          let ctx;
          if (img.width !== width || img.height !== height) {
            // Size the image to fix
            ctx = getShared2DContext();
            src = ctx.canvas;
            ctx.canvas.width = width;
            ctx.canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
          }

          gl.texSubImage3D(target, level, 0, 0, slice, width, height, 1, format, type, src);

          // free the canvas memory
          if (ctx && src === ctx.canvas) {
            ctx.canvas.width = 0;
            ctx.canvas.height = 0;
          }
        }

        if (shouldAutomaticallySetTextureFilteringForSize(options)) {
          gl.generateMipmap(target);
        }
      }

      if (numToLoad === 0) {
        callback(errors.length ? errors : undefined, tex, imgs);
      }
    };
  }

  imgs = urls.map(function(url, ndx) {
    return loadAndUseImage(url, options.crossOrigin, uploadImg(ndx));
  });
}

/**
 * Sets a texture from an array or typed array. If the width or height is not provided will attempt to
 * guess the size. See {@link module:twgl.TextureOptions}.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {(number[]|ArrayBufferView)} src An array or typed arry with texture data.
 * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
 *   This is often the same options you passed in when you created the texture.
 * @memberOf module:twgl/textures
 */
function setTextureFromArray(gl, tex, src, options) {
  options = options || defaults$1.textureOptions;
  const target = options.target || TEXTURE_2D$2;
  gl.bindTexture(target, tex);
  let width = options.width;
  let height = options.height;
  let depth = options.depth;
  const level = options.level || 0;
  const internalFormat = options.internalFormat || options.format || RGBA$1;
  const formatType = getFormatAndTypeForInternalFormat(internalFormat);
  const format = options.format || formatType.format;
  const type = options.type || getTextureTypeForArrayType(gl, src, formatType.type);
  if (!isArrayBuffer(src)) {
    const Type = getTypedArrayTypeForGLType(type);
    src = new Type(src);
  } else if (src instanceof Uint8ClampedArray) {
    src = new Uint8Array(src.buffer);
  }

  const bytesPerElement = getBytesPerElementForInternalFormat(internalFormat, type);
  const numElements = src.byteLength / bytesPerElement;  // TODO: check UNPACK_ALIGNMENT?
  if (numElements % 1) {
    throw "length wrong size for format: " + glEnumToString(gl, format);
  }
  let dimensions;
  if (target === TEXTURE_3D$1 || target === TEXTURE_2D_ARRAY$1) {
    if (!width && !height && !depth) {
      const size = Math.cbrt(numElements);
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
  setSkipStateToDefault(gl);
  gl.pixelStorei(UNPACK_ALIGNMENT, options.unpackAlignment || 1);
  setPackState(gl, options);
  if (target === TEXTURE_CUBE_MAP$1) {
    const elementsPerElement = bytesPerElement / src.BYTES_PER_ELEMENT;
    const faceSize = numElements / 6 * elementsPerElement;

    getCubeFacesWithNdx(gl, options).forEach(f => {
      const offset = faceSize * f.ndx;
      const data = src.subarray(offset, offset + faceSize);
      gl.texImage2D(f.face, level, internalFormat, width, height, 0, format, type, data);
    });
  } else if (target === TEXTURE_3D$1 || target === TEXTURE_2D_ARRAY$1) {
    gl.texImage3D(target, level, internalFormat, width, height, depth, 0, format, type, src);
  } else {
    gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, src);
  }
  return {
    width: width,
    height: height,
    depth: depth,
    type: type,
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
  const target = options.target || TEXTURE_2D$2;
  gl.bindTexture(target, tex);
  const level = options.level || 0;
  const internalFormat = options.internalFormat || options.format || RGBA$1;
  const formatType = getFormatAndTypeForInternalFormat(internalFormat);
  const format = options.format || formatType.format;
  const type = options.type || formatType.type;
  setPackState(gl, options);
  if (target === TEXTURE_CUBE_MAP$1) {
    for (let ii = 0; ii < 6; ++ii) {
      gl.texImage2D(TEXTURE_CUBE_MAP_POSITIVE_X + ii, level, internalFormat, options.width, options.height, 0, format, type, null);
    }
  } else if (target === TEXTURE_3D$1 || target === TEXTURE_2D_ARRAY$1) {
    gl.texImage3D(target, level, internalFormat, options.width, options.height, options.depth, 0, format, type, null);
  } else {
    gl.texImage2D(target, level, internalFormat, options.width, options.height, 0, format, type, null);
  }
}

/**
 * Creates a texture based on the options passed in.
 *
 * Note: may reset UNPACK_ALIGNMENT, UNPACK_ROW_LENGTH, UNPACK_IMAGE_HEIGHT, UNPACK_SKIP_IMAGES
 * UNPACK_SKIP_PIXELS, and UNPACK_SKIP_ROWS
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
 * @param {module:twgl.TextureReadyCallback} [callback] A callback called when an image has been downloaded and uploaded to the texture.
 * @return {WebGLTexture} the created texture.
 * @memberOf module:twgl/textures
 */
function createTexture(gl, options, callback) {
  callback = callback || noop;
  options = options || defaults$1.textureOptions;
  const tex = gl.createTexture();
  const target = options.target || TEXTURE_2D$2;
  let width  = options.width  || 1;
  let height = options.height || 1;
  const internalFormat = options.internalFormat || RGBA$1;
  gl.bindTexture(target, tex);
  if (target === TEXTURE_CUBE_MAP$1) {
    // this should have been the default for cubemaps :(
    gl.texParameteri(target, TEXTURE_WRAP_S, CLAMP_TO_EDGE$1);
    gl.texParameteri(target, TEXTURE_WRAP_T, CLAMP_TO_EDGE$1);
  }
  let src = options.src;
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
      const dimensions = setTextureFromArray(gl, tex, src, options);
      width  = dimensions.width;
      height = dimensions.height;
    } else if (Array.isArray(src) && (typeof (src[0]) === 'string' || isTexImageSource(src[0]))) {
      if (target === TEXTURE_CUBE_MAP$1) {
        loadCubemapFromUrls(gl, tex, options, callback);
      } else {
        loadSlicesFromUrls(gl, tex, options, callback);
      }
    } else { // if (isTexImageSource(src))
      setTextureFromElement(gl, tex, src, options);
      width  = src.width;
      height = src.height;
    }
  } else {
    setEmptyTexture(gl, tex, options);
  }
  if (shouldAutomaticallySetTextureFilteringForSize(options)) {
    setTextureFilteringForSize(gl, tex, options, width, height, internalFormat);
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
 * @param {number} [depth] the new depth. If not passed in will use `options.depth`
 * @memberOf module:twgl/textures
 */
function resizeTexture(gl, tex, options, width, height, depth) {
  width = width || options.width;
  height = height || options.height;
  depth = depth || options.depth;
  const target = options.target || TEXTURE_2D$2;
  gl.bindTexture(target, tex);
  const level = options.level || 0;
  const internalFormat = options.internalFormat || options.format || RGBA$1;
  const formatType = getFormatAndTypeForInternalFormat(internalFormat);
  const format = options.format || formatType.format;
  let type;
  const src = options.src;
  if (!src) {
    type = options.type || formatType.type;
  } else if (isArrayBuffer(src) || (Array.isArray(src) && typeof (src[0]) === 'number')) {
    type = options.type || getTextureTypeForArrayType(gl, src, formatType.type);
  } else {
    type = options.type || formatType.type;
  }
  if (target === TEXTURE_CUBE_MAP$1) {
    for (let ii = 0; ii < 6; ++ii) {
      gl.texImage2D(TEXTURE_CUBE_MAP_POSITIVE_X + ii, level, internalFormat, width, height, 0, format, type, null);
    }
  } else if (target === TEXTURE_3D$1 || target === TEXTURE_2D_ARRAY$1) {
    gl.texImage3D(target, level, internalFormat, width, height, depth, 0, format, type, null);
  } else {
    gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);
  }
}

/**
 * Check if a src is an async request.
 * if src is a string we're going to download an image
 * if src is an array of strings we're going to download cubemap images
 * @param {*} src The src from a TextureOptions
 * @returns {bool} true if src is async.
 * @private
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
 *     const textures = twgl.createTextures(gl, {
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
  let numDownloading = 0;
  const errors = [];
  const textures = {};
  const images = {};

  function callCallbackIfReady() {
    if (numDownloading === 0) {
      setTimeout(function() {
        callback(errors.length ? errors : undefined, textures, images);
      }, 0);
    }
  }

  Object.keys(textureOptions).forEach(function(name) {
    const options = textureOptions[name];
    let onLoadFn;
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

var textures = /*#__PURE__*/Object.freeze({
  __proto__: null,
  setTextureDefaults_: setDefaults$1,
  createSampler: createSampler,
  createSamplers: createSamplers,
  setSamplerParameters: setSamplerParameters,
  createTexture: createTexture,
  setEmptyTexture: setEmptyTexture,
  setTextureFromArray: setTextureFromArray,
  loadTextureFromUrl: loadTextureFromUrl,
  setTextureFromElement: setTextureFromElement,
  setTextureFilteringForSize: setTextureFilteringForSize,
  setTextureParameters: setTextureParameters,
  setDefaultTextureColor: setDefaultTextureColor,
  createTextures: createTextures,
  resizeTexture: resizeTexture,
  canGenerateMipmap: canGenerateMipmap,
  canFilter: canFilter,
  getNumComponentsForFormat: getNumComponentsForFormat,
  getBytesPerElementForInternalFormat: getBytesPerElementForInternalFormat,
  getFormatAndTypeForInternalFormat: getFormatAndTypeForInternalFormat
});

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

/**
 * Low level shader program related functions
 *
 * You should generally not need to use these functions. They are provided
 * for those cases where you're doing something out of the ordinary
 * and you need lower level access.
 *
 * For backward compatibility they are available at both `twgl.programs` and `twgl`
 * itself
 *
 * See {@link module:twgl} for core functions
 *
 * @module twgl/programs
 */

const error = error$1;
const warn = warn$1;
function getElementById(id) {
  return (typeof document !== 'undefined' && document.getElementById)
      ? document.getElementById(id)
      : null;
}

const TEXTURE0                       = 0x84c0;
const DYNAMIC_DRAW                   = 0x88e8;

const ARRAY_BUFFER                   = 0x8892;
const ELEMENT_ARRAY_BUFFER$1           = 0x8893;
const UNIFORM_BUFFER                 = 0x8a11;
const TRANSFORM_FEEDBACK_BUFFER      = 0x8c8e;

const TRANSFORM_FEEDBACK             = 0x8e22;

const COMPILE_STATUS                 = 0x8b81;
const LINK_STATUS                    = 0x8b82;
const FRAGMENT_SHADER                = 0x8b30;
const VERTEX_SHADER                  = 0x8b31;
const SEPARATE_ATTRIBS               = 0x8c8d;

const ACTIVE_UNIFORMS                = 0x8b86;
const ACTIVE_ATTRIBUTES              = 0x8b89;
const TRANSFORM_FEEDBACK_VARYINGS    = 0x8c83;
const ACTIVE_UNIFORM_BLOCKS          = 0x8a36;
const UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER   = 0x8a44;
const UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER = 0x8a46;
const UNIFORM_BLOCK_DATA_SIZE                     = 0x8a40;
const UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES        = 0x8a43;

const FLOAT                         = 0x1406;
const FLOAT_VEC2                    = 0x8B50;
const FLOAT_VEC3                    = 0x8B51;
const FLOAT_VEC4                    = 0x8B52;
const INT                           = 0x1404;
const INT_VEC2                      = 0x8B53;
const INT_VEC3                      = 0x8B54;
const INT_VEC4                      = 0x8B55;
const BOOL                          = 0x8B56;
const BOOL_VEC2                     = 0x8B57;
const BOOL_VEC3                     = 0x8B58;
const BOOL_VEC4                     = 0x8B59;
const FLOAT_MAT2                    = 0x8B5A;
const FLOAT_MAT3                    = 0x8B5B;
const FLOAT_MAT4                    = 0x8B5C;
const SAMPLER_2D                    = 0x8B5E;
const SAMPLER_CUBE                  = 0x8B60;
const SAMPLER_3D                    = 0x8B5F;
const SAMPLER_2D_SHADOW             = 0x8B62;
const FLOAT_MAT2x3                  = 0x8B65;
const FLOAT_MAT2x4                  = 0x8B66;
const FLOAT_MAT3x2                  = 0x8B67;
const FLOAT_MAT3x4                  = 0x8B68;
const FLOAT_MAT4x2                  = 0x8B69;
const FLOAT_MAT4x3                  = 0x8B6A;
const SAMPLER_2D_ARRAY              = 0x8DC1;
const SAMPLER_2D_ARRAY_SHADOW       = 0x8DC4;
const SAMPLER_CUBE_SHADOW           = 0x8DC5;
const UNSIGNED_INT                  = 0x1405;
const UNSIGNED_INT_VEC2             = 0x8DC6;
const UNSIGNED_INT_VEC3             = 0x8DC7;
const UNSIGNED_INT_VEC4             = 0x8DC8;
const INT_SAMPLER_2D                = 0x8DCA;
const INT_SAMPLER_3D                = 0x8DCB;
const INT_SAMPLER_CUBE              = 0x8DCC;
const INT_SAMPLER_2D_ARRAY          = 0x8DCF;
const UNSIGNED_INT_SAMPLER_2D       = 0x8DD2;
const UNSIGNED_INT_SAMPLER_3D       = 0x8DD3;
const UNSIGNED_INT_SAMPLER_CUBE     = 0x8DD4;
const UNSIGNED_INT_SAMPLER_2D_ARRAY = 0x8DD7;

const TEXTURE_2D$1                    = 0x0DE1;
const TEXTURE_CUBE_MAP              = 0x8513;
const TEXTURE_3D                    = 0x806F;
const TEXTURE_2D_ARRAY              = 0x8C1A;

const typeMap = {};

/**
 * Returns the corresponding bind point for a given sampler type
 * @private
 */
function getBindPointForSamplerType(gl, type) {
  return typeMap[type].bindPoint;
}

// This kind of sucks! If you could compose functions as in `var fn = gl[name];`
// this code could be a lot smaller but that is sadly really slow (T_T)

function floatSetter(gl, location) {
  return function(v) {
    gl.uniform1f(location, v);
  };
}

function floatArraySetter(gl, location) {
  return function(v) {
    gl.uniform1fv(location, v);
  };
}

function floatVec2Setter(gl, location) {
  return function(v) {
    gl.uniform2fv(location, v);
  };
}

function floatVec3Setter(gl, location) {
  return function(v) {
    gl.uniform3fv(location, v);
  };
}

function floatVec4Setter(gl, location) {
  return function(v) {
    gl.uniform4fv(location, v);
  };
}

function intSetter(gl, location) {
  return function(v) {
    gl.uniform1i(location, v);
  };
}

function intArraySetter(gl, location) {
  return function(v) {
    gl.uniform1iv(location, v);
  };
}

function intVec2Setter(gl, location) {
  return function(v) {
    gl.uniform2iv(location, v);
  };
}

function intVec3Setter(gl, location) {
  return function(v) {
    gl.uniform3iv(location, v);
  };
}

function intVec4Setter(gl, location) {
  return function(v) {
    gl.uniform4iv(location, v);
  };
}

function uintSetter(gl, location) {
  return function(v) {
    gl.uniform1ui(location, v);
  };
}

function uintArraySetter(gl, location) {
  return function(v) {
    gl.uniform1uiv(location, v);
  };
}

function uintVec2Setter(gl, location) {
  return function(v) {
    gl.uniform2uiv(location, v);
  };
}

function uintVec3Setter(gl, location) {
  return function(v) {
    gl.uniform3uiv(location, v);
  };
}

function uintVec4Setter(gl, location) {
  return function(v) {
    gl.uniform4uiv(location, v);
  };
}

function floatMat2Setter(gl, location) {
  return function(v) {
    gl.uniformMatrix2fv(location, false, v);
  };
}

function floatMat3Setter(gl, location) {
  return function(v) {
    gl.uniformMatrix3fv(location, false, v);
  };
}

function floatMat4Setter(gl, location) {
  return function(v) {
    gl.uniformMatrix4fv(location, false, v);
  };
}

function floatMat23Setter(gl, location) {
  return function(v) {
    gl.uniformMatrix2x3fv(location, false, v);
  };
}

function floatMat32Setter(gl, location) {
  return function(v) {
    gl.uniformMatrix3x2fv(location, false, v);
  };
}

function floatMat24Setter(gl, location) {
  return function(v) {
    gl.uniformMatrix2x4fv(location, false, v);
  };
}

function floatMat42Setter(gl, location) {
  return function(v) {
    gl.uniformMatrix4x2fv(location, false, v);
  };
}

function floatMat34Setter(gl, location) {
  return function(v) {
    gl.uniformMatrix3x4fv(location, false, v);
  };
}

function floatMat43Setter(gl, location) {
  return function(v) {
    gl.uniformMatrix4x3fv(location, false, v);
  };
}

function samplerSetter(gl, type, unit, location) {
  const bindPoint = getBindPointForSamplerType(gl, type);
  return isWebGL2(gl) ? function(textureOrPair) {
    let texture;
    let sampler;
    if (!textureOrPair || isTexture(gl, textureOrPair)) {
      texture = textureOrPair;
      sampler = null;
    } else {
      texture = textureOrPair.texture;
      sampler = textureOrPair.sampler;
    }
    gl.uniform1i(location, unit);
    gl.activeTexture(TEXTURE0 + unit);
    gl.bindTexture(bindPoint, texture);
    gl.bindSampler(unit, sampler);
  } : function(texture) {
    gl.uniform1i(location, unit);
    gl.activeTexture(TEXTURE0 + unit);
    gl.bindTexture(bindPoint, texture);
  };
}

function samplerArraySetter(gl, type, unit, location, size) {
  const bindPoint = getBindPointForSamplerType(gl, type);
  const units = new Int32Array(size);
  for (let ii = 0; ii < size; ++ii) {
    units[ii] = unit + ii;
  }

  return isWebGL2(gl) ? function(textures) {
    gl.uniform1iv(location, units);
    textures.forEach(function(textureOrPair, index) {
      gl.activeTexture(TEXTURE0 + units[index]);
      let texture;
      let sampler;
      if (!textureOrPair || isTexture(gl, textureOrPair)) {
        texture = textureOrPair;
        sampler = null;
      } else {
        texture = textureOrPair.texture;
        sampler = textureOrPair.sampler;
      }
      gl.bindSampler(unit, sampler);
      gl.bindTexture(bindPoint, texture);
    });
  } : function(textures) {
    gl.uniform1iv(location, units);
    textures.forEach(function(texture, index) {
      gl.activeTexture(TEXTURE0 + units[index]);
      gl.bindTexture(bindPoint, texture);
    });
  };
}

typeMap[FLOAT]                         = { Type: Float32Array, size:  4, setter: floatSetter,      arraySetter: floatArraySetter, };
typeMap[FLOAT_VEC2]                    = { Type: Float32Array, size:  8, setter: floatVec2Setter,  cols: 2, };
typeMap[FLOAT_VEC3]                    = { Type: Float32Array, size: 12, setter: floatVec3Setter,  cols: 3, };
typeMap[FLOAT_VEC4]                    = { Type: Float32Array, size: 16, setter: floatVec4Setter,  cols: 4, };
typeMap[INT]                           = { Type: Int32Array,   size:  4, setter: intSetter,        arraySetter: intArraySetter, };
typeMap[INT_VEC2]                      = { Type: Int32Array,   size:  8, setter: intVec2Setter,    cols: 2, };
typeMap[INT_VEC3]                      = { Type: Int32Array,   size: 12, setter: intVec3Setter,    cols: 3, };
typeMap[INT_VEC4]                      = { Type: Int32Array,   size: 16, setter: intVec4Setter,    cols: 4, };
typeMap[UNSIGNED_INT]                  = { Type: Uint32Array,  size:  4, setter: uintSetter,       arraySetter: uintArraySetter, };
typeMap[UNSIGNED_INT_VEC2]             = { Type: Uint32Array,  size:  8, setter: uintVec2Setter,   cols: 2, };
typeMap[UNSIGNED_INT_VEC3]             = { Type: Uint32Array,  size: 12, setter: uintVec3Setter,   cols: 3, };
typeMap[UNSIGNED_INT_VEC4]             = { Type: Uint32Array,  size: 16, setter: uintVec4Setter,   cols: 4, };
typeMap[BOOL]                          = { Type: Uint32Array,  size:  4, setter: intSetter,        arraySetter: intArraySetter, };
typeMap[BOOL_VEC2]                     = { Type: Uint32Array,  size:  8, setter: intVec2Setter,    cols: 2, };
typeMap[BOOL_VEC3]                     = { Type: Uint32Array,  size: 12, setter: intVec3Setter,    cols: 3, };
typeMap[BOOL_VEC4]                     = { Type: Uint32Array,  size: 16, setter: intVec4Setter,    cols: 4, };
typeMap[FLOAT_MAT2]                    = { Type: Float32Array, size: 32, setter: floatMat2Setter,  rows: 2, cols: 2, };
typeMap[FLOAT_MAT3]                    = { Type: Float32Array, size: 48, setter: floatMat3Setter,  rows: 3, cols: 3, };
typeMap[FLOAT_MAT4]                    = { Type: Float32Array, size: 64, setter: floatMat4Setter,  rows: 4, cols: 4, };
typeMap[FLOAT_MAT2x3]                  = { Type: Float32Array, size: 32, setter: floatMat23Setter, rows: 2, cols: 3, };
typeMap[FLOAT_MAT2x4]                  = { Type: Float32Array, size: 32, setter: floatMat24Setter, rows: 2, cols: 4, };
typeMap[FLOAT_MAT3x2]                  = { Type: Float32Array, size: 48, setter: floatMat32Setter, rows: 3, cols: 2, };
typeMap[FLOAT_MAT3x4]                  = { Type: Float32Array, size: 48, setter: floatMat34Setter, rows: 3, cols: 4, };
typeMap[FLOAT_MAT4x2]                  = { Type: Float32Array, size: 64, setter: floatMat42Setter, rows: 4, cols: 2, };
typeMap[FLOAT_MAT4x3]                  = { Type: Float32Array, size: 64, setter: floatMat43Setter, rows: 4, cols: 3, };
typeMap[SAMPLER_2D]                    = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D$1,       };
typeMap[SAMPLER_CUBE]                  = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_CUBE_MAP, };
typeMap[SAMPLER_3D]                    = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_3D,       };
typeMap[SAMPLER_2D_SHADOW]             = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D$1,       };
typeMap[SAMPLER_2D_ARRAY]              = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D_ARRAY, };
typeMap[SAMPLER_2D_ARRAY_SHADOW]       = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D_ARRAY, };
typeMap[SAMPLER_CUBE_SHADOW]           = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_CUBE_MAP, };
typeMap[INT_SAMPLER_2D]                = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D$1,       };
typeMap[INT_SAMPLER_3D]                = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_3D,       };
typeMap[INT_SAMPLER_CUBE]              = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_CUBE_MAP, };
typeMap[INT_SAMPLER_2D_ARRAY]          = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D_ARRAY, };
typeMap[UNSIGNED_INT_SAMPLER_2D]       = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D$1,       };
typeMap[UNSIGNED_INT_SAMPLER_3D]       = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_3D,       };
typeMap[UNSIGNED_INT_SAMPLER_CUBE]     = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_CUBE_MAP, };
typeMap[UNSIGNED_INT_SAMPLER_2D_ARRAY] = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D_ARRAY, };

function floatAttribSetter(gl, index) {
  return function(b) {
    if (b.value) {
      gl.disableVertexAttribArray(index);
      switch (b.value.length) {
        case 4:
          gl.vertexAttrib4fv(index, b.value);
          break;
        case 3:
          gl.vertexAttrib3fv(index, b.value);
          break;
        case 2:
          gl.vertexAttrib2fv(index, b.value);
          break;
        case 1:
          gl.vertexAttrib1fv(index, b.value);
          break;
        default:
          throw new Error('the length of a float constant value must be between 1 and 4!');
      }
    } else {
      gl.bindBuffer(ARRAY_BUFFER, b.buffer);
      gl.enableVertexAttribArray(index);
      gl.vertexAttribPointer(
          index, b.numComponents || b.size, b.type || FLOAT, b.normalize || false, b.stride || 0, b.offset || 0);
      if (gl.vertexAttribDivisor) {
        gl.vertexAttribDivisor(index, b.divisor || 0);
      }
    }
  };
}

function intAttribSetter(gl, index) {
  return function(b) {
    if (b.value) {
      gl.disableVertexAttribArray(index);
      if (b.value.length === 4) {
        gl.vertexAttrib4iv(index, b.value);
      } else {
        throw new Error('The length of an integer constant value must be 4!');
      }
    } else {
      gl.bindBuffer(ARRAY_BUFFER, b.buffer);
      gl.enableVertexAttribArray(index);
      gl.vertexAttribIPointer(
          index, b.numComponents || b.size, b.type || INT, b.stride || 0, b.offset || 0);
      if (gl.vertexAttribDivisor) {
        gl.vertexAttribDivisor(index, b.divisor || 0);
      }
    }
  };
}

function uintAttribSetter(gl, index) {
  return function(b) {
    if (b.value) {
      gl.disableVertexAttribArray(index);
      if (b.value.length === 4) {
        gl.vertexAttrib4uiv(index, b.value);
      } else {
        throw new Error('The length of an unsigned integer constant value must be 4!');
      }
    } else {
      gl.bindBuffer(ARRAY_BUFFER, b.buffer);
      gl.enableVertexAttribArray(index);
      gl.vertexAttribIPointer(
          index, b.numComponents || b.size, b.type || UNSIGNED_INT, b.stride || 0, b.offset || 0);
      if (gl.vertexAttribDivisor) {
        gl.vertexAttribDivisor(index, b.divisor || 0);
      }
    }
  };
}

function matAttribSetter(gl, index, typeInfo) {
  const defaultSize = typeInfo.size;
  const count = typeInfo.count;

  return function(b) {
    gl.bindBuffer(ARRAY_BUFFER, b.buffer);
    const numComponents = b.size || b.numComponents || defaultSize;
    const size = numComponents / count;
    const type = b.type || FLOAT;
    const typeInfo = typeMap[type];
    const stride = typeInfo.size * numComponents;
    const normalize = b.normalize || false;
    const offset = b.offset || 0;
    const rowOffset = stride / count;
    for (let i = 0; i < count; ++i) {
      gl.enableVertexAttribArray(index + i);
      gl.vertexAttribPointer(
          index + i, size, type, normalize, stride, offset + rowOffset * i);
      if (gl.vertexAttribDivisor) {
        gl.vertexAttribDivisor(index + i, b.divisor || 0);
      }
    }
  };
}



const attrTypeMap = {};
attrTypeMap[FLOAT]             = { size:  4, setter: floatAttribSetter, };
attrTypeMap[FLOAT_VEC2]        = { size:  8, setter: floatAttribSetter, };
attrTypeMap[FLOAT_VEC3]        = { size: 12, setter: floatAttribSetter, };
attrTypeMap[FLOAT_VEC4]        = { size: 16, setter: floatAttribSetter, };
attrTypeMap[INT]               = { size:  4, setter: intAttribSetter,   };
attrTypeMap[INT_VEC2]          = { size:  8, setter: intAttribSetter,   };
attrTypeMap[INT_VEC3]          = { size: 12, setter: intAttribSetter,   };
attrTypeMap[INT_VEC4]          = { size: 16, setter: intAttribSetter,   };
attrTypeMap[UNSIGNED_INT]      = { size:  4, setter: uintAttribSetter,  };
attrTypeMap[UNSIGNED_INT_VEC2] = { size:  8, setter: uintAttribSetter,  };
attrTypeMap[UNSIGNED_INT_VEC3] = { size: 12, setter: uintAttribSetter,  };
attrTypeMap[UNSIGNED_INT_VEC4] = { size: 16, setter: uintAttribSetter,  };
attrTypeMap[BOOL]              = { size:  4, setter: intAttribSetter,   };
attrTypeMap[BOOL_VEC2]         = { size:  8, setter: intAttribSetter,   };
attrTypeMap[BOOL_VEC3]         = { size: 12, setter: intAttribSetter,   };
attrTypeMap[BOOL_VEC4]         = { size: 16, setter: intAttribSetter,   };
attrTypeMap[FLOAT_MAT2]        = { size:  4, setter: matAttribSetter,   count: 2, };
attrTypeMap[FLOAT_MAT3]        = { size:  9, setter: matAttribSetter,   count: 3, };
attrTypeMap[FLOAT_MAT4]        = { size: 16, setter: matAttribSetter,   count: 4, };

const errorRE = /ERROR:\s*\d+:(\d+)/gi;
function addLineNumbersWithError(src, log = '', lineOffset = 0) {
  // Note: Error message formats are not defined by any spec so this may or may not work.
  const matches = [...log.matchAll(errorRE)];
  const lineNoToErrorMap = new Map(matches.map((m, ndx) => {
    const lineNo = parseInt(m[1]);
    const next = matches[ndx + 1];
    const end = next ? next.index : log.length;
    const msg = log.substring(m.index, end);
    return [lineNo - 1, msg];
  }));
  return src.split('\n').map((line, lineNo) => {
    const err = lineNoToErrorMap.get(lineNo);
    return `${lineNo + 1 + lineOffset}: ${line}${err ? `\n\n^^^ ${err}` : ''}`;
  }).join('\n');
}

/**
 * Error Callback
 * @callback ErrorCallback
 * @param {string} msg error message.
 * @param {number} [lineOffset] amount to add to line number
 * @memberOf module:twgl
 */

/**
 * Program Callback
 * @callback ProgramCallback
 * @param {string} [err] error message, falsy if no error
 * @param {WebGLProgram|module:twgl.ProgramInfo} [result] the program or programInfo
 */

const spaceRE = /^[ \t]*\n/;

/**
 * Remove the first end of line because WebGL 2.0 requires
 * #version 300 es
 * as the first line. No whitespace allowed before that line
 * so
 *
 * <script>
 * #version 300 es
 * </script>
 *
 * Has one line before it which is invalid according to GLSL ES 3.00
 *
 * @param {string} shaderSource The source of the shader
 * @returns {{shaderSource: string, lineOffset: number}}
 * @private
 */
function prepShaderSource(shaderSource) {
  let lineOffset = 0;
  if (spaceRE.test(shaderSource)) {
    lineOffset = 1;
    shaderSource = shaderSource.replace(spaceRE, '');
  }
  return {lineOffset, shaderSource};
}

/**
 * @param {module:twgl.ProgramOptions} progOptions
 * @param {string} msg
 * @return null
 * @private
 */
function reportError(progOptions, msg) {
  progOptions.errorCallback(msg);
  if (progOptions.callback) {
    setTimeout(() => {
      progOptions.callback(`${msg}\n${progOptions.errors.join('\n')}`);
    });
  }
  return null;
}

/**
 * Check Shader status
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {number} shaderType The shader type
 * @param {WebGLShader} shader The shader
 * @param {ErrorCallback} [errFn] function to receive error message.
 * @return {string} errors or empty string
 * @private
 */
function checkShaderStatus(gl, shaderType, shader, errFn) {
  errFn = errFn || error;
  // Check the compile status
  const compiled = gl.getShaderParameter(shader, COMPILE_STATUS);
  if (!compiled) {
    // Something went wrong during compilation; get the error
    const lastError = gl.getShaderInfoLog(shader);
    const {lineOffset, shaderSource} = prepShaderSource(gl.getShaderSource(shader));
    const error = `${addLineNumbersWithError(shaderSource, lastError, lineOffset)}\nError compiling ${glEnumToString(gl, shaderType)}: ${lastError}`;
    errFn(error);
    return error;
  }
  return '';
}

/**
 * @typedef {Object} FullProgramSpec
 * @property {string[]} shaders the shader source or element ids.
 * @property {function(string)} [errorCallback] callback for errors
 * @property {Object.<string,number>|string[]} [attribLocations] a attribute name to location map, or array of attribute names where index = location.
 * @property {(module:twgl.BufferInfo|Object.<string,module:twgl.AttribInfo>|string[])} [transformFeedbackVaryings] If passed
 *   a BufferInfo will use the attribs names inside. If passed an object of AttribInfos will use the names from that object. Otherwise
 *   you can pass an array of names.
 * @property {number} [transformFeedbackMode] the mode to pass `gl.transformFeedbackVaryings`. Defaults to `SEPARATE_ATTRIBS`.
 * @property {ProgramCallback} [callback] callback for async program compilation.
 * @memberOf module:twgl
 */

/**
 * @typedef {string[]|module:twgl.FullProgramSpec} ProgramSpec
 * @memberOf module:twgl
 */

/**
 * @typedef {Object} ProgramOptions
 * @property {function(string)} [errorCallback] callback for errors
 * @property {Object.<string,number>|string[]} [attribLocations] a attribute name to location map, or array of attribute names where index = location.
 * @property {(module:twgl.BufferInfo|Object.<string,module:twgl.AttribInfo>|string[])} [transformFeedbackVaryings] If passed
 *   a BufferInfo will use the attribs names inside. If passed an object of AttribInfos will use the names from that object. Otherwise
 *   you can pass an array of names.
 * @property {number} [transformFeedbackMode] the mode to pass `gl.transformFeedbackVaryings`. Defaults to `SEPARATE_ATTRIBS`.
 * @property {ProgramCallback} [callback] callback for async program compilation.
 * @memberOf module:twgl
 */

/**
 * Gets the program options based on all these optional arguments
 * @param {module:twgl.ProgramOptions|string[]} [opt_attribs] Options for the program or an array of attribs names. Locations will be assigned by index if not passed in
 * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
 * @param {module:twgl.ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @return {module:twgl.ProgramOptions} an instance of ProgramOptions based on the arguments passed in
 * @private
 */
function getProgramOptions(opt_attribs, opt_locations, opt_errorCallback) {
  let transformFeedbackVaryings;
  let transformFeedbackMode;
  let callback;
  if (typeof opt_locations === 'function') {
    opt_errorCallback = opt_locations;
    opt_locations = undefined;
  }
  if (typeof opt_attribs === 'function') {
    opt_errorCallback = opt_attribs;
    opt_attribs = undefined;
  } else if (opt_attribs && !Array.isArray(opt_attribs)) {
    const opt = opt_attribs;
    opt_errorCallback = opt.errorCallback;
    opt_attribs = opt.attribLocations;
    transformFeedbackVaryings = opt.transformFeedbackVaryings;
    transformFeedbackMode = opt.transformFeedbackMode;
    callback = opt.callback;
  }

  const errorCallback = opt_errorCallback || error;
  const errors = [];
  const options = {
    errorCallback(msg, ...args) {
      errors.push(msg);
      errorCallback(msg, ...args);
    },
    transformFeedbackVaryings,
    transformFeedbackMode,
    callback,
    errors,
  };

  {
    let attribLocations = {};
    if (Array.isArray(opt_attribs)) {
      opt_attribs.forEach(function(attrib,  ndx) {
        attribLocations[attrib] = opt_locations ? opt_locations[ndx] : ndx;
      });
    } else {
      attribLocations = opt_attribs || {};
    }
    options.attribLocations = attribLocations;
  }

  return options;
}

const defaultShaderType = [
  "VERTEX_SHADER",
  "FRAGMENT_SHADER",
];

function getShaderTypeFromScriptType(gl, scriptType) {
  if (scriptType.indexOf("frag") >= 0) {
    return FRAGMENT_SHADER;
  } else if (scriptType.indexOf("vert") >= 0) {
    return VERTEX_SHADER;
  }
  return undefined;
}

function deleteProgramAndShaders(gl, program, notThese) {
  const shaders = gl.getAttachedShaders(program);
  for (const shader of shaders) {
    if (notThese.has(shader)) {
      gl.deleteShader(shader);
    }
  }
  gl.deleteProgram(program);
}

const wait = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

function createProgramNoCheck(gl, shaders, programOptions) {
  const program = gl.createProgram();
  const {
    attribLocations,
    transformFeedbackVaryings,
    transformFeedbackMode,
  } = getProgramOptions(programOptions);

  for (let ndx = 0; ndx < shaders.length; ++ndx) {
    let shader = shaders[ndx];
    if (typeof shader === 'string') {
      const elem = getElementById(shader);
      const src = elem ? elem.text : shader;
      let type = gl[defaultShaderType[ndx]];
      if (elem && elem.type) {
        type = getShaderTypeFromScriptType(gl, elem.type) || type;
      }
      shader = gl.createShader(type);
      gl.shaderSource(shader, prepShaderSource(src).shaderSource);
      gl.compileShader(shader);
      gl.attachShader(program, shader);
    }
  }

  Object.entries(attribLocations).forEach(([attrib, loc]) => gl.bindAttribLocation(program, loc, attrib));

  {
    let varyings = transformFeedbackVaryings;
    if (varyings) {
      if (varyings.attribs) {
        varyings = varyings.attribs;
      }
      if (!Array.isArray(varyings)) {
        varyings = Object.keys(varyings);
      }
      gl.transformFeedbackVaryings(program, varyings, transformFeedbackMode || SEPARATE_ATTRIBS);
    }
  }

  gl.linkProgram(program);
  return program;
}

/**
 * Creates a program, attaches (and/or compiles) shaders, binds attrib locations, links the
 * program.
 *
 * NOTE: There are 4 signatures for this function
 *
 *     twgl.createProgram(gl, [vs, fs], options);
 *     twgl.createProgram(gl, [vs, fs], opt_errFunc);
 *     twgl.createProgram(gl, [vs, fs], opt_attribs, opt_errFunc);
 *     twgl.createProgram(gl, [vs, fs], opt_attribs, opt_locations, opt_errFunc);
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {WebGLShader[]|string[]} shaders The shaders to attach, or element ids for their source, or strings that contain their source
 * @param {module:twgl.ProgramOptions|string[]|module:twgl.ErrorCallback} [opt_attribs] Options for the program or an array of attribs names or an error callback. Locations will be assigned by index if not passed in
 * @param {number[]|module:twgl.ErrorCallback} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations or an error callback.
 * @param {module:twgl.ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @return {WebGLProgram?} the created program or null if error of a callback was provided.
 * @memberOf module:twgl/programs
 */
function createProgram(
    gl, shaders, opt_attribs, opt_locations, opt_errorCallback) {
  // This code is really convoluted, because it may or may not be async
  // Maybe it would be better to have a separate function
  const progOptions = getProgramOptions(opt_attribs, opt_locations, opt_errorCallback);
  const shaderSet = new Set(shaders);
  const program = createProgramNoCheck(gl, shaders, progOptions);

  function hasErrors(gl, program) {
    const errors = getProgramErrors(gl, program, progOptions.errorCallback);
    if (errors) {
      deleteProgramAndShaders(gl, program, shaderSet);
    }
    return errors;
  }

  if (progOptions.callback) {
    waitForProgramLinkCompletionAsync(gl, program).then(() => {
      const errors = hasErrors(gl, program);
      progOptions.callback(errors, errors ? undefined : program);
    });
    return undefined;
  }

  return hasErrors(gl, program) ? undefined : program;
}

/**
 * This only works because the functions it wraps the first 2 arguments
 * are gl and any, followed by things that become programOptions
 * @private
 */
function wrapCallbackFnToAsyncFn(fn) {
  return function(gl, arg1, ...args) {
    return new Promise((resolve, reject) => {
      const programOptions = getProgramOptions(...args);
      programOptions.callback = (err, program) => {
        if (err) {
          reject(err);
        } else {
          resolve(program);
        }
      };
      fn(gl, arg1, programOptions);
    });
  };
}

/**
 * Same as createProgram but returns a promise
 *
 * NOTE: There are 4 signatures for this function
 *
 *     twgl.createProgramAsync(gl, [vs, fs], options);
 *     twgl.createProgramAsync(gl, [vs, fs], opt_errFunc);
 *     twgl.createProgramAsync(gl, [vs, fs], opt_attribs, opt_errFunc);
 *     twgl.createProgramAsync(gl, [vs, fs], opt_attribs, opt_locations, opt_errFunc);
 *
 * @function
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {WebGLShader[]|string[]} shaders The shaders to attach, or element ids for their source, or strings that contain their source
 * @param {module:twgl.ProgramOptions|string[]|module:twgl.ErrorCallback} [opt_attribs] Options for the program or an array of attribs names or an error callback. Locations will be assigned by index if not passed in
 * @param {number[]|module:twgl.ErrorCallback} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations or an error callback.
 * @param {module:twgl.ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @return {Promise<WebGLProgram>} The created program
 * @memberOf module:twgl/programs
 */
const createProgramAsync = wrapCallbackFnToAsyncFn(createProgram);

/**
 * Same as createProgramInfo but returns a promise
 * @function
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext
 *        to use.
 * @param {string[]} shaderSources Array of sources for the
 *        shaders or ids. The first is assumed to be the vertex shader,
 *        the second the fragment shader.
 * @param {module:twgl.ProgramOptions|string[]|module:twgl.ErrorCallback} [opt_attribs] Options for the program or an array of attribs names or an error callback. Locations will be assigned by index if not passed in
 * @param {number[]|module:twgl.ErrorCallback} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations or an error callback.
 * @param {module:twgl.ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @return {Promise<module:twgl.ProgramInfo>} The created ProgramInfo
 * @memberOf module:twgl/programs
 */
const createProgramInfoAsync = wrapCallbackFnToAsyncFn(createProgramInfo);

async function waitForProgramLinkCompletionAsync(gl, program) {
  const ext = gl.getExtension('KHR_parallel_shader_compile');
  const checkFn = ext
      ? (gl, program) => gl.getProgramParameter(program, ext.COMPLETION_STATUS_KHR)
      : () => true;

  let waitTime = 0;
  do {
    await wait(waitTime);  // must wait at least once
    waitTime = 1000 / 60;
  } while (!checkFn(gl, program));
}

async function waitForAllProgramsLinkCompletionAsync(gl, programs) {
  for (const program of Object.values(programs)) {
    await waitForProgramLinkCompletionAsync(gl, program);
  }
}

/**
 * Check a program's link status
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {WebGLProgram} program Program to check
 * @param {ErrorCallback} [errFn] func for errors
 * @return {string?} errors if program is failed, else undefined
 * @private
 */
function getProgramErrors(gl, program, errFn) {
  errFn = errFn || error;
  // Check the link status
  const linked = gl.getProgramParameter(program, LINK_STATUS);
  if (!linked) {
    // something went wrong with the link
    const lastError = gl.getProgramInfoLog(program);
    errFn(`Error in program linking: ${lastError}`);
    // print any errors from these shaders
    const shaders = gl.getAttachedShaders(program);
    const errors = shaders.map(shader => checkShaderStatus(gl, gl.getShaderParameter(shader, gl.SHADER_TYPE), shader, errFn));
    return `${lastError}\n${errors.filter(_ => _).join('\n')}`;
  }
  return undefined;
}

/**
 * Creates a program from 2 script tags.
 *
 * NOTE: There are 4 signatures for this function
 *
 *     twgl.createProgramFromScripts(gl, [vs, fs], opt_options);
 *     twgl.createProgramFromScripts(gl, [vs, fs], opt_errFunc);
 *     twgl.createProgramFromScripts(gl, [vs, fs], opt_attribs, opt_errFunc);
 *     twgl.createProgramFromScripts(gl, [vs, fs], opt_attribs, opt_locations, opt_errFunc);
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext
 *        to use.
 * @param {string[]} shaderScriptIds Array of ids of the script
 *        tags for the shaders. The first is assumed to be the
 *        vertex shader, the second the fragment shader.
 * @param {module:twgl.ProgramOptions|string[]|module:twgl.ErrorCallback} [opt_attribs] Options for the program or an array of attribs names or an error callback. Locations will be assigned by index if not passed in
 * @param {number[]|module:twgl.ErrorCallback} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations or an error callback.
 * @param {module:twgl.ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @return {WebGLProgram?} the created program or null if error or a callback was provided.
 * @memberOf module:twgl/programs
 */
function createProgramFromScripts(
    gl, shaderScriptIds, opt_attribs, opt_locations, opt_errorCallback) {
  const progOptions = getProgramOptions(opt_attribs, opt_locations, opt_errorCallback);
  const shaders = [];
  for (const scriptId of shaderScriptIds) {
    const shaderScript = getElementById(scriptId);
    if (!shaderScript) {
      return reportError(progOptions, `unknown script element: ${scriptId}`);
    }
    shaders.push(shaderScript.text);
  }
  return createProgram(gl, shaders, progOptions);
}

/**
 * Creates a program from 2 sources.
 *
 * NOTE: There are 4 signatures for this function
 *
 *     twgl.createProgramFromSource(gl, [vs, fs], opt_options);
 *     twgl.createProgramFromSource(gl, [vs, fs], opt_errFunc);
 *     twgl.createProgramFromSource(gl, [vs, fs], opt_attribs, opt_errFunc);
 *     twgl.createProgramFromSource(gl, [vs, fs], opt_attribs, opt_locations, opt_errFunc);
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext
 *        to use.
 * @param {string[]} shaderSources Array of sources for the
 *        shaders. The first is assumed to be the vertex shader,
 *        the second the fragment shader.
 * @param {module:twgl.ProgramOptions|string[]|module:twgl.ErrorCallback} [opt_attribs] Options for the program or an array of attribs names or an error callback. Locations will be assigned by index if not passed in
 * @param {number[]|module:twgl.ErrorCallback} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations or an error callback.
 * @param {module:twgl.ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @return {WebGLProgram?} the created program or null if error or a callback was provided.
 * @memberOf module:twgl/programs
 */
function createProgramFromSources(
    gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback) {
  return createProgram(gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback);
}

/**
 * Returns true if attribute/uniform is a reserved/built in
 *
 * It makes no sense to me why GL returns these because it's
 * illegal to call `gl.getUniformLocation` and `gl.getAttribLocation`
 * with names that start with `gl_` (and `webgl_` in WebGL)
 *
 * I can only assume they are there because they might count
 * when computing the number of uniforms/attributes used when you want to
 * know if you are near the limit. That doesn't really make sense
 * to me but the fact that these get returned are in the spec.
 *
 * @param {WebGLActiveInfo} info As returned from `gl.getActiveUniform` or
 *    `gl.getActiveAttrib`.
 * @return {bool} true if it's reserved
 * @private
 */
function isBuiltIn(info) {
  const name = info.name;
  return name.startsWith("gl_") || name.startsWith("webgl_");
}

const tokenRE = /(\.|\[|]|\w+)/g;
const isDigit = s => s >= '0' && s <= '9';
function addSetterToUniformTree(fullPath, setter, node, uniformSetters) {
  const tokens = fullPath.split(tokenRE).filter(s => s !== '');
  let tokenNdx = 0;
  let path = '';

  for (;;) {
    const token = tokens[tokenNdx++];  // has to be name or number
    path += token;
    const isArrayIndex = isDigit(token[0]);
    const accessor = isArrayIndex
        ? parseInt(token)
        : token;
    if (isArrayIndex) {
      path += tokens[tokenNdx++];  // skip ']'
    }
    const isLastToken = tokenNdx === tokens.length;
    if (isLastToken) {
      node[accessor] = setter;
      break;
    } else {
      const token = tokens[tokenNdx++];  // has to be . or [
      const isArray = token === '[';
      const child = node[accessor] || (isArray ? [] : {});
      node[accessor] = child;
      node = child;
      uniformSetters[path] = uniformSetters[path] || function(node) {
        return function(value) {
          setUniformTree(node, value);
        };
      }(child);
      path += token;
    }
  }
}

/**
 * Creates setter functions for all uniforms of a shader
 * program.
 *
 * @see {@link module:twgl.setUniforms}
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {WebGLProgram} program the program to create setters for.
 * @returns {Object.<string, function>} an object with a setter by name for each uniform
 * @memberOf module:twgl/programs
 */
function createUniformSetters(gl, program) {
  let textureUnit = 0;

  /**
   * Creates a setter for a uniform of the given program with it's
   * location embedded in the setter.
   * @param {WebGLProgram} program
   * @param {WebGLUniformInfo} uniformInfo
   * @returns {function} the created setter.
   */
  function createUniformSetter(program, uniformInfo, location) {
    const isArray = uniformInfo.name.endsWith("[0]");
    const type = uniformInfo.type;
    const typeInfo = typeMap[type];
    if (!typeInfo) {
      throw new Error(`unknown type: 0x${type.toString(16)}`); // we should never get here.
    }
    let setter;
    if (typeInfo.bindPoint) {
      // it's a sampler
      const unit = textureUnit;
      textureUnit += uniformInfo.size;
      if (isArray) {
        setter = typeInfo.arraySetter(gl, type, unit, location, uniformInfo.size);
      } else {
        setter = typeInfo.setter(gl, type, unit, location, uniformInfo.size);
      }
    } else {
      if (typeInfo.arraySetter && isArray) {
        setter = typeInfo.arraySetter(gl, location);
      } else {
        setter = typeInfo.setter(gl, location);
      }
    }
    setter.location = location;
    return setter;
  }

  const uniformSetters = {};
  const uniformTree = {};
  const numUniforms = gl.getProgramParameter(program, ACTIVE_UNIFORMS);

  for (let ii = 0; ii < numUniforms; ++ii) {
    const uniformInfo = gl.getActiveUniform(program, ii);
    if (isBuiltIn(uniformInfo)) {
      continue;
    }
    let name = uniformInfo.name;
    // remove the array suffix.
    if (name.endsWith("[0]")) {
      name = name.substr(0, name.length - 3);
    }
    const location = gl.getUniformLocation(program, uniformInfo.name);
    // the uniform will have no location if it's in a uniform block
    if (location) {
      const setter = createUniformSetter(program, uniformInfo, location);
      uniformSetters[name] = setter;
      addSetterToUniformTree(name, setter, uniformTree, uniformSetters);
    }
  }

  return uniformSetters;
}

/**
 * @typedef {Object} TransformFeedbackInfo
 * @property {number} index index of transform feedback
 * @property {number} type GL type
 * @property {number} size 1 - 4
 * @memberOf module:twgl
 */

/**
 * Create TransformFeedbackInfo for passing to bindTransformFeedbackInfo.
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {WebGLProgram} program an existing WebGLProgram.
 * @return {Object<string, module:twgl.TransformFeedbackInfo>}
 * @memberOf module:twgl
 */
function createTransformFeedbackInfo(gl, program) {
  const info = {};
  const numVaryings = gl.getProgramParameter(program, TRANSFORM_FEEDBACK_VARYINGS);
  for (let ii = 0; ii < numVaryings; ++ii) {
    const varying = gl.getTransformFeedbackVarying(program, ii);
    info[varying.name] = {
      index: ii,
      type: varying.type,
      size: varying.size,
    };
  }
  return info;
}

/**
 * Binds buffers for transform feedback.
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {(module:twgl.ProgramInfo|Object<string, module:twgl.TransformFeedbackInfo>)} transformFeedbackInfo A ProgramInfo or TransformFeedbackInfo.
 * @param {(module:twgl.BufferInfo|Object<string, module:twgl.AttribInfo>)} [bufferInfo] A BufferInfo or set of AttribInfos.
 * @memberOf module:twgl
 */
function bindTransformFeedbackInfo(gl, transformFeedbackInfo, bufferInfo) {
  if (transformFeedbackInfo.transformFeedbackInfo) {
    transformFeedbackInfo = transformFeedbackInfo.transformFeedbackInfo;
  }
  if (bufferInfo.attribs) {
    bufferInfo = bufferInfo.attribs;
  }
  for (const name in bufferInfo) {
    const varying = transformFeedbackInfo[name];
    if (varying) {
      const buf = bufferInfo[name];
      if (buf.offset) {
        gl.bindBufferRange(TRANSFORM_FEEDBACK_BUFFER, varying.index, buf.buffer, buf.offset, buf.size);
      } else {
        gl.bindBufferBase(TRANSFORM_FEEDBACK_BUFFER, varying.index, buf.buffer);
      }
    }
  }
}

/**
 * Creates a transform feedback and sets the buffers
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {module:twgl.ProgramInfo} programInfo A ProgramInfo as returned from {@link module:twgl.createProgramInfo}
 * @param {(module:twgl.BufferInfo|Object<string, module:twgl.AttribInfo>)} [bufferInfo] A BufferInfo or set of AttribInfos.
 * @return {WebGLTransformFeedback} the created transform feedback
 * @memberOf module:twgl
 */
function createTransformFeedback(gl, programInfo, bufferInfo) {
  const tf = gl.createTransformFeedback();
  gl.bindTransformFeedback(TRANSFORM_FEEDBACK, tf);
  gl.useProgram(programInfo.program);
  bindTransformFeedbackInfo(gl, programInfo, bufferInfo);
  gl.bindTransformFeedback(TRANSFORM_FEEDBACK, null);
  return tf;
}

/**
 * @typedef {Object} UniformData
 * @property {string} name The name of the uniform
 * @property {number} type The WebGL type enum for this uniform
 * @property {number} size The number of elements for this uniform
 * @property {number} blockNdx The block index this uniform appears in
 * @property {number} offset The byte offset in the block for this uniform's value
 * @memberOf module:twgl
 */

/**
 * The specification for one UniformBlockObject
 *
 * @typedef {Object} BlockSpec
 * @property {number} index The index of the block.
 * @property {number} size The size in bytes needed for the block
 * @property {number[]} uniformIndices The indices of the uniforms used by the block. These indices
 *    correspond to entries in a UniformData array in the {@link module:twgl.UniformBlockSpec}.
 * @property {bool} usedByVertexShader Self explanatory
 * @property {bool} usedByFragmentShader Self explanatory
 * @property {bool} used Self explanatory
 * @memberOf module:twgl
 */

/**
 * A `UniformBlockSpec` represents the data needed to create and bind
 * UniformBlockObjects for a given program
 *
 * @typedef {Object} UniformBlockSpec
 * @property {Object.<string, module:twgl.BlockSpec>} blockSpecs The BlockSpec for each block by block name
 * @property {UniformData[]} uniformData An array of data for each uniform by uniform index.
 * @memberOf module:twgl
 */

/**
 * Creates a UniformBlockSpec for the given program.
 *
 * A UniformBlockSpec represents the data needed to create and bind
 * UniformBlockObjects
 *
 * @param {WebGL2RenderingContext} gl A WebGL2 Rendering Context
 * @param {WebGLProgram} program A WebGLProgram for a successfully linked program
 * @return {module:twgl.UniformBlockSpec} The created UniformBlockSpec
 * @memberOf module:twgl/programs
 */
function createUniformBlockSpecFromProgram(gl, program) {
  const numUniforms = gl.getProgramParameter(program, ACTIVE_UNIFORMS);
  const uniformData = [];
  const uniformIndices = [];

  for (let ii = 0; ii < numUniforms; ++ii) {
    uniformIndices.push(ii);
    uniformData.push({});
    const uniformInfo = gl.getActiveUniform(program, ii);
    uniformData[ii].name = uniformInfo.name;
  }

  [
    [ "UNIFORM_TYPE", "type" ],
    [ "UNIFORM_SIZE", "size" ],  // num elements
    [ "UNIFORM_BLOCK_INDEX", "blockNdx" ],
    [ "UNIFORM_OFFSET", "offset", ],
  ].forEach(function(pair) {
    const pname = pair[0];
    const key = pair[1];
    gl.getActiveUniforms(program, uniformIndices, gl[pname]).forEach(function(value, ndx) {
      uniformData[ndx][key] = value;
    });
  });

  const blockSpecs = {};

  const numUniformBlocks = gl.getProgramParameter(program, ACTIVE_UNIFORM_BLOCKS);
  for (let ii = 0; ii < numUniformBlocks; ++ii) {
    const name = gl.getActiveUniformBlockName(program, ii);
    const blockSpec = {
      index: gl.getUniformBlockIndex(program, name),
      usedByVertexShader: gl.getActiveUniformBlockParameter(program, ii, UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER),
      usedByFragmentShader: gl.getActiveUniformBlockParameter(program, ii, UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER),
      size: gl.getActiveUniformBlockParameter(program, ii, UNIFORM_BLOCK_DATA_SIZE),
      uniformIndices: gl.getActiveUniformBlockParameter(program, ii, UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES),
    };
    blockSpec.used = blockSpec.usedByVertexShader || blockSpec.usedByFragmentShader;
    blockSpecs[name] = blockSpec;
  }

  return {
    blockSpecs: blockSpecs,
    uniformData: uniformData,
  };
}

const arraySuffixRE = /\[\d+\]\.$/;  // better way to check?

const pad = (v, padding) => ((v + (padding - 1)) / padding | 0) * padding;

function createUniformBlockUniformSetter(view, isArray, rows, cols) {
  if (isArray || rows) {
    cols = cols || 1;
    const numElements = view.length;
    const totalRows = numElements / 4;
    return function(value) {
      let dst = 0;
      let src = 0;
      for (let row = 0; row < totalRows; ++row) {
        for (let col = 0; col < cols; ++col) {
          view[dst++] = value[src++];
        }
        dst += 4 - cols;
      }
    };
  } else {
    return function(value) {
      if (value.length) {
        view.set(value);
      } else {
        view[0] = value;
      }
    };
  }
}

/**
 * Represents a UniformBlockObject including an ArrayBuffer with all the uniform values
 * and a corresponding WebGLBuffer to hold those values on the GPU
 *
 * @typedef {Object} UniformBlockInfo
 * @property {string} name The name of the block
 * @property {ArrayBuffer} array The array buffer that contains the uniform values
 * @property {Float32Array} asFloat A float view on the array buffer. This is useful
 *    inspecting the contents of the buffer in the debugger.
 * @property {Uint8Array} asUint8t A uint8 view on the array buffer.
 * @property {WebGLBuffer} buffer A WebGL buffer that will hold a copy of the uniform values for rendering.
 * @property {number} [offset] offset into buffer
 * @property {Object<string, ArrayBufferView>} uniforms A uniform name to ArrayBufferView map.
 *   each Uniform has a correctly typed `ArrayBufferView` into array at the correct offset
 *   and length of that uniform. So for example a float uniform would have a 1 float `Float32Array`
 *   view. A single mat4 would have a 16 element `Float32Array` view. An ivec2 would have an
 *   `Int32Array` view, etc.
 * @property {Object<string, function>} setters A setter for this uniform.
 *   The reason to use setters is elements of arrays are padded to vec4 sizes which
 *   means if you want to set an array of 4 floats you'd need to set 16 values
 *   (or set elements 0, 4, 8, 12). In other words
 *   `someBlockInfo.uniforms.some4FloatArrayUniform.set([0, , , , 1, , , , 2, , , , 3])`
 *   where as the setter handles just passing in [0, 1, 2, 3] either directly as in
 *   `someBlockInfo.setter.some4FloatArrayUniform.set([0, 1, 2, 3])` (not recommended)
 *   or via {@link module:twgl.setBlockUniforms}
 * @memberOf module:twgl
 */

/**
 * Options to allow createUniformBlockInfo to use an existing buffer and arrayBuffer at an offset
 * @typedef {Object} UniformBlockInfoOptions
 * @property {ArrayBuffer} [array] an existing array buffer to use for values
 * @property {number} [offset] the offset in bytes to use in the array buffer (default = 0)
 * @property {WebGLBuffer} [buffer] the buffer to use for this uniform block info
 * @property {number} [bufferOffset] the offset in bytes in the buffer to use (default = use offset above)
 */

/**
 * Creates a `UniformBlockInfo` for the specified block
 *
 * Note: **If the blockName matches no existing blocks a warning is printed to the console and a dummy
 * `UniformBlockInfo` is returned**. This is because when debugging GLSL
 * it is common to comment out large portions of a shader or for example set
 * the final output to a constant. When that happens blocks get optimized out.
 * If this function did not create dummy blocks your code would crash when debugging.
 *
 * @param {WebGL2RenderingContext} gl A WebGL2RenderingContext
 * @param {WebGLProgram} program A WebGLProgram
 * @param {module:twgl.UniformBlockSpec} uniformBlockSpec. A UniformBlockSpec as returned
 *     from {@link module:twgl.createUniformBlockSpecFromProgram}.
 * @param {string} blockName The name of the block.
 * @param {module:twgl.UniformBlockInfoOptions} [options] Optional options for using existing an existing buffer and arrayBuffer
 * @return {module:twgl.UniformBlockInfo} The created UniformBlockInfo
 * @memberOf module:twgl/programs
 */
function createUniformBlockInfoFromProgram(gl, program, uniformBlockSpec, blockName, options = {}) {
  const blockSpecs = uniformBlockSpec.blockSpecs;
  const uniformData = uniformBlockSpec.uniformData;
  const blockSpec = blockSpecs[blockName];
  if (!blockSpec) {
    warn("no uniform block object named:", blockName);
    return {
      name: blockName,
      uniforms: {},
    };
  }
  const offset = options.offset ?? 0;
  const array = options.array ?? new ArrayBuffer(blockSpec.size);
  const buffer = options.buffer ?? gl.createBuffer();
  const uniformBufferIndex = blockSpec.index;
  gl.bindBuffer(UNIFORM_BUFFER, buffer);
  if (!options.buffer) {
    gl.bufferData(UNIFORM_BUFFER, array.byteLength, DYNAMIC_DRAW);
  }
  gl.uniformBlockBinding(program, blockSpec.index, uniformBufferIndex);

  let prefix = blockName + ".";
  if (arraySuffixRE.test(prefix)) {
    prefix = prefix.replace(arraySuffixRE, ".");
  }
  const uniforms = {};
  const setters = {};
  const setterTree = {};
  blockSpec.uniformIndices.forEach(function(uniformNdx) {
    const data = uniformData[uniformNdx];
    let name = data.name;
    if (name.startsWith(prefix)) {
      name = name.substr(prefix.length);
    }
    const isArray = name.endsWith('[0]');
    if (isArray) {
      name = name.substr(0, name.length - 3);
    }
    const typeInfo = typeMap[data.type];
    const Type = typeInfo.Type;
    const byteLength = isArray
        ? pad(typeInfo.size, 16) * data.size
        : typeInfo.size * data.size;
    const uniformView = new Type(array, offset + data.offset, byteLength / Type.BYTES_PER_ELEMENT);
    uniforms[name] = uniformView;
    // Note: I'm not sure what to do here. The original
    // idea was to create TypedArray views into each part
    // of the block. This is useful, for example if you have
    // a block with { mat4: model; mat4 view; mat4 projection; }
    // you'll get a Float32Array for each one suitable for
    // passing to most JS math libraries including twgl's and glMatrix.js.
    //
    // But, if you have a an array of structures, especially if that
    // array is large, you get a whole bunch of TypedArray views.
    // Every one of them has overhead and switching between them all
    // is probably a cache miss. In that case it would really be better
    // to just have one view (asFloat) and have all the setters
    // just reference the correct portion. But, then you can't easily
    // treat a matrix, or a vec4, as a standalone thing like you can
    // with all the views.
    //
    // Another problem with the views is they are not shared. With
    // uniforms you have one set of setters. With UniformBlockInfo
    // you have a set of setters *pre block instance*. That's because
    // TypedArray views can't be mapped to different buffers.
    //
    // My gut right now is if you really want the speed and compactness
    // then you should probably roll your own solution. TWGL's goal
    // here is ease of use as AFAICT there is no simple generic efficient
    // solution.
    const setter = createUniformBlockUniformSetter(uniformView, isArray, typeInfo.rows, typeInfo.cols);
    setters[name] = setter;
    addSetterToUniformTree(name, setter, setterTree, setters);
  });
  return {
    name: blockName,
    array,
    asFloat: new Float32Array(array),  // for debugging
    asUint8: new Uint8Array(array),  // needed for gl.bufferSubData because it doesn't take an array buffer
    buffer,
    uniforms,
    setters,
    offset: options.bufferOffset ?? offset,
    size: blockSpec.size,
  };
}

/**
 * Creates a `UniformBlockInfo` for the specified block
 *
 * Note: **If the blockName matches no existing blocks a warning is printed to the console and a dummy
 * `UniformBlockInfo` is returned**. This is because when debugging GLSL
 * it is common to comment out large portions of a shader or for example set
 * the final output to a constant. When that happens blocks get optimized out.
 * If this function did not create dummy blocks your code would crash when debugging.
 *
 * @param {WebGL2RenderingContext} gl A WebGL2RenderingContext
 * @param {module:twgl.ProgramInfo} programInfo a `ProgramInfo`
 *     as returned from {@link module:twgl.createProgramInfo}
 * @param {string} blockName The name of the block.
 * @param {module:twgl.UniformBlockInfoOptions} [options] Optional options for using existing an existing buffer and arrayBuffer
 * @return {module:twgl.UniformBlockInfo} The created UniformBlockInfo
 * @memberOf module:twgl/programs
 */
function createUniformBlockInfo(gl, programInfo, blockName, options = {}) {
  return createUniformBlockInfoFromProgram(gl, programInfo.program, programInfo.uniformBlockSpec, blockName, options);
}

/**
 * Binds a uniform block to the matching uniform block point.
 * Matches by blocks by name so blocks must have the same name not just the same
 * structure.
 *
 * If you have changed any values and you upload the values into the corresponding WebGLBuffer
 * call {@link module:twgl.setUniformBlock} instead.
 *
 * @param {WebGL2RenderingContext} gl A WebGL 2 rendering context.
 * @param {(module:twgl.ProgramInfo|module:twgl.UniformBlockSpec)} programInfo a `ProgramInfo`
 *     as returned from {@link module:twgl.createProgramInfo} or or `UniformBlockSpec` as
 *     returned from {@link module:twgl.createUniformBlockSpecFromProgram}.
 * @param {module:twgl.UniformBlockInfo} uniformBlockInfo a `UniformBlockInfo` as returned from
 *     {@link module:twgl.createUniformBlockInfo}.
 * @return {bool} true if buffer was bound. If the programInfo has no block with the same block name
 *     no buffer is bound.
 * @memberOf module:twgl/programs
 */
function bindUniformBlock(gl, programInfo, uniformBlockInfo) {
  const uniformBlockSpec = programInfo.uniformBlockSpec || programInfo;
  const blockSpec = uniformBlockSpec.blockSpecs[uniformBlockInfo.name];
  if (blockSpec) {
    const bufferBindIndex = blockSpec.index;
    gl.bindBufferRange(UNIFORM_BUFFER, bufferBindIndex, uniformBlockInfo.buffer, uniformBlockInfo.offset || 0, uniformBlockInfo.size ?? uniformBlockInfo.array.byteLength);
    return true;
  }
  return false;
}

/**
 * Uploads the current uniform values to the corresponding WebGLBuffer
 * and binds that buffer to the program's corresponding bind point for the uniform block object.
 *
 * If you haven't changed any values and you only need to bind the uniform block object
 * call {@link module:twgl.bindUniformBlock} instead.
 *
 * @param {WebGL2RenderingContext} gl A WebGL 2 rendering context.
 * @param {(module:twgl.ProgramInfo|module:twgl.UniformBlockSpec)} programInfo a `ProgramInfo`
 *     as returned from {@link module:twgl.createProgramInfo} or or `UniformBlockSpec` as
 *     returned from {@link module:twgl.createUniformBlockSpecFromProgram}.
 * @param {module:twgl.UniformBlockInfo} uniformBlockInfo a `UniformBlockInfo` as returned from
 *     {@link module:twgl.createUniformBlockInfo}.
 * @memberOf module:twgl/programs
 */
function setUniformBlock(gl, programInfo, uniformBlockInfo) {
  if (bindUniformBlock(gl, programInfo, uniformBlockInfo)) {
    gl.bufferSubData(UNIFORM_BUFFER, 0, uniformBlockInfo.asUint8, uniformBlockInfo.offset || 0, uniformBlockInfo.size || 0);
  }
}

/**
 * Sets values of a uniform block object
 *
 * @param {module:twgl.UniformBlockInfo} uniformBlockInfo A UniformBlockInfo as returned by {@link module:twgl.createUniformBlockInfo}.
 * @param {Object.<string, ?>} values A uniform name to value map where the value is correct for the given
 *    type of uniform. So for example given a block like
 *
 *       uniform SomeBlock {
 *         float someFloat;
 *         vec2 someVec2;
 *         vec3 someVec3Array[2];
 *         int someInt;
 *       }
 *
 *  You can set the values of the uniform block with
 *
 *       twgl.setBlockUniforms(someBlockInfo, {
 *          someFloat: 12.3,
 *          someVec2: [1, 2],
 *          someVec3Array: [1, 2, 3, 4, 5, 6],
 *          someInt: 5,
 *       }
 *
 *  Arrays can be JavaScript arrays or typed arrays
 *
 *  You can also fill out structure and array values either via
 *  shortcut. Example
 *
 *     // -- in shader --
 *     struct Light {
 *       float intensity;
 *       vec4 color;
 *       float nearFar[2];
 *     };
 *     uniform Lights {
 *       Light lights[2];
 *     };
 *
 *     // in JavaScript
 *
 *     twgl.setBlockUniforms(someBlockInfo, {
 *       lights: [
 *         { intensity: 5.0, color: [1, 0, 0, 1], nearFar[0.1, 10] },
 *         { intensity: 2.0, color: [0, 0, 1, 1], nearFar[0.2, 15] },
 *       ],
 *     });
 *
 *   or the more traditional way
 *
 *     twgl.setBlockUniforms(someBlockInfo, {
 *       "lights[0].intensity": 5.0,
 *       "lights[0].color": [1, 0, 0, 1],
 *       "lights[0].nearFar": [0.1, 10],
 *       "lights[1].intensity": 2.0,
 *       "lights[1].color": [0, 0, 1, 1],
 *       "lights[1].nearFar": [0.2, 15],
 *     });
 *
 *   You can also specify partial paths
 *
 *     twgl.setBlockUniforms(someBlockInfo, {
 *       'lights[1]': { intensity: 5.0, color: [1, 0, 0, 1], nearFar[0.2, 15] },
 *     });
 *
 *   But you can not specify leaf array indices.
 *
 *     twgl.setBlockUniforms(someBlockInfo, {
 *       'lights[1].nearFar[1]': 15,     // BAD! nearFar is a leaf
 *       'lights[1].nearFar': [0.2, 15], // GOOD
 *     });
 *
 *  **IMPORTANT!**, packing in a UniformBlock is unintuitive.
 *  For example the actual layout of `someVec3Array` above in memory
 *  is `1, 2, 3, unused, 4, 5, 6, unused`. twgl takes in 6 values
 *  as shown about and copies them, skipping the padding. This might
 *  be confusing if you're already familiar with Uniform blocks.
 *
 *  If you want to deal with the padding yourself you can access the array
 *  buffer views directly. eg:
 *
 *      someBlockInfo.someVec3Array.set([1, 2, 3, 0, 4, 5, 6, 0]);
 *
 *  Any name that doesn't match will be ignored
 * @memberOf module:twgl/programs
 */
function setBlockUniforms(uniformBlockInfo, values) {
  const setters = uniformBlockInfo.setters;
  for (const name in values) {
    const setter = setters[name];
    if (setter) {
      const value = values[name];
      setter(value);
    }
  }
}

function setUniformTree(tree, values) {
  for (const name in values) {
    const prop = tree[name];
    if (typeof prop === 'function') {
      prop(values[name]);
    } else {
      setUniformTree(tree[name], values[name]);
    }
  }
}

/**
 * Set uniforms and binds related textures.
 *
 * example:
 *
 *     const programInfo = createProgramInfo(
 *         gl, ["some-vs", "some-fs"]);
 *
 *     const tex1 = gl.createTexture();
 *     const tex2 = gl.createTexture();
 *
 *     ... assume we setup the textures with data ...
 *
 *     const uniforms = {
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
 *     gl.useProgram(programInfo.program);
 *
 * This will automatically bind the textures AND set the
 * uniforms.
 *
 *     twgl.setUniforms(programInfo, uniforms);
 *
 * For the example above it is equivalent to
 *
 *     let texUnit = 0;
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
 *     const uniforms = {
 *       u_someSampler: tex1,
 *       u_someOtherSampler: tex2,
 *     };
 *
 *     const moreUniforms {
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
 *     twgl.setUniforms(programInfo, uniforms);
 *     twgl.setUniforms(programInfo, moreUniforms);
 *
 * You can also add WebGLSamplers to uniform samplers as in
 *
 *     const uniforms = {
 *       u_someSampler: {
 *         texture: someWebGLTexture,
 *         sampler: someWebGLSampler,
 *       },
 *     };
 *
 * In which case both the sampler and texture will be bound to the
 * same unit.
 *
 * @param {(module:twgl.ProgramInfo|Object.<string, function>)} setters a `ProgramInfo` as returned from `createProgramInfo` or the setters returned from
 *        `createUniformSetters`.
 * @param {Object.<string, ?>} values an object with values for the
 *        uniforms.
 *   You can pass multiple objects by putting them in an array or by calling with more arguments.For example
 *
 *     const sharedUniforms = {
 *       u_fogNear: 10,
 *       u_projection: ...
 *       ...
 *     };
 *
 *     const localUniforms = {
 *       u_world: ...
 *       u_diffuseColor: ...
 *     };
 *
 *     twgl.setUniforms(programInfo, sharedUniforms, localUniforms);
 *
 *     // is the same as
 *
 *     twgl.setUniforms(programInfo, [sharedUniforms, localUniforms]);
 *
 *     // is the same as
 *
 *     twgl.setUniforms(programInfo, sharedUniforms);
 *     twgl.setUniforms(programInfo, localUniforms};
 *
 *   You can also fill out structure and array values either via
 *   shortcut. Example
 *
 *     // -- in shader --
 *     struct Light {
 *       float intensity;
 *       vec4 color;
 *       float nearFar[2];
 *     };
 *     uniform Light lights[2];
 *
 *     // in JavaScript
 *
 *     twgl.setUniforms(programInfo, {
 *       lights: [
 *         { intensity: 5.0, color: [1, 0, 0, 1], nearFar[0.1, 10] },
 *         { intensity: 2.0, color: [0, 0, 1, 1], nearFar[0.2, 15] },
 *       ],
 *     });
 *
 *   or the more traditional way
 *
 *     twgl.setUniforms(programInfo, {
 *       "lights[0].intensity": 5.0,
 *       "lights[0].color": [1, 0, 0, 1],
 *       "lights[0].nearFar": [0.1, 10],
 *       "lights[1].intensity": 2.0,
 *       "lights[1].color": [0, 0, 1, 1],
 *       "lights[1].nearFar": [0.2, 15],
 *     });
 *
 *   You can also specify partial paths
 *
 *     twgl.setUniforms(programInfo, {
 *       'lights[1]': { intensity: 5.0, color: [1, 0, 0, 1], nearFar[0.2, 15] },
 *     });
 *
 *   But you can not specify leaf array indices
 *
 *     twgl.setUniforms(programInfo, {
 *       'lights[1].nearFar[1]': 15,     // BAD! nearFar is a leaf
 *       'lights[1].nearFar': [0.2, 15], // GOOD
 *     });
 *
 * @memberOf module:twgl/programs
 */
function setUniforms(setters, ...args) {  // eslint-disable-line
  const actualSetters = setters.uniformSetters || setters;
  const numArgs = args.length;
  for (let aNdx = 0; aNdx < numArgs; ++aNdx) {
    const values = args[aNdx];
    if (Array.isArray(values)) {
      const numValues = values.length;
      for (let ii = 0; ii < numValues; ++ii) {
        setUniforms(actualSetters, values[ii]);
      }
    } else {
      for (const name in values) {
        const setter = actualSetters[name];
        if (setter) {
          setter(values[name]);
        }
      }
    }
  }
}

/**
 * Alias for `setUniforms`
 * @function
 * @param {(module:twgl.ProgramInfo|Object.<string, function>)} setters a `ProgramInfo` as returned from `createProgramInfo` or the setters returned from
 *        `createUniformSetters`.
 * @param {Object.<string, ?>} values an object with values for the
 * @memberOf module:twgl/programs
 */
const setUniformsAndBindTextures = setUniforms;

/**
 * Creates setter functions for all attributes of a shader
 * program. You can pass this to {@link module:twgl.setBuffersAndAttributes} to set all your buffers and attributes.
 *
 * @see {@link module:twgl.setAttributes} for example
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {WebGLProgram} program the program to create setters for.
 * @return {Object.<string, function>} an object with a setter for each attribute by name.
 * @memberOf module:twgl/programs
 */
function createAttributeSetters(gl, program) {
  const attribSetters = {
  };

  const numAttribs = gl.getProgramParameter(program, ACTIVE_ATTRIBUTES);
  for (let ii = 0; ii < numAttribs; ++ii) {
    const attribInfo = gl.getActiveAttrib(program, ii);
    if (isBuiltIn(attribInfo)) {
      continue;
    }
    const index = gl.getAttribLocation(program, attribInfo.name);
    const typeInfo = attrTypeMap[attribInfo.type];
    const setter = typeInfo.setter(gl, index, typeInfo);
    setter.location = index;
    attribSetters[attribInfo.name] = setter;
  }

  return attribSetters;
}

/**
 * Sets attributes and binds buffers (deprecated... use {@link module:twgl.setBuffersAndAttributes})
 *
 * Example:
 *
 *     const program = createProgramFromScripts(
 *         gl, ["some-vs", "some-fs");
 *
 *     const attribSetters = createAttributeSetters(program);
 *
 *     const positionBuffer = gl.createBuffer();
 *     const texcoordBuffer = gl.createBuffer();
 *
 *     const attribs = {
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
 * *   divisor: the divisor for instances. Default = undefined
 *
 * For example if you had 3 value float positions, 2 value
 * float texcoord and 4 value uint8 colors you'd setup your
 * attribs like this
 *
 *     const attribs = {
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
 * @memberOf module:twgl/programs
 * @deprecated use {@link module:twgl.setBuffersAndAttributes}
 * @private
 */
function setAttributes(setters, buffers) {
  for (const name in buffers) {
    const setter = setters[name];
    if (setter) {
      setter(buffers[name]);
    }
  }
}

/**
 * Sets attributes and buffers including the `ELEMENT_ARRAY_BUFFER` if appropriate
 *
 * Example:
 *
 *     const programInfo = createProgramInfo(
 *         gl, ["some-vs", "some-fs");
 *
 *     const arrays = {
 *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
 *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
 *     };
 *
 *     const bufferInfo = createBufferInfoFromArrays(gl, arrays);
 *
 *     gl.useProgram(programInfo.program);
 *
 * This will automatically bind the buffers AND set the
 * attributes.
 *
 *     setBuffersAndAttributes(gl, programInfo, bufferInfo);
 *
 * For the example above it is equivalent to
 *
 *     gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
 *     gl.enableVertexAttribArray(a_positionLocation);
 *     gl.vertexAttribPointer(a_positionLocation, 3, gl.FLOAT, false, 0, 0);
 *     gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
 *     gl.enableVertexAttribArray(a_texcoordLocation);
 *     gl.vertexAttribPointer(a_texcoordLocation, 4, gl.FLOAT, false, 0, 0);
 *
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext.
 * @param {(module:twgl.ProgramInfo|Object.<string, function>)} setters A `ProgramInfo` as returned from {@link module:twgl.createProgramInfo} or Attribute setters as returned from {@link module:twgl.createAttributeSetters}
 * @param {(module:twgl.BufferInfo|module:twgl.VertexArrayInfo)} buffers a `BufferInfo` as returned from {@link module:twgl.createBufferInfoFromArrays}.
 *   or a `VertexArrayInfo` as returned from {@link module:twgl.createVertexArrayInfo}
 * @memberOf module:twgl/programs
 */
function setBuffersAndAttributes(gl, programInfo, buffers) {
  if (buffers.vertexArrayObject) {
    gl.bindVertexArray(buffers.vertexArrayObject);
  } else {
    setAttributes(programInfo.attribSetters || programInfo, buffers.attribs);
    if (buffers.indices) {
      gl.bindBuffer(ELEMENT_ARRAY_BUFFER$1, buffers.indices);
    }
  }
}

/**
 * @typedef {Object} ProgramInfo
 * @property {WebGLProgram} program A shader program
 * @property {Object<string, WebGLUniformLocation>} uniformLocations The uniform locations of each uniform
 * @property {Object<string, number>} attribLocations The locations of each attribute
 * @property {Object<string, function>} uniformSetters object of setters as returned from createUniformSetters,
 * @property {Object<string, function>} attribSetters object of setters as returned from createAttribSetters,
 * @property {module:twgl.UniformBlockSpec} [uniformBlockSpec] a uniform block spec for making UniformBlockInfos with createUniformBlockInfo etc..
 * @property {Object<string, module:twgl.TransformFeedbackInfo>} [transformFeedbackInfo] info for transform feedbacks
 * @memberOf module:twgl
 */

/**
 * Creates a ProgramInfo from an existing program.
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
 * @param {WebGLProgram} program an existing WebGLProgram.
 * @return {module:twgl.ProgramInfo} The created ProgramInfo.
 * @memberOf module:twgl/programs
 */
function createProgramInfoFromProgram(gl, program) {
  const uniformSetters = createUniformSetters(gl, program);
  const attribSetters = createAttributeSetters(gl, program);
  const programInfo = {
    program,
    uniformSetters,
    attribSetters,
    uniformLocations: Object.fromEntries(Object.entries(uniformSetters).map(([k, v]) => [k, v.location])),
    attribLocations: Object.fromEntries(Object.entries(attribSetters).map(([k, v]) => [k, v.location])),
  };

  if (isWebGL2(gl)) {
    programInfo.uniformBlockSpec = createUniformBlockSpecFromProgram(gl, program);
    programInfo.transformFeedbackInfo = createTransformFeedbackInfo(gl, program);
  }

  return programInfo;
}

const notIdRE = /\s|{|}|;/;

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
 * NOTE: There are 4 signatures for this function
 *
 *     twgl.createProgramInfo(gl, [vs, fs], options);
 *     twgl.createProgramInfo(gl, [vs, fs], opt_errFunc);
 *     twgl.createProgramInfo(gl, [vs, fs], opt_attribs, opt_errFunc);
 *     twgl.createProgramInfo(gl, [vs, fs], opt_attribs, opt_locations, opt_errFunc);
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext
 *        to use.
 * @param {string[]} shaderSources Array of sources for the
 *        shaders or ids. The first is assumed to be the vertex shader,
 *        the second the fragment shader.
 * @param {module:twgl.ProgramOptions|string[]|module:twgl.ErrorCallback} [opt_attribs] Options for the program or an array of attribs names or an error callback. Locations will be assigned by index if not passed in
 * @param {number[]|module:twgl.ErrorCallback} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations or an error callback.
 * @param {module:twgl.ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @return {module:twgl.ProgramInfo?} The created ProgramInfo or null if it failed to link or compile
 * @memberOf module:twgl/programs
 */
function createProgramInfo(
    gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback) {
  const progOptions = getProgramOptions(opt_attribs, opt_locations, opt_errorCallback);
  const errors = [];
  shaderSources = shaderSources.map(function(source) {
    // Lets assume if there is no \n it's an id
    if (!notIdRE.test(source)) {
      const script = getElementById(source);
      if (!script) {
        const err = `no element with id: ${source}`;
        progOptions.errorCallback(err);
        errors.push(err);
      } else {
        source = script.text;
      }
    }
    return source;
  });

  if (errors.length) {
    return reportError(progOptions, '');
  }

  const origCallback = progOptions.callback;
  if (origCallback) {
    progOptions.callback = (err, program) => {
      origCallback(err, err ? undefined : createProgramInfoFromProgram(gl, program));
    };
  }

  const program = createProgramFromSources(gl, shaderSources, progOptions);
  if (!program) {
    return null;
  }

  return createProgramInfoFromProgram(gl, program);
}

function checkAllPrograms(gl, programs, programSpecs, noDeleteShadersSet, programOptions) {
  // check errors for everything.
  for (const [name, program] of Object.entries(programs)) {
    const options = {...programOptions};
    const spec = programSpecs[name];
    if (!Array.isArray(spec)) {
      Object.assign(options, spec);
    }
    const errors = getProgramErrors(gl, program, options.errorCallback);
    if (errors) {
      // delete everything we created
      for (const program of Object.values(programs)) {
        const shaders = gl.getAttachedShaders(program);
        gl.deleteProgram(program);
        for (const shader of shaders) {
          // Don't delete it if we didn't create it.
          if (!noDeleteShadersSet.has(shader)) {
            gl.deleteShader(shader);
          }
        }
      }
      return errors;
    }
  }

  return undefined;
}

/**
 * Creates multiple programs
 *
 * Note: the reason this function exists is because the fastest way to create multiple
 * programs in WebGL is to create and compile all shaders and link all programs and only
 * afterwards check if they succeeded. In that way, giving all your shaders
 *
 * @see {@link module:twgl.createProgram}
 *
 * Example:
 *
 *     const programs = twgl.createPrograms(gl, {
 *       lambert: [lambertVS, lambertFS],
 *       phong: [phongVS, phoneFS],
 *       particles: {
 *         shaders: [particlesVS, particlesFS],
 *         transformFeedbackVaryings: ['position', 'velocity'],
 *       },
 *     });
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {Object.<string, module:twgl.ProgramSpec>} programSpecs An object of ProgramSpecs, one per program.
 * @param {module:twgl.ProgramOptions} [programOptions] options to apply to all programs
 * @return {Object.<string, WebGLProgram>?} the created programInfos by name
 */
function createPrograms(gl, programSpecs, programOptions = {}) {
  // Remember existing shaders so that if there is an error we don't delete them
  const noDeleteShadersSet = new Set();

  // compile and link everything
  const programs = Object.fromEntries(Object.entries(programSpecs).map(([name, spec]) => {
    const options = {...programOptions};
    const shaders = Array.isArray(spec) ? spec : spec.shaders;
    if (!Array.isArray(spec)) {
      Object.assign(options, spec);
    }
    shaders.forEach(noDeleteShadersSet.add, noDeleteShadersSet);
    return [name, createProgramNoCheck(gl, shaders, options)];
  }));

  if (programOptions.callback) {
    waitForAllProgramsLinkCompletionAsync(gl, programs).then(() => {
      const errors = checkAllPrograms(gl, programs, programSpecs, noDeleteShadersSet, programOptions);
      programOptions.callback(errors, errors ? undefined : programs);
    });
    return undefined;
  }

  const errors = checkAllPrograms(gl, programs, programSpecs, noDeleteShadersSet, programOptions);
  return errors ? undefined : programs;
}

/**
 * Creates multiple programInfos
 *
 * Note: the reason this function exists is because the fastest way to create multiple
 * programs in WebGL is to create and compile all shaders and link all programs and only
 * afterwards check if they succeeded. In that way, giving all your shaders
 *
 * @see {@link module:twgl.createProgramInfo}
 *
 * Examples:
 *
 *     const programInfos = twgl.createProgramInfos(gl, {
 *       lambert: [lambertVS, lambertFS],
 *       phong: [phongVS, phoneFS],
 *       particles: {
 *         shaders: [particlesVS, particlesFS],
 *         transformFeedbackVaryings: ['position', 'velocity'],
 *       },
 *     });
 *
 * or
 *
 *     const {lambert, phong, particles} = twgl.createProgramInfos(gl, {
 *       lambert: [lambertVS, lambertFS],
 *       phong: [phongVS, phoneFS],
 *       particles: {
 *         shaders: [particlesVS, particlesFS],
 *         transformFeedbackVaryings: ['position', 'velocity'],
 *       },
 *     });
 *
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {Object.<string, module:twgl.ProgramSpec>} programSpecs An object of ProgramSpecs, one per program.
 * @param {module:twgl.ProgramOptions} [programOptions] options to apply to all programs
 * @return {Object.<string, module:twgl.ProgramInfo>?} the created programInfos by name
 */
function createProgramInfos(gl, programSpecs, programOptions) {
  programOptions = getProgramOptions(programOptions);

  function createProgramInfosForPrograms(gl, programs) {
    return Object.fromEntries(Object.entries(programs).map(([name, program]) =>
      [name, createProgramInfoFromProgram(gl, program)]
    ));
  }

  const origCallback = programOptions.callback;
  if (origCallback) {
    programOptions.callback = (err, programs) => {
      origCallback(err, err ? undefined : createProgramInfosForPrograms(gl, programs));
    };
  }

  const programs = createPrograms(gl, programSpecs, programOptions);
  if (origCallback || !programs) {
    return undefined;
  }

  return createProgramInfosForPrograms(gl, programs);
}

/**
 * Creates multiple programs asynchronously
 *
 * @see {@link module:twgl.createProgramAsync}
 *
 * Example:
 *
 *     const programs = await twgl.createProgramsAsync(gl, {
 *       lambert: [lambertVS, lambertFS],
 *       phong: [phongVS, phoneFS],
 *       particles: {
 *         shaders: [particlesVS, particlesFS],
 *         transformFeedbackVaryings: ['position', 'velocity'],
 *       },
 *     });
 *
 * @function
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {Object.<string, module:twgl.ProgramSpec>} programSpecs An object of ProgramSpecs, one per program.
 * @param {module:twgl.ProgramOptions} [programOptions] options to apply to all programs
 * @return {Object.<string, WebGLProgram>?} the created programInfos by name
 */
const createProgramsAsync = wrapCallbackFnToAsyncFn(createPrograms);

/**
 * Creates multiple programInfos asynchronously
 *
 * @see {@link module:twgl.createProgramInfoAsync}
 *
 * Example:
 *
 *     const programInfos = await twgl.createProgramInfosAsync(gl, {
 *       lambert: [lambertVS, lambertFS],
 *       phong: [phongVS, phoneFS],
 *       particles: {
 *         shaders: [particlesVS, particlesFS],
 *         transformFeedbackVaryings: ['position', 'velocity'],
 *       },
 *     });
 *
 * @function
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {Object.<string, module:twgl.ProgramSpec>} programSpecs An object of ProgramSpecs, one per program.
 * @param {module:twgl.ProgramOptions} [programOptions] options to apply to all programs
 * @return {Promise<Object.<string, module:twgl.ProgramInfo>>} the created programInfos by name
 */
const createProgramInfosAsync = wrapCallbackFnToAsyncFn(createProgramInfos);

var programs = /*#__PURE__*/Object.freeze({
  __proto__: null,
  createAttributeSetters: createAttributeSetters,
  createProgram: createProgram,
  createProgramAsync: createProgramAsync,
  createPrograms: createPrograms,
  createProgramsAsync: createProgramsAsync,
  createProgramFromScripts: createProgramFromScripts,
  createProgramFromSources: createProgramFromSources,
  createProgramInfo: createProgramInfo,
  createProgramInfoAsync: createProgramInfoAsync,
  createProgramInfos: createProgramInfos,
  createProgramInfosAsync: createProgramInfosAsync,
  createProgramInfoFromProgram: createProgramInfoFromProgram,
  createUniformSetters: createUniformSetters,
  createUniformBlockSpecFromProgram: createUniformBlockSpecFromProgram,
  createUniformBlockInfoFromProgram: createUniformBlockInfoFromProgram,
  createUniformBlockInfo: createUniformBlockInfo,
  createTransformFeedback: createTransformFeedback,
  createTransformFeedbackInfo: createTransformFeedbackInfo,
  bindTransformFeedbackInfo: bindTransformFeedbackInfo,
  setAttributes: setAttributes,
  setBuffersAndAttributes: setBuffersAndAttributes,
  setUniforms: setUniforms,
  setUniformsAndBindTextures: setUniformsAndBindTextures,
  setUniformBlock: setUniformBlock,
  setBlockUniforms: setBlockUniforms,
  bindUniformBlock: bindUniformBlock
});

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

const TRIANGLES                      = 0x0004;
const UNSIGNED_SHORT                 = 0x1403;

/**
 * Drawing related functions
 *
 * For backward compatibility they are available at both `twgl.draw` and `twgl`
 * itself
 *
 * See {@link module:twgl} for core functions
 *
 * @module twgl/draw
 */

/**
 * Calls `gl.drawElements` or `gl.drawArrays`, whichever is appropriate
 *
 * normally you'd call `gl.drawElements` or `gl.drawArrays` yourself
 * but calling this means if you switch from indexed data to non-indexed
 * data you don't have to remember to update your draw call.
 *
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @param {(module:twgl.BufferInfo|module:twgl.VertexArrayInfo)} bufferInfo A BufferInfo as returned from {@link module:twgl.createBufferInfoFromArrays} or
 *   a VertexArrayInfo as returned from {@link module:twgl.createVertexArrayInfo}
 * @param {number} [type] eg (gl.TRIANGLES, gl.LINES, gl.POINTS, gl.TRIANGLE_STRIP, ...). Defaults to `gl.TRIANGLES`
 * @param {number} [count] An optional count. Defaults to bufferInfo.numElements
 * @param {number} [offset] An optional offset. Defaults to 0.
 * @param {number} [instanceCount] An optional instanceCount. if set then `drawArraysInstanced` or `drawElementsInstanced` will be called
 * @memberOf module:twgl/draw
 */
function drawBufferInfo(gl, bufferInfo, type, count, offset, instanceCount) {
  type = type === undefined ? TRIANGLES : type;
  const indices = bufferInfo.indices;
  const elementType = bufferInfo.elementType;
  const numElements = count === undefined ? bufferInfo.numElements : count;
  offset = offset === undefined ? 0 : offset;
  if (elementType || indices) {
    if (instanceCount !== undefined) {
      gl.drawElementsInstanced(type, numElements, elementType === undefined ? UNSIGNED_SHORT : bufferInfo.elementType, offset, instanceCount);
    } else {
      gl.drawElements(type, numElements, elementType === undefined ? UNSIGNED_SHORT : bufferInfo.elementType, offset);
    }
  } else {
    if (instanceCount !== undefined) {
      gl.drawArraysInstanced(type, offset, numElements, instanceCount);
    } else {
      gl.drawArrays(type, offset, numElements);
    }
  }
}

/**
 * A DrawObject is useful for putting objects in to an array and passing them to {@link module:twgl.drawObjectList}.
 *
 * You need either a `BufferInfo` or a `VertexArrayInfo`.
 *
 * @typedef {Object} DrawObject
 * @property {boolean} [active] whether or not to draw. Default = `true` (must be `false` to be not true). In other words `undefined` = `true`
 * @property {number} [type] type to draw eg. `gl.TRIANGLES`, `gl.LINES`, etc...
 * @property {module:twgl.ProgramInfo} programInfo A ProgramInfo as returned from {@link module:twgl.createProgramInfo}
 * @property {module:twgl.BufferInfo} [bufferInfo] A BufferInfo as returned from {@link module:twgl.createBufferInfoFromArrays}
 * @property {module:twgl.VertexArrayInfo} [vertexArrayInfo] A VertexArrayInfo as returned from {@link module:twgl.createVertexArrayInfo}
 * @property {Object<string, ?>} uniforms The values for the uniforms.
 *   You can pass multiple objects by putting them in an array. For example
 *
 *     var sharedUniforms = {
 *       u_fogNear: 10,
 *       u_projection: ...
 *       ...
 *     };
 *
 *     var localUniforms = {
 *       u_world: ...
 *       u_diffuseColor: ...
 *     };
 *
 *     var drawObj = {
 *       ...
 *       uniforms: [sharedUniforms, localUniforms],
 *     };
 *
 * @property {number} [offset] the offset to pass to `gl.drawArrays` or `gl.drawElements`. Defaults to 0.
 * @property {number} [count] the count to pass to `gl.drawArrays` or `gl.drawElements`. Defaults to bufferInfo.numElements.
 * @property {number} [instanceCount] the number of instances. Defaults to undefined.
 * @memberOf module:twgl
 */

/**
 * Draws a list of objects
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @param {DrawObject[]} objectsToDraw an array of objects to draw.
 * @memberOf module:twgl/draw
 */
function drawObjectList(gl, objectsToDraw) {
  let lastUsedProgramInfo = null;
  let lastUsedBufferInfo = null;

  objectsToDraw.forEach(function(object) {
    if (object.active === false) {
      return;
    }

    const programInfo = object.programInfo;
    const bufferInfo = object.vertexArrayInfo || object.bufferInfo;
    let bindBuffers = false;
    const type = object.type === undefined ? TRIANGLES : object.type;

    if (programInfo !== lastUsedProgramInfo) {
      lastUsedProgramInfo = programInfo;
      gl.useProgram(programInfo.program);

      // We have to rebind buffers when changing programs because we
      // only bind buffers the program uses. So if 2 programs use the same
      // bufferInfo but the 1st one uses only positions the when the
      // we switch to the 2nd one some of the attributes will not be on.
      bindBuffers = true;
    }

    // Setup all the needed attributes.
    if (bindBuffers || bufferInfo !== lastUsedBufferInfo) {
      if (lastUsedBufferInfo && lastUsedBufferInfo.vertexArrayObject && !bufferInfo.vertexArrayObject) {
        gl.bindVertexArray(null);
      }
      lastUsedBufferInfo = bufferInfo;
      setBuffersAndAttributes(gl, programInfo, bufferInfo);
    }

    // Set the uniforms.
    setUniforms(programInfo, object.uniforms);

    // Draw
    drawBufferInfo(gl, bufferInfo, type, object.count, object.offset, object.instanceCount);
  });

  if (lastUsedBufferInfo && lastUsedBufferInfo.vertexArrayObject) {
    gl.bindVertexArray(null);
  }
}

var draw = /*#__PURE__*/Object.freeze({
  __proto__: null,
  drawBufferInfo: drawBufferInfo,
  drawObjectList: drawObjectList
});

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
        attachment = createTexture(gl, textureOptions);
      }
    }
    if (isRenderbuffer(gl, attachment)) {
      gl.framebufferRenderbuffer(target, attachmentPoint, RENDERBUFFER, attachment);
    } else if (isTexture(gl, attachment)) {
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
    if (samples !== undefined || isRenderbuffer(gl, attachment)) {
      gl.bindRenderbuffer(RENDERBUFFER, attachment);
      if (samples > 1) {
        gl.renderbufferStorageMultisample(RENDERBUFFER, samples, format, width, height);
      } else {
        gl.renderbufferStorage(RENDERBUFFER, format, width, height);
      }
    } else if (isTexture(gl, attachment)) {
      resizeTexture(gl, attachment, attachmentOptions, width, height);
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

var framebuffers = /*#__PURE__*/Object.freeze({
  __proto__: null,
  bindFramebufferInfo: bindFramebufferInfo,
  createFramebufferInfo: createFramebufferInfo,
  resizeFramebufferInfo: resizeFramebufferInfo
});

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

/**
 * vertex array object related functions
 *
 * You should generally not need to use these functions. They are provided
 * for those cases where you're doing something out of the ordinary
 * and you need lower level access.
 *
 * For backward compatibility they are available at both `twgl.attributes` and `twgl`
 * itself
 *
 * See {@link module:twgl} for core functions
 *
 * @module twgl/vertexArrays
 */

const ELEMENT_ARRAY_BUFFER           = 0x8893;

/**
 * @typedef {Object} VertexArrayInfo
 * @property {number} numElements The number of elements to pass to `gl.drawArrays` or `gl.drawElements`.
 * @property {number} [elementType] The type of indices `UNSIGNED_BYTE`, `UNSIGNED_SHORT` etc..
 * @property {WebGLVertexArrayObject} [vertexArrayObject] a vertex array object
 * @memberOf module:twgl
 */

/**
 * Creates a VertexArrayInfo from a BufferInfo and one or more ProgramInfos
 *
 * This can be passed to {@link module:twgl.setBuffersAndAttributes} and to
 * {@link module:twgl:drawBufferInfo}.
 *
 * > **IMPORTANT:** Vertex Array Objects are **not** a direct analog for a BufferInfo. Vertex Array Objects
 *   assign buffers to specific attributes at creation time. That means they can only be used with programs
 *   who's attributes use the same attribute locations for the same purposes.
 *
 * > Bind your attribute locations by passing an array of attribute names to {@link module:twgl.createProgramInfo}
 *   or use WebGL 2's GLSL ES 3's `layout(location = <num>)` to make sure locations match.
 *
 * also
 *
 * > **IMPORTANT:** After calling twgl.setBuffersAndAttribute with a BufferInfo that uses a Vertex Array Object
 *   that Vertex Array Object will be bound. That means **ANY MANIPULATION OF ELEMENT_ARRAY_BUFFER or ATTRIBUTES**
 *   will affect the Vertex Array Object state.
 *
 * > Call `gl.bindVertexArray(null)` to get back manipulating the global attributes and ELEMENT_ARRAY_BUFFER.
 *
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @param {module:twgl.ProgramInfo|module:twgl.ProgramInfo[]} programInfo a programInfo or array of programInfos
 * @param {module:twgl.BufferInfo} bufferInfo BufferInfo as returned from createBufferInfoFromArrays etc...
 *
 *    You need to make sure every attribute that will be used is bound. So for example assume shader 1
 *    uses attributes A, B, C and shader 2 uses attributes A, B, D. If you only pass in the programInfo
 *    for shader 1 then only attributes A, B, and C will have their attributes set because TWGL doesn't
 *    now attribute D's location.
 *
 *    So, you can pass in both shader 1 and shader 2's programInfo
 *
 * @return {module:twgl.VertexArrayInfo} The created VertexArrayInfo
 *
 * @memberOf module:twgl/vertexArrays
 */
function createVertexArrayInfo(gl, programInfos, bufferInfo) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  if (!programInfos.length) {
    programInfos = [programInfos];
  }
  programInfos.forEach(function(programInfo) {
    setBuffersAndAttributes(gl, programInfo, bufferInfo);
  });
  gl.bindVertexArray(null);
  return {
    numElements: bufferInfo.numElements,
    elementType: bufferInfo.elementType,
    vertexArrayObject: vao,
  };
}

/**
 * Creates a vertex array object and then sets the attributes on it
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {Object.<string, function>} setters Attribute setters as returned from createAttributeSetters
 * @param {Object.<string, module:twgl.AttribInfo>} attribs AttribInfos mapped by attribute name.
 * @param {WebGLBuffer} [indices] an optional ELEMENT_ARRAY_BUFFER of indices
 *
 * @return {WebGLVertexArrayObject|null} The created WebGLVertexArrayObject
 *
 * @memberOf module:twgl/vertexArrays
 */
function createVAOAndSetAttributes(gl, setters, attribs, indices) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  setAttributes(setters, attribs);
  if (indices) {
    gl.bindBuffer(ELEMENT_ARRAY_BUFFER, indices);
  }
  // We unbind this because otherwise any change to ELEMENT_ARRAY_BUFFER
  // like when creating buffers for other stuff will mess up this VAO's binding
  gl.bindVertexArray(null);
  return vao;
}

/**
 * Creates a vertex array object and then sets the attributes
 * on it
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext
 *        to use.
 * @param {Object.<string, function>| module:twgl.ProgramInfo} programInfo as returned from createProgramInfo or Attribute setters as returned from createAttributeSetters
 * @param {module:twgl.BufferInfo} bufferInfo BufferInfo as returned from createBufferInfoFromArrays etc...
 * @param {WebGLBuffer} [indices] an optional ELEMENT_ARRAY_BUFFER of indices
 *
 * @return {WebGLVertexArrayObject|null} The created WebGLVertexArrayObject
 *
 * @memberOf module:twgl/vertexArrays
 */
function createVAOFromBufferInfo(gl, programInfo, bufferInfo) {
  return createVAOAndSetAttributes(gl, programInfo.attribSetters || programInfo, bufferInfo.attribs, bufferInfo.indices);
}

var vertexArrays = /*#__PURE__*/Object.freeze({
  __proto__: null,
  createVertexArrayInfo: createVertexArrayInfo,
  createVAOAndSetAttributes: createVAOAndSetAttributes,
  createVAOFromBufferInfo: createVAOFromBufferInfo
});

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
const defaults = {
  addExtensionsToContext: true,
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
 * @property {string} [attribPrefix] The prefix to stick on attributes
 *
 *   When writing shaders I prefer to name attributes with `a_`, uniforms with `u_` and varyings with `v_`
 *   as it makes it clear where they came from. But, when building geometry I prefer using un-prefixed names.
 *
 *   In other words I'll create arrays of geometry like this
 *
 *       const arrays = {
 *         position: ...
 *         normal: ...
 *         texcoord: ...
 *       };
 *
 *   But need those mapped to attributes and my attributes start with `a_`.
 *
 *   Default: `""`
 *
 * @property {number[]} [textureColor] Array of 4 values in the range 0 to 1
 *
 *   The default texture color is used when loading textures from
 *   urls. Because the URL will be loaded async we'd like to be
 *   able to use the texture immediately. By putting a 1x1 pixel
 *   color in the texture we can start using the texture before
 *   the URL has loaded.
 *
 *   Default: `[0.5, 0.75, 1, 1]`
 *
 * @property {string} [crossOrigin]
 *
 *   If not undefined sets the crossOrigin attribute on images
 *   that twgl creates when downloading images for textures.
 *
 *   Also see {@link module:twgl.TextureOptions}.
 *
 * @property {bool} [addExtensionsToContext]
 *
 *   If true, then, when twgl will try to add any supported WebGL extensions
 *   directly to the context under their normal GL names. For example
 *   if ANGLE_instances_arrays exists then twgl would enable it,
 *   add the functions `vertexAttribDivisor`, `drawArraysInstanced`,
 *   `drawElementsInstanced`, and the constant `VERTEX_ATTRIB_ARRAY_DIVISOR`
 *   to the `WebGLRenderingContext`.
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
  copyExistingProperties(newDefaults, defaults);
  setDefaults$2(newDefaults);  // eslint-disable-line
  setDefaults$1(newDefaults);  // eslint-disable-line
}

const prefixRE = /^(.*?)_/;
function addExtensionToContext(gl, extensionName) {
  glEnumToString(gl, 0);
  const ext = gl.getExtension(extensionName);
  if (ext) {
    const enums = {};
    const fnSuffix = prefixRE.exec(extensionName)[1];
    const enumSuffix = '_' + fnSuffix;
    for (const key in ext) {
      const value = ext[key];
      const isFunc = typeof (value) === 'function';
      const suffix = isFunc ? fnSuffix : enumSuffix;
      let name = key;
      // examples of where this is not true are WEBGL_compressed_texture_s3tc
      // and WEBGL_compressed_texture_pvrtc
      if (key.endsWith(suffix)) {
        name = key.substring(0, key.length - suffix.length);
      }
      if (gl[name] !== undefined) {
        if (!isFunc && gl[name] !== value) {
          warn$1(name, gl[name], value, key);
        }
      } else {
        if (isFunc) {
          gl[name] = function(origFn) {
            return function() {
              return origFn.apply(ext, arguments);
            };
          }(value);
        } else {
          gl[name] = value;
          enums[name] = value;
        }
      }
    }
    // pass the modified enums to glEnumToString
    enums.constructor = {
      name: ext.constructor.name,
    };
    glEnumToString(enums, 0);
  }
  return ext;
}

/*
 * If you're wondering why the code doesn't just iterate
 * over all extensions using `gl.getExtensions` is that it's possible
 * some future extension is incompatible with this code. Rather than
 * have thing suddenly break it seems better to manually add to this
 * list.
 *
 */
const supportedExtensions = [
  'ANGLE_instanced_arrays',
  'EXT_blend_minmax',
  'EXT_color_buffer_float',
  'EXT_color_buffer_half_float',
  'EXT_disjoint_timer_query',
  'EXT_disjoint_timer_query_webgl2',
  'EXT_frag_depth',
  'EXT_sRGB',
  'EXT_shader_texture_lod',
  'EXT_texture_filter_anisotropic',
  'OES_element_index_uint',
  'OES_standard_derivatives',
  'OES_texture_float',
  'OES_texture_float_linear',
  'OES_texture_half_float',
  'OES_texture_half_float_linear',
  'OES_vertex_array_object',
  'WEBGL_color_buffer_float',
  'WEBGL_compressed_texture_atc',
  'WEBGL_compressed_texture_etc1',
  'WEBGL_compressed_texture_pvrtc',
  'WEBGL_compressed_texture_s3tc',
  'WEBGL_compressed_texture_s3tc_srgb',
  'WEBGL_depth_texture',
  'WEBGL_draw_buffers',
];

/**
 * Attempts to enable all of the following extensions
 * and add their functions and constants to the
 * `WebGLRenderingContext` using their normal non-extension like names.
 *
 *      ANGLE_instanced_arrays
 *      EXT_blend_minmax
 *      EXT_color_buffer_float
 *      EXT_color_buffer_half_float
 *      EXT_disjoint_timer_query
 *      EXT_disjoint_timer_query_webgl2
 *      EXT_frag_depth
 *      EXT_sRGB
 *      EXT_shader_texture_lod
 *      EXT_texture_filter_anisotropic
 *      OES_element_index_uint
 *      OES_standard_derivatives
 *      OES_texture_float
 *      OES_texture_float_linear
 *      OES_texture_half_float
 *      OES_texture_half_float_linear
 *      OES_vertex_array_object
 *      WEBGL_color_buffer_float
 *      WEBGL_compressed_texture_atc
 *      WEBGL_compressed_texture_etc1
 *      WEBGL_compressed_texture_pvrtc
 *      WEBGL_compressed_texture_s3tc
 *      WEBGL_compressed_texture_s3tc_srgb
 *      WEBGL_depth_texture
 *      WEBGL_draw_buffers
 *
 * For example if `ANGLE_instanced_arrays` exists then the functions
 * `drawArraysInstanced`, `drawElementsInstanced`, `vertexAttribDivisor`
 * and the constant `VERTEX_ATTRIB_ARRAY_DIVISOR` are added to the
 * `WebGLRenderingContext`.
 *
 * Note that if you want to know if the extension exists you should
 * probably call `gl.getExtension` for each extension. Alternatively
 * you can check for the existence of the functions or constants that
 * are expected to be added. For example
 *
 *    if (gl.drawBuffers) {
 *      // Either WEBGL_draw_buffers was enabled OR you're running in WebGL2
 *      ....
 *
 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
 * @memberOf module:twgl
 */
function addExtensionsToContext(gl) {
  for (let ii = 0; ii < supportedExtensions.length; ++ii) {
    addExtensionToContext(gl, supportedExtensions[ii]);
  }
}

/**
 * Creates a webgl context.
 * @param {HTMLCanvasElement} canvas The canvas tag to get
 *     context from. If one is not passed in one will be
 *     created.
 * @return {WebGLRenderingContext} The created context.
 * @private
 */
function create3DContext(canvas, opt_attribs) {
  const names = ["webgl", "experimental-webgl"];
  let context = null;
  for (let ii = 0; ii < names.length; ++ii) {
    context = canvas.getContext(names[ii], opt_attribs);
    if (context) {
      if (defaults.addExtensionsToContext) {
        addExtensionsToContext(context);
      }
      break;
    }
  }
  return context;
}

/**
 * Gets a WebGL1 context.
 *
 * Note: Will attempt to enable Vertex Array Objects
 * and add WebGL2 entry points. (unless you first set defaults with
 * `twgl.setDefaults({enableVertexArrayObjects: false})`;
 *
 * @param {HTMLCanvasElement} canvas a canvas element.
 * @param {WebGLContextAttributes} [opt_attribs] optional webgl context creation attributes
 * @return {WebGLRenderingContext} The created context.
 * @memberOf module:twgl
 * @deprecated
 * @private
 */
function getWebGLContext(canvas, opt_attribs) {
  const gl = create3DContext(canvas, opt_attribs);
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
  const names = ["webgl2", "webgl", "experimental-webgl"];
  let context = null;
  for (let ii = 0; ii < names.length; ++ii) {
    context = canvas.getContext(names[ii], opt_attribs);
    if (context) {
      if (defaults.addExtensionsToContext) {
        addExtensionsToContext(context);
      }
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
 * Note: For a WebGL1 context will attempt to enable Vertex Array Objects
 * and add WebGL2 entry points. (unless you first set defaults with
 * `twgl.setDefaults({enableVertexArrayObjects: false})`;
 *
 * @param {HTMLCanvasElement} canvas a canvas element.
 * @param {WebGLContextAttributes} [opt_attribs] optional webgl context creation attributes
 * @return {WebGLRenderingContext} The created context.
 * @memberOf module:twgl
 */
function getContext(canvas, opt_attribs) {
  const gl = createContext(canvas, opt_attribs);
  return gl;
}

/**
 * Resize a canvas to match the size it's displayed.
 * @param {HTMLCanvasElement} canvas The canvas to resize.
 * @param {number} [multiplier] So you can pass in `window.devicePixelRatio` or other scale value if you want to.
 * @return {boolean} true if the canvas was resized.
 * @memberOf module:twgl
 */
function resizeCanvasToDisplaySize(canvas, multiplier) {
  multiplier = multiplier || 1;
  multiplier = Math.max(0, multiplier);
  const width  = canvas.clientWidth  * multiplier | 0;
  const height = canvas.clientHeight * multiplier | 0;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
}

export { addExtensionsToContext, attributes, bindFramebufferInfo, bindTransformFeedbackInfo, bindUniformBlock, canFilter, canGenerateMipmap, createAttribsFromArrays, createAttributeSetters, createBufferFromArray, createBufferFromTypedArray, createBufferInfoFromArrays, createBuffersFromArrays, createFramebufferInfo, createProgram, createProgramAsync, createProgramFromScripts, createProgramFromSources, createProgramInfo, createProgramInfoAsync, createProgramInfoFromProgram, createProgramInfos, createProgramInfosAsync, createPrograms, createProgramsAsync, createSampler, createSamplers, createTexture, createTextures, createTransformFeedback, createTransformFeedbackInfo, createUniformBlockInfo, createUniformBlockInfoFromProgram, createUniformBlockSpecFromProgram, createUniformSetters, createVAOAndSetAttributes, createVAOFromBufferInfo, createVertexArrayInfo, draw, drawBufferInfo, drawObjectList, framebuffers, getArray as getArray_, getBytesPerElementForInternalFormat, getContext, getFormatAndTypeForInternalFormat, getGLTypeForTypedArray, getGLTypeForTypedArrayType, getNumComponentsForFormat, getNumComponents as getNumComponents_, getTypedArrayTypeForGLType, getWebGLContext, glEnumToString, isArrayBuffer$1 as isArrayBuffer, isWebGL1, isWebGL2, loadTextureFromUrl, programs, resizeCanvasToDisplaySize, resizeFramebufferInfo, resizeTexture, setAttribInfoBufferFromArray, setDefaults$2 as setAttributeDefaults_, setAttributePrefix, setAttributes, setBlockUniforms, setBuffersAndAttributes, setDefaultTextureColor, setDefaults, setEmptyTexture, setSamplerParameters, setDefaults$1 as setTextureDefaults_, setTextureFilteringForSize, setTextureFromArray, setTextureFromElement, setTextureParameters, setUniformBlock, setUniforms, setUniformsAndBindTextures, textures, typedarrays, utils, vertexArrays };
