/*!
 * @license twgl.js 7.0.0 Copyright (c) 2015, Gregg Tavares All Rights Reserved.
 * Available via the MIT license.
 * see: http://github.com/greggman/twgl.js for details
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["twgl"] = factory();
	else
		root["twgl"] = factory();
})(typeof self !== 'undefined' ? self : this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/attributes.js":
/*!***************************!*\
  !*** ./src/attributes.js ***!
  \***************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
exports.__esModule = true;
exports.createAttribsFromArrays = createAttribsFromArrays;
exports.createBufferFromArray = createBufferFromArray;
exports.createBufferFromTypedArray = createBufferFromTypedArray;
exports.createBufferInfoFromArrays = createBufferInfoFromArrays;
exports.createBuffersFromArrays = createBuffersFromArrays;
exports.getArray_ = getArray;
exports.getNumComponents_ = getNumComponents;
exports.setAttribInfoBufferFromArray = setAttribInfoBufferFromArray;
exports.setAttributeDefaults_ = setDefaults;
exports.setAttributePrefix = setAttributePrefix;
var typedArrays = _interopRequireWildcard(__webpack_require__(/*! ./typedarrays.js */ "./src/typedarrays.js"));
var helper = _interopRequireWildcard(__webpack_require__(/*! ./helper.js */ "./src/helper.js"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
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

var STATIC_DRAW = 0x88e4;
var ARRAY_BUFFER = 0x8892;
var ELEMENT_ARRAY_BUFFER = 0x8893;
var BUFFER_SIZE = 0x8764;
var BYTE = 0x1400;
var UNSIGNED_BYTE = 0x1401;
var SHORT = 0x1402;
var UNSIGNED_SHORT = 0x1403;
var INT = 0x1404;
var UNSIGNED_INT = 0x1405;
var FLOAT = 0x1406;

/**
 * Low level attribute and buffer related functions
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
 * @module twgl/attributes
 */

// make sure we don't see a global gl
var gl = undefined; /* eslint-disable-line */
var defaults = {
  attribPrefix: ""
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
  defaults.attribPrefix = prefix;
}
function setDefaults(newDefaults) {
  helper.copyExistingProperties(newDefaults, defaults);
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
  if (helper.isBuffer(gl, typedArray)) {
    return typedArray;
  }
  type = type || ARRAY_BUFFER;
  var buffer = gl.createBuffer();
  setBufferFromTypedArray(gl, type, buffer, typedArray, drawType);
  return buffer;
}
function isIndices(name) {
  return name === "indices";
}

// This is really just a guess. Though I can't really imagine using
// anything else? Maybe for some compression?
function getNormalizationForTypedArrayType(typedArrayType) {
  if (typedArrayType === Int8Array) {
    return true;
  } // eslint-disable-line
  if (typedArrayType === Uint8Array) {
    return true;
  } // eslint-disable-line
  return false;
}
function getArray(array) {
  return array.length ? array : array.data;
}
var texcoordRE = /coord|texture/i;
var colorRE = /color|colour/i;
function guessNumComponentsFromName(name, length) {
  var numComponents;
  if (texcoordRE.test(name)) {
    numComponents = 2;
  } else if (colorRE.test(name)) {
    numComponents = 4;
  } else {
    numComponents = 3; // position, normals, indices ...
  }
  if (length % numComponents > 0) {
    throw new Error("Can not guess numComponents for attribute '".concat(name, "'. Tried ").concat(numComponents, " but ").concat(length, " values is not evenly divisible by ").concat(numComponents, ". You should specify it."));
  }
  return numComponents;
}
function getNumComponents(array, arrayName, numValues) {
  return array.numComponents || array.size || guessNumComponentsFromName(arrayName, numValues || getArray(array).length);
}
function makeTypedArray(array, name) {
  if (typedArrays.isArrayBuffer(array)) {
    return array;
  }
  if (typedArrays.isArrayBuffer(array.data)) {
    return array.data;
  }
  if (Array.isArray(array)) {
    array = {
      data: array
    };
  }
  var Type = array.type ? typedArrayTypeFromGLTypeOrTypedArrayCtor(array.type) : undefined;
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
  return typeof glTypeOrTypedArrayCtor === 'number' ? glTypeOrTypedArrayCtor : glTypeOrTypedArrayCtor ? typedArrays.getGLTypeForTypedArrayType(glTypeOrTypedArrayCtor) : FLOAT;
}
function typedArrayTypeFromGLTypeOrTypedArrayCtor(glTypeOrTypedArrayCtor) {
  return typeof glTypeOrTypedArrayCtor === 'number' ? typedArrays.getTypedArrayTypeForGLType(glTypeOrTypedArrayCtor) : glTypeOrTypedArrayCtor || Float32Array;
}
function attribBufferFromBuffer(gl, array /*, arrayName */) {
  return {
    buffer: array.buffer,
    numValues: 2 * 3 * 4,
    // safely divided by 2, 3, 4
    type: glTypeFromGLTypeOrTypedArrayType(array.type),
    arrayType: typedArrayTypeFromGLTypeOrTypedArrayCtor(array.type)
  };
}
function attribBufferFromSize(gl, array /*, arrayName*/) {
  var numValues = array.data || array;
  var arrayType = typedArrayTypeFromGLTypeOrTypedArrayCtor(array.type);
  var numBytes = numValues * arrayType.BYTES_PER_ELEMENT;
  var buffer = gl.createBuffer();
  gl.bindBuffer(ARRAY_BUFFER, buffer);
  gl.bufferData(ARRAY_BUFFER, numBytes, array.drawType || STATIC_DRAW);
  return {
    buffer: buffer,
    numValues: numValues,
    type: typedArrays.getGLTypeForTypedArrayType(arrayType),
    arrayType: arrayType
  };
}
function attribBufferFromArrayLike(gl, array, arrayName) {
  var typedArray = makeTypedArray(array, arrayName);
  return {
    arrayType: typedArray.constructor,
    buffer: createBufferFromTypedArray(gl, typedArray, undefined, array.drawType),
    type: typedArrays.getGLTypeForTypedArray(typedArray),
    numValues: 0
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
  var attribs = {};
  Object.keys(arrays).forEach(function (arrayName) {
    if (!isIndices(arrayName)) {
      var array = arrays[arrayName];
      var attribName = array.attrib || array.name || array.attribName || defaults.attribPrefix + arrayName;
      if (array.value) {
        if (!Array.isArray(array.value) && !typedArrays.isArrayBuffer(array.value)) {
          throw new Error('array.value is not array or typedarray');
        }
        attribs[attribName] = {
          value: array.value
        };
      } else {
        var fn;
        if (array.buffer && array.buffer instanceof WebGLBuffer) {
          fn = attribBufferFromBuffer;
        } else if (typeof array === "number" || typeof array.data === "number") {
          fn = attribBufferFromSize;
        } else {
          fn = attribBufferFromArrayLike;
        }
        var _fn = fn(gl, array, arrayName),
          buffer = _fn.buffer,
          type = _fn.type,
          numValues = _fn.numValues,
          arrayType = _fn.arrayType;
        var normalization = array.normalize !== undefined ? array.normalize : getNormalizationForTypedArrayType(arrayType);
        var numComponents = getNumComponents(array, arrayName, numValues);
        attribs[attribName] = {
          buffer: buffer,
          numComponents: numComponents,
          type: type,
          normalize: normalization,
          stride: array.stride || 0,
          offset: array.offset || 0,
          divisor: array.divisor === undefined ? undefined : array.divisor,
          drawType: array.drawType
        };
      }
    }
  });
  gl.bindBuffer(ARRAY_BUFFER, null);
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
    gl.bindBuffer(ARRAY_BUFFER, attribInfo.buffer);
    gl.bufferSubData(ARRAY_BUFFER, offset, array);
  } else {
    setBufferFromTypedArray(gl, ARRAY_BUFFER, attribInfo.buffer, array, attribInfo.drawType);
  }
}
function getBytesPerValueForGLType(gl, type) {
  if (type === BYTE) return 1; // eslint-disable-line
  if (type === UNSIGNED_BYTE) return 1; // eslint-disable-line
  if (type === SHORT) return 2; // eslint-disable-line
  if (type === UNSIGNED_SHORT) return 2; // eslint-disable-line
  if (type === INT) return 4; // eslint-disable-line
  if (type === UNSIGNED_INT) return 4; // eslint-disable-line
  if (type === FLOAT) return 4; // eslint-disable-line
  return 0;
}

// Tries to get the number of elements from a set of arrays.
var positionKeys = ['position', 'positions', 'a_position'];
function getNumElementsFromNonIndexedArrays(arrays) {
  var key;
  var ii;
  for (ii = 0; ii < positionKeys.length; ++ii) {
    key = positionKeys[ii];
    if (key in arrays) {
      break;
    }
  }
  if (ii === positionKeys.length) {
    key = Object.keys(arrays)[0];
  }
  var array = arrays[key];
  var length = getArray(array).length;
  if (length === undefined) {
    return 1; // There's no arrays
  }
  var numComponents = getNumComponents(array, key);
  var numElements = length / numComponents;
  if (length % numComponents > 0) {
    throw new Error("numComponents ".concat(numComponents, " not correct for length ").concat(length));
  }
  return numElements;
}
function getNumElementsFromAttributes(gl, attribs) {
  var key;
  var ii;
  for (ii = 0; ii < positionKeys.length; ++ii) {
    key = positionKeys[ii];
    if (key in attribs) {
      break;
    }
    key = defaults.attribPrefix + key;
    if (key in attribs) {
      break;
    }
  }
  if (ii === positionKeys.length) {
    key = Object.keys(attribs)[0];
  }
  var attrib = attribs[key];
  if (!attrib.buffer) {
    return 1; // There's no buffer
  }
  gl.bindBuffer(ARRAY_BUFFER, attrib.buffer);
  var numBytes = gl.getBufferParameter(ARRAY_BUFFER, BUFFER_SIZE);
  gl.bindBuffer(ARRAY_BUFFER, null);
  var bytesPerValue = getBytesPerValueForGLType(gl, attrib.type);
  var totalElements = numBytes / bytesPerValue;
  var numComponents = attrib.numComponents || attrib.size;
  // TODO: check stride
  var numElements = totalElements / numComponents;
  if (numElements % 1 !== 0) {
    throw new Error("numComponents ".concat(numComponents, " not correct for length ").concat(length));
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
  var newAttribs = createAttribsFromArrays(gl, arrays);
  var bufferInfo = Object.assign({}, srcBufferInfo ? srcBufferInfo : {});
  bufferInfo.attribs = Object.assign({}, srcBufferInfo ? srcBufferInfo.attribs : {}, newAttribs);
  var indices = arrays.indices;
  if (indices) {
    var newIndices = makeTypedArray(indices, "indices");
    bufferInfo.indices = createBufferFromTypedArray(gl, newIndices, ELEMENT_ARRAY_BUFFER);
    bufferInfo.numElements = newIndices.length;
    bufferInfo.elementType = typedArrays.getGLTypeForTypedArray(newIndices);
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
  var type = arrayName === "indices" ? ELEMENT_ARRAY_BUFFER : ARRAY_BUFFER;
  var typedArray = makeTypedArray(array, arrayName);
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
  var buffers = {};
  Object.keys(arrays).forEach(function (key) {
    buffers[key] = createBufferFromArray(gl, arrays[key], key);
  });

  // Ugh!
  if (arrays.indices) {
    buffers.numElements = arrays.indices.length;
    buffers.elementType = typedArrays.getGLTypeForTypedArray(makeTypedArray(arrays.indices), 'indices');
  } else {
    buffers.numElements = getNumElementsFromNonIndexedArrays(arrays);
  }
  return buffers;
}

/***/ }),

/***/ "./src/draw.js":
/*!*********************!*\
  !*** ./src/draw.js ***!
  \*********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
exports.__esModule = true;
exports.drawBufferInfo = drawBufferInfo;
exports.drawObjectList = drawObjectList;
var programs = _interopRequireWildcard(__webpack_require__(/*! ./programs.js */ "./src/programs.js"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
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

var TRIANGLES = 0x0004;
var UNSIGNED_SHORT = 0x1403;

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
  var indices = bufferInfo.indices;
  var elementType = bufferInfo.elementType;
  var numElements = count === undefined ? bufferInfo.numElements : count;
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
  var lastUsedProgramInfo = null;
  var lastUsedBufferInfo = null;
  objectsToDraw.forEach(function (object) {
    if (object.active === false) {
      return;
    }
    var programInfo = object.programInfo;
    var bufferInfo = object.vertexArrayInfo || object.bufferInfo;
    var bindBuffers = false;
    var type = object.type === undefined ? TRIANGLES : object.type;
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
      programs.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    }

    // Set the uniforms.
    programs.setUniforms(programInfo, object.uniforms);

    // Draw
    drawBufferInfo(gl, bufferInfo, type, object.count, object.offset, object.instanceCount);
  });
  if (lastUsedBufferInfo && lastUsedBufferInfo.vertexArrayObject) {
    gl.bindVertexArray(null);
  }
}

/***/ }),

/***/ "./src/framebuffers.js":
/*!*****************************!*\
  !*** ./src/framebuffers.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
exports.__esModule = true;
exports.bindFramebufferInfo = bindFramebufferInfo;
exports.createFramebufferInfo = createFramebufferInfo;
exports.resizeFramebufferInfo = resizeFramebufferInfo;
var textures = _interopRequireWildcard(__webpack_require__(/*! ./textures.js */ "./src/textures.js"));
var helper = _interopRequireWildcard(__webpack_require__(/*! ./helper.js */ "./src/helper.js"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
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
var gl = undefined; /* eslint-disable-line */

var FRAMEBUFFER = 0x8d40;
var RENDERBUFFER = 0x8d41;
var TEXTURE_2D = 0x0de1;
var UNSIGNED_BYTE = 0x1401;

/* PixelFormat */
var DEPTH_COMPONENT = 0x1902;
var RGBA = 0x1908;
var DEPTH_COMPONENT24 = 0x81a6;
var DEPTH_COMPONENT32F = 0x8cac;
var DEPTH24_STENCIL8 = 0x88f0;
var DEPTH32F_STENCIL8 = 0x8cad;

/* Framebuffer Object. */
var RGBA4 = 0x8056;
var RGB5_A1 = 0x8057;
var RGB565 = 0x8D62;
var DEPTH_COMPONENT16 = 0x81A5;
var STENCIL_INDEX = 0x1901;
var STENCIL_INDEX8 = 0x8D48;
var DEPTH_STENCIL = 0x84F9;
var COLOR_ATTACHMENT0 = 0x8CE0;
var DEPTH_ATTACHMENT = 0x8D00;
var STENCIL_ATTACHMENT = 0x8D20;
var DEPTH_STENCIL_ATTACHMENT = 0x821A;

/* TextureWrapMode */
var CLAMP_TO_EDGE = 0x812F;

/* TextureMagFilter */
var LINEAR = 0x2601;

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

var defaultAttachments = [{
  format: RGBA,
  type: UNSIGNED_BYTE,
  min: LINEAR,
  wrap: CLAMP_TO_EDGE
}, {
  format: DEPTH_STENCIL
}];
var attachmentsByFormat = {};
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
var MAX_COLOR_ATTACHMENT_POINTS = 32; // even an 3090 only supports 8 but WebGL/OpenGL ES define constants for 32

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
  var target = FRAMEBUFFER;
  var fb = gl.createFramebuffer();
  gl.bindFramebuffer(target, fb);
  width = width || gl.drawingBufferWidth;
  height = height || gl.drawingBufferHeight;
  attachments = attachments || defaultAttachments;
  var usedColorAttachmentsPoints = [];
  var framebufferInfo = {
    framebuffer: fb,
    attachments: [],
    width: width,
    height: height
  };
  attachments.forEach(function (attachmentOptions, i) {
    var attachment = attachmentOptions.attachment;
    var samples = attachmentOptions.samples;
    var format = attachmentOptions.format;
    var attachmentPoint = attachmentOptions.attachmentPoint || getAttachmentPointForFormat(format, attachmentOptions.internalFormat);
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
        var textureOptions = Object.assign({}, attachmentOptions);
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
        gl.framebufferTextureLayer(target, attachmentPoint, attachment, attachmentOptions.level || 0, attachmentOptions.layer);
      } else {
        gl.framebufferTexture2D(target, attachmentPoint, attachmentOptions.target || TEXTURE_2D, attachment, attachmentOptions.level || 0);
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
  width = width || gl.drawingBufferWidth;
  height = height || gl.drawingBufferHeight;
  framebufferInfo.width = width;
  framebufferInfo.height = height;
  attachments = attachments || defaultAttachments;
  attachments.forEach(function (attachmentOptions, ndx) {
    var attachment = framebufferInfo.attachments[ndx];
    var format = attachmentOptions.format;
    var samples = attachmentOptions.samples;
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

/***/ }),

/***/ "./src/helper.js":
/*!***********************!*\
  !*** ./src/helper.js ***!
  \***********************/
/***/ ((__unused_webpack_module, exports) => {



exports.__esModule = true;
exports.copyExistingProperties = copyExistingProperties;
exports.copyNamedProperties = copyNamedProperties;
exports.error = error;
exports.isBuffer = isBuffer;
exports.isRenderbuffer = isRenderbuffer;
exports.isSampler = isSampler;
exports.isShader = isShader;
exports.isTexture = isTexture;
exports.warn = warn;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
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
  names.forEach(function (name) {
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
 * @private
 */
function copyExistingProperties(src, dst) {
  Object.keys(dst).forEach(function (key) {
    if (dst.hasOwnProperty(key) && src.hasOwnProperty(key)) {
      /* eslint no-prototype-builtins: 0 */
      dst[key] = src[key];
    }
  });
}
function error() {
  var _console;
  (_console = console).error.apply(_console, arguments);
}
function warn() {
  var _console2;
  (_console2 = console).warn.apply(_console2, arguments);
}
var isTypeWeakMaps = new Map();
function isType(object, type) {
  if (!object || _typeof(object) !== 'object') {
    return false;
  }
  var weakMap = isTypeWeakMaps.get(type);
  if (!weakMap) {
    weakMap = new WeakMap();
    isTypeWeakMaps.set(type, weakMap);
  }
  var isOfType = weakMap.get(object);
  if (isOfType === undefined) {
    var s = Object.prototype.toString.call(object);
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
function isShader(gl, t) {
  return typeof WebGLShader !== 'undefined' && isType(t, 'WebGLShader');
}
function isTexture(gl, t) {
  return typeof WebGLTexture !== 'undefined' && isType(t, 'WebGLTexture');
}
function isSampler(gl, t) {
  return typeof WebGLSampler !== 'undefined' && isType(t, 'WebGLSampler');
}

/***/ }),

/***/ "./src/programs.js":
/*!*************************!*\
  !*** ./src/programs.js ***!
  \*************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
exports.__esModule = true;
exports.bindTransformFeedbackInfo = bindTransformFeedbackInfo;
exports.bindUniformBlock = bindUniformBlock;
exports.createAttributeSetters = createAttributeSetters;
exports.createProgram = createProgram;
exports.createProgramAsync = void 0;
exports.createProgramFromScripts = createProgramFromScripts;
exports.createProgramFromSources = createProgramFromSources;
exports.createProgramInfo = createProgramInfo;
exports.createProgramInfoAsync = void 0;
exports.createProgramInfoFromProgram = createProgramInfoFromProgram;
exports.createProgramInfos = createProgramInfos;
exports.createProgramInfosAsync = void 0;
exports.createPrograms = createPrograms;
exports.createProgramsAsync = void 0;
exports.createTransformFeedback = createTransformFeedback;
exports.createTransformFeedbackInfo = createTransformFeedbackInfo;
exports.createUniformBlockInfo = createUniformBlockInfo;
exports.createUniformBlockInfoFromProgram = createUniformBlockInfoFromProgram;
exports.createUniformBlockSpecFromProgram = createUniformBlockSpecFromProgram;
exports.createUniformSetters = createUniformSetters;
exports.setAttributes = setAttributes;
exports.setBlockUniforms = setBlockUniforms;
exports.setBuffersAndAttributes = setBuffersAndAttributes;
exports.setUniformBlock = setUniformBlock;
exports.setUniforms = setUniforms;
exports.setUniformsAndBindTextures = void 0;
var utils = _interopRequireWildcard(__webpack_require__(/*! ./utils.js */ "./src/utils.js"));
var helper = _interopRequireWildcard(__webpack_require__(/*! ./helper.js */ "./src/helper.js"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw new Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw new Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; } /*
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

var error = helper.error;
var warn = helper.warn;
function getElementById(id) {
  return typeof document !== 'undefined' && document.getElementById ? document.getElementById(id) : null;
}
var TEXTURE0 = 0x84c0;
var DYNAMIC_DRAW = 0x88e8;
var ARRAY_BUFFER = 0x8892;
var ELEMENT_ARRAY_BUFFER = 0x8893;
var UNIFORM_BUFFER = 0x8a11;
var TRANSFORM_FEEDBACK_BUFFER = 0x8c8e;
var TRANSFORM_FEEDBACK = 0x8e22;
var COMPILE_STATUS = 0x8b81;
var LINK_STATUS = 0x8b82;
var FRAGMENT_SHADER = 0x8b30;
var VERTEX_SHADER = 0x8b31;
var SEPARATE_ATTRIBS = 0x8c8d;
var ACTIVE_UNIFORMS = 0x8b86;
var ACTIVE_ATTRIBUTES = 0x8b89;
var TRANSFORM_FEEDBACK_VARYINGS = 0x8c83;
var ACTIVE_UNIFORM_BLOCKS = 0x8a36;
var UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER = 0x8a44;
var UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER = 0x8a46;
var UNIFORM_BLOCK_DATA_SIZE = 0x8a40;
var UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES = 0x8a43;
var FLOAT = 0x1406;
var FLOAT_VEC2 = 0x8B50;
var FLOAT_VEC3 = 0x8B51;
var FLOAT_VEC4 = 0x8B52;
var INT = 0x1404;
var INT_VEC2 = 0x8B53;
var INT_VEC3 = 0x8B54;
var INT_VEC4 = 0x8B55;
var BOOL = 0x8B56;
var BOOL_VEC2 = 0x8B57;
var BOOL_VEC3 = 0x8B58;
var BOOL_VEC4 = 0x8B59;
var FLOAT_MAT2 = 0x8B5A;
var FLOAT_MAT3 = 0x8B5B;
var FLOAT_MAT4 = 0x8B5C;
var SAMPLER_2D = 0x8B5E;
var SAMPLER_CUBE = 0x8B60;
var SAMPLER_3D = 0x8B5F;
var SAMPLER_2D_SHADOW = 0x8B62;
var FLOAT_MAT2x3 = 0x8B65;
var FLOAT_MAT2x4 = 0x8B66;
var FLOAT_MAT3x2 = 0x8B67;
var FLOAT_MAT3x4 = 0x8B68;
var FLOAT_MAT4x2 = 0x8B69;
var FLOAT_MAT4x3 = 0x8B6A;
var SAMPLER_2D_ARRAY = 0x8DC1;
var SAMPLER_2D_ARRAY_SHADOW = 0x8DC4;
var SAMPLER_CUBE_SHADOW = 0x8DC5;
var UNSIGNED_INT = 0x1405;
var UNSIGNED_INT_VEC2 = 0x8DC6;
var UNSIGNED_INT_VEC3 = 0x8DC7;
var UNSIGNED_INT_VEC4 = 0x8DC8;
var INT_SAMPLER_2D = 0x8DCA;
var INT_SAMPLER_3D = 0x8DCB;
var INT_SAMPLER_CUBE = 0x8DCC;
var INT_SAMPLER_2D_ARRAY = 0x8DCF;
var UNSIGNED_INT_SAMPLER_2D = 0x8DD2;
var UNSIGNED_INT_SAMPLER_3D = 0x8DD3;
var UNSIGNED_INT_SAMPLER_CUBE = 0x8DD4;
var UNSIGNED_INT_SAMPLER_2D_ARRAY = 0x8DD7;
var TEXTURE_2D = 0x0DE1;
var TEXTURE_CUBE_MAP = 0x8513;
var TEXTURE_3D = 0x806F;
var TEXTURE_2D_ARRAY = 0x8C1A;
var typeMap = {};

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
  return function (v) {
    gl.uniform1f(location, v);
  };
}
function floatArraySetter(gl, location) {
  return function (v) {
    gl.uniform1fv(location, v);
  };
}
function floatVec2Setter(gl, location) {
  return function (v) {
    gl.uniform2fv(location, v);
  };
}
function floatVec3Setter(gl, location) {
  return function (v) {
    gl.uniform3fv(location, v);
  };
}
function floatVec4Setter(gl, location) {
  return function (v) {
    gl.uniform4fv(location, v);
  };
}
function intSetter(gl, location) {
  return function (v) {
    gl.uniform1i(location, v);
  };
}
function intArraySetter(gl, location) {
  return function (v) {
    gl.uniform1iv(location, v);
  };
}
function intVec2Setter(gl, location) {
  return function (v) {
    gl.uniform2iv(location, v);
  };
}
function intVec3Setter(gl, location) {
  return function (v) {
    gl.uniform3iv(location, v);
  };
}
function intVec4Setter(gl, location) {
  return function (v) {
    gl.uniform4iv(location, v);
  };
}
function uintSetter(gl, location) {
  return function (v) {
    gl.uniform1ui(location, v);
  };
}
function uintArraySetter(gl, location) {
  return function (v) {
    gl.uniform1uiv(location, v);
  };
}
function uintVec2Setter(gl, location) {
  return function (v) {
    gl.uniform2uiv(location, v);
  };
}
function uintVec3Setter(gl, location) {
  return function (v) {
    gl.uniform3uiv(location, v);
  };
}
function uintVec4Setter(gl, location) {
  return function (v) {
    gl.uniform4uiv(location, v);
  };
}
function floatMat2Setter(gl, location) {
  return function (v) {
    gl.uniformMatrix2fv(location, false, v);
  };
}
function floatMat3Setter(gl, location) {
  return function (v) {
    gl.uniformMatrix3fv(location, false, v);
  };
}
function floatMat4Setter(gl, location) {
  return function (v) {
    gl.uniformMatrix4fv(location, false, v);
  };
}
function floatMat23Setter(gl, location) {
  return function (v) {
    gl.uniformMatrix2x3fv(location, false, v);
  };
}
function floatMat32Setter(gl, location) {
  return function (v) {
    gl.uniformMatrix3x2fv(location, false, v);
  };
}
function floatMat24Setter(gl, location) {
  return function (v) {
    gl.uniformMatrix2x4fv(location, false, v);
  };
}
function floatMat42Setter(gl, location) {
  return function (v) {
    gl.uniformMatrix4x2fv(location, false, v);
  };
}
function floatMat34Setter(gl, location) {
  return function (v) {
    gl.uniformMatrix3x4fv(location, false, v);
  };
}
function floatMat43Setter(gl, location) {
  return function (v) {
    gl.uniformMatrix4x3fv(location, false, v);
  };
}
function samplerSetter(gl, type, unit, location) {
  var bindPoint = getBindPointForSamplerType(gl, type);
  return utils.isWebGL2(gl) ? function (textureOrPair) {
    var texture;
    var sampler;
    if (!textureOrPair || helper.isTexture(gl, textureOrPair)) {
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
  } : function (texture) {
    gl.uniform1i(location, unit);
    gl.activeTexture(TEXTURE0 + unit);
    gl.bindTexture(bindPoint, texture);
  };
}
function samplerArraySetter(gl, type, unit, location, size) {
  var bindPoint = getBindPointForSamplerType(gl, type);
  var units = new Int32Array(size);
  for (var ii = 0; ii < size; ++ii) {
    units[ii] = unit + ii;
  }
  return utils.isWebGL2(gl) ? function (textures) {
    gl.uniform1iv(location, units);
    textures.forEach(function (textureOrPair, index) {
      gl.activeTexture(TEXTURE0 + units[index]);
      var texture;
      var sampler;
      if (!textureOrPair || helper.isTexture(gl, textureOrPair)) {
        texture = textureOrPair;
        sampler = null;
      } else {
        texture = textureOrPair.texture;
        sampler = textureOrPair.sampler;
      }
      gl.bindSampler(unit, sampler);
      gl.bindTexture(bindPoint, texture);
    });
  } : function (textures) {
    gl.uniform1iv(location, units);
    textures.forEach(function (texture, index) {
      gl.activeTexture(TEXTURE0 + units[index]);
      gl.bindTexture(bindPoint, texture);
    });
  };
}
typeMap[FLOAT] = {
  Type: Float32Array,
  size: 4,
  setter: floatSetter,
  arraySetter: floatArraySetter
};
typeMap[FLOAT_VEC2] = {
  Type: Float32Array,
  size: 8,
  setter: floatVec2Setter,
  cols: 2
};
typeMap[FLOAT_VEC3] = {
  Type: Float32Array,
  size: 12,
  setter: floatVec3Setter,
  cols: 3
};
typeMap[FLOAT_VEC4] = {
  Type: Float32Array,
  size: 16,
  setter: floatVec4Setter,
  cols: 4
};
typeMap[INT] = {
  Type: Int32Array,
  size: 4,
  setter: intSetter,
  arraySetter: intArraySetter
};
typeMap[INT_VEC2] = {
  Type: Int32Array,
  size: 8,
  setter: intVec2Setter,
  cols: 2
};
typeMap[INT_VEC3] = {
  Type: Int32Array,
  size: 12,
  setter: intVec3Setter,
  cols: 3
};
typeMap[INT_VEC4] = {
  Type: Int32Array,
  size: 16,
  setter: intVec4Setter,
  cols: 4
};
typeMap[UNSIGNED_INT] = {
  Type: Uint32Array,
  size: 4,
  setter: uintSetter,
  arraySetter: uintArraySetter
};
typeMap[UNSIGNED_INT_VEC2] = {
  Type: Uint32Array,
  size: 8,
  setter: uintVec2Setter,
  cols: 2
};
typeMap[UNSIGNED_INT_VEC3] = {
  Type: Uint32Array,
  size: 12,
  setter: uintVec3Setter,
  cols: 3
};
typeMap[UNSIGNED_INT_VEC4] = {
  Type: Uint32Array,
  size: 16,
  setter: uintVec4Setter,
  cols: 4
};
typeMap[BOOL] = {
  Type: Uint32Array,
  size: 4,
  setter: intSetter,
  arraySetter: intArraySetter
};
typeMap[BOOL_VEC2] = {
  Type: Uint32Array,
  size: 8,
  setter: intVec2Setter,
  cols: 2
};
typeMap[BOOL_VEC3] = {
  Type: Uint32Array,
  size: 12,
  setter: intVec3Setter,
  cols: 3
};
typeMap[BOOL_VEC4] = {
  Type: Uint32Array,
  size: 16,
  setter: intVec4Setter,
  cols: 4
};
typeMap[FLOAT_MAT2] = {
  Type: Float32Array,
  size: 32,
  setter: floatMat2Setter,
  rows: 2,
  cols: 2
};
typeMap[FLOAT_MAT3] = {
  Type: Float32Array,
  size: 48,
  setter: floatMat3Setter,
  rows: 3,
  cols: 3
};
typeMap[FLOAT_MAT4] = {
  Type: Float32Array,
  size: 64,
  setter: floatMat4Setter,
  rows: 4,
  cols: 4
};
typeMap[FLOAT_MAT2x3] = {
  Type: Float32Array,
  size: 32,
  setter: floatMat23Setter,
  rows: 2,
  cols: 3
};
typeMap[FLOAT_MAT2x4] = {
  Type: Float32Array,
  size: 32,
  setter: floatMat24Setter,
  rows: 2,
  cols: 4
};
typeMap[FLOAT_MAT3x2] = {
  Type: Float32Array,
  size: 48,
  setter: floatMat32Setter,
  rows: 3,
  cols: 2
};
typeMap[FLOAT_MAT3x4] = {
  Type: Float32Array,
  size: 48,
  setter: floatMat34Setter,
  rows: 3,
  cols: 4
};
typeMap[FLOAT_MAT4x2] = {
  Type: Float32Array,
  size: 64,
  setter: floatMat42Setter,
  rows: 4,
  cols: 2
};
typeMap[FLOAT_MAT4x3] = {
  Type: Float32Array,
  size: 64,
  setter: floatMat43Setter,
  rows: 4,
  cols: 3
};
typeMap[SAMPLER_2D] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_2D
};
typeMap[SAMPLER_CUBE] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_CUBE_MAP
};
typeMap[SAMPLER_3D] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_3D
};
typeMap[SAMPLER_2D_SHADOW] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_2D
};
typeMap[SAMPLER_2D_ARRAY] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_2D_ARRAY
};
typeMap[SAMPLER_2D_ARRAY_SHADOW] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_2D_ARRAY
};
typeMap[SAMPLER_CUBE_SHADOW] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_CUBE_MAP
};
typeMap[INT_SAMPLER_2D] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_2D
};
typeMap[INT_SAMPLER_3D] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_3D
};
typeMap[INT_SAMPLER_CUBE] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_CUBE_MAP
};
typeMap[INT_SAMPLER_2D_ARRAY] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_2D_ARRAY
};
typeMap[UNSIGNED_INT_SAMPLER_2D] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_2D
};
typeMap[UNSIGNED_INT_SAMPLER_3D] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_3D
};
typeMap[UNSIGNED_INT_SAMPLER_CUBE] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_CUBE_MAP
};
typeMap[UNSIGNED_INT_SAMPLER_2D_ARRAY] = {
  Type: null,
  size: 0,
  setter: samplerSetter,
  arraySetter: samplerArraySetter,
  bindPoint: TEXTURE_2D_ARRAY
};
function floatAttribSetter(gl, index) {
  return function (b) {
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
      gl.vertexAttribPointer(index, b.numComponents || b.size, b.type || FLOAT, b.normalize || false, b.stride || 0, b.offset || 0);
      if (gl.vertexAttribDivisor) {
        gl.vertexAttribDivisor(index, b.divisor || 0);
      }
    }
  };
}
function intAttribSetter(gl, index) {
  return function (b) {
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
      gl.vertexAttribIPointer(index, b.numComponents || b.size, b.type || INT, b.stride || 0, b.offset || 0);
      if (gl.vertexAttribDivisor) {
        gl.vertexAttribDivisor(index, b.divisor || 0);
      }
    }
  };
}
function uintAttribSetter(gl, index) {
  return function (b) {
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
      gl.vertexAttribIPointer(index, b.numComponents || b.size, b.type || UNSIGNED_INT, b.stride || 0, b.offset || 0);
      if (gl.vertexAttribDivisor) {
        gl.vertexAttribDivisor(index, b.divisor || 0);
      }
    }
  };
}
function matAttribSetter(gl, index, typeInfo) {
  var defaultSize = typeInfo.size;
  var count = typeInfo.count;
  return function (b) {
    gl.bindBuffer(ARRAY_BUFFER, b.buffer);
    var numComponents = b.size || b.numComponents || defaultSize;
    var size = numComponents / count;
    var type = b.type || FLOAT;
    var typeInfo = typeMap[type];
    var stride = typeInfo.size * numComponents;
    var normalize = b.normalize || false;
    var offset = b.offset || 0;
    var rowOffset = stride / count;
    for (var i = 0; i < count; ++i) {
      gl.enableVertexAttribArray(index + i);
      gl.vertexAttribPointer(index + i, size, type, normalize, stride, offset + rowOffset * i);
      if (gl.vertexAttribDivisor) {
        gl.vertexAttribDivisor(index + i, b.divisor || 0);
      }
    }
  };
}
var attrTypeMap = {};
attrTypeMap[FLOAT] = {
  size: 4,
  setter: floatAttribSetter
};
attrTypeMap[FLOAT_VEC2] = {
  size: 8,
  setter: floatAttribSetter
};
attrTypeMap[FLOAT_VEC3] = {
  size: 12,
  setter: floatAttribSetter
};
attrTypeMap[FLOAT_VEC4] = {
  size: 16,
  setter: floatAttribSetter
};
attrTypeMap[INT] = {
  size: 4,
  setter: intAttribSetter
};
attrTypeMap[INT_VEC2] = {
  size: 8,
  setter: intAttribSetter
};
attrTypeMap[INT_VEC3] = {
  size: 12,
  setter: intAttribSetter
};
attrTypeMap[INT_VEC4] = {
  size: 16,
  setter: intAttribSetter
};
attrTypeMap[UNSIGNED_INT] = {
  size: 4,
  setter: uintAttribSetter
};
attrTypeMap[UNSIGNED_INT_VEC2] = {
  size: 8,
  setter: uintAttribSetter
};
attrTypeMap[UNSIGNED_INT_VEC3] = {
  size: 12,
  setter: uintAttribSetter
};
attrTypeMap[UNSIGNED_INT_VEC4] = {
  size: 16,
  setter: uintAttribSetter
};
attrTypeMap[BOOL] = {
  size: 4,
  setter: intAttribSetter
};
attrTypeMap[BOOL_VEC2] = {
  size: 8,
  setter: intAttribSetter
};
attrTypeMap[BOOL_VEC3] = {
  size: 12,
  setter: intAttribSetter
};
attrTypeMap[BOOL_VEC4] = {
  size: 16,
  setter: intAttribSetter
};
attrTypeMap[FLOAT_MAT2] = {
  size: 4,
  setter: matAttribSetter,
  count: 2
};
attrTypeMap[FLOAT_MAT3] = {
  size: 9,
  setter: matAttribSetter,
  count: 3
};
attrTypeMap[FLOAT_MAT4] = {
  size: 16,
  setter: matAttribSetter,
  count: 4
};

// make sure we don't see a global gl
var gl = undefined; /* eslint-disable-line */

var errorRE = /ERROR:\s*\d+:(\d+)/gi;
function addLineNumbersWithError(src) {
  var log = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var lineOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  // Note: Error message formats are not defined by any spec so this may or may not work.
  var matches = _toConsumableArray(log.matchAll(errorRE));
  var lineNoToErrorMap = new Map(matches.map(function (m, ndx) {
    var lineNo = parseInt(m[1]);
    var next = matches[ndx + 1];
    var end = next ? next.index : log.length;
    var msg = log.substring(m.index, end);
    return [lineNo - 1, msg];
  }));
  return src.split('\n').map(function (line, lineNo) {
    var err = lineNoToErrorMap.get(lineNo);
    return "".concat(lineNo + 1 + lineOffset, ": ").concat(line).concat(err ? "\n\n^^^ ".concat(err) : '');
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

var spaceRE = /^[ \t]*\n/;

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
  var lineOffset = 0;
  if (spaceRE.test(shaderSource)) {
    lineOffset = 1;
    shaderSource = shaderSource.replace(spaceRE, '');
  }
  return {
    lineOffset: lineOffset,
    shaderSource: shaderSource
  };
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
    setTimeout(function () {
      progOptions.callback("".concat(msg, "\n").concat(progOptions.errors.join('\n')));
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
  var compiled = gl.getShaderParameter(shader, COMPILE_STATUS);
  if (!compiled) {
    // Something went wrong during compilation; get the error
    var lastError = gl.getShaderInfoLog(shader);
    var _prepShaderSource = prepShaderSource(gl.getShaderSource(shader)),
      lineOffset = _prepShaderSource.lineOffset,
      shaderSource = _prepShaderSource.shaderSource;
    var _error = "".concat(addLineNumbersWithError(shaderSource, lastError, lineOffset), "\nError compiling ").concat(utils.glEnumToString(gl, shaderType), ": ").concat(lastError);
    errFn(_error);
    return _error;
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
  var transformFeedbackVaryings;
  var transformFeedbackMode;
  var callback;
  if (typeof opt_locations === 'function') {
    opt_errorCallback = opt_locations;
    opt_locations = undefined;
  }
  if (typeof opt_attribs === 'function') {
    opt_errorCallback = opt_attribs;
    opt_attribs = undefined;
  } else if (opt_attribs && !Array.isArray(opt_attribs)) {
    var opt = opt_attribs;
    opt_errorCallback = opt.errorCallback;
    opt_attribs = opt.attribLocations;
    transformFeedbackVaryings = opt.transformFeedbackVaryings;
    transformFeedbackMode = opt.transformFeedbackMode;
    callback = opt.callback;
  }
  var _errorCallback = opt_errorCallback || error;
  var errors = [];
  var options = {
    errorCallback: function errorCallback(msg) {
      errors.push(msg);
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      _errorCallback.apply(void 0, [msg].concat(args));
    },
    transformFeedbackVaryings: transformFeedbackVaryings,
    transformFeedbackMode: transformFeedbackMode,
    callback: callback,
    errors: errors
  };
  {
    var attribLocations = {};
    if (Array.isArray(opt_attribs)) {
      opt_attribs.forEach(function (attrib, ndx) {
        attribLocations[attrib] = opt_locations ? opt_locations[ndx] : ndx;
      });
    } else {
      attribLocations = opt_attribs || {};
    }
    options.attribLocations = attribLocations;
  }
  return options;
}
var defaultShaderType = ["VERTEX_SHADER", "FRAGMENT_SHADER"];
function getShaderTypeFromScriptType(gl, scriptType) {
  if (scriptType.indexOf("frag") >= 0) {
    return FRAGMENT_SHADER;
  } else if (scriptType.indexOf("vert") >= 0) {
    return VERTEX_SHADER;
  }
  return undefined;
}
function deleteProgramAndShaders(gl, program, notThese) {
  var shaders = gl.getAttachedShaders(program);
  var _iterator = _createForOfIteratorHelper(shaders),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var shader = _step.value;
      if (!notThese.has(shader)) {
        gl.deleteShader(shader);
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  gl.deleteProgram(program);
}
var wait = function wait() {
  var ms = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
};
function createProgramNoCheck(gl, shaders, programOptions) {
  var program = gl.createProgram();
  var _getProgramOptions = getProgramOptions(programOptions),
    attribLocations = _getProgramOptions.attribLocations,
    transformFeedbackVaryings = _getProgramOptions.transformFeedbackVaryings,
    transformFeedbackMode = _getProgramOptions.transformFeedbackMode;
  for (var ndx = 0; ndx < shaders.length; ++ndx) {
    var shader = shaders[ndx];
    if (typeof shader === 'string') {
      var elem = getElementById(shader);
      var src = elem ? elem.text : shader;
      var type = gl[defaultShaderType[ndx]];
      if (elem && elem.type) {
        type = getShaderTypeFromScriptType(gl, elem.type) || type;
      }
      shader = gl.createShader(type);
      gl.shaderSource(shader, prepShaderSource(src).shaderSource);
      gl.compileShader(shader);
    }
    gl.attachShader(program, shader);
  }
  Object.entries(attribLocations).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      attrib = _ref2[0],
      loc = _ref2[1];
    return gl.bindAttribLocation(program, loc, attrib);
  });
  {
    var varyings = transformFeedbackVaryings;
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
function createProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback) {
  // This code is really convoluted, because it may or may not be async
  // Maybe it would be better to have a separate function
  var progOptions = getProgramOptions(opt_attribs, opt_locations, opt_errorCallback);
  var shaderSet = new Set(shaders);
  var program = createProgramNoCheck(gl, shaders, progOptions);
  function hasErrors(gl, program) {
    var errors = getProgramErrors(gl, program, progOptions.errorCallback);
    if (errors) {
      deleteProgramAndShaders(gl, program, shaderSet);
    }
    return errors;
  }
  if (progOptions.callback) {
    waitForProgramLinkCompletionAsync(gl, program).then(function () {
      var errors = hasErrors(gl, program);
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
  return function (gl, arg1) {
    for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
      args[_key2 - 2] = arguments[_key2];
    }
    return new Promise(function (resolve, reject) {
      var programOptions = getProgramOptions.apply(void 0, args);
      programOptions.callback = function (err, program) {
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
var createProgramAsync = exports.createProgramAsync = wrapCallbackFnToAsyncFn(createProgram);

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
var createProgramInfoAsync = exports.createProgramInfoAsync = wrapCallbackFnToAsyncFn(createProgramInfo);
function waitForProgramLinkCompletionAsync(_x, _x2) {
  return _waitForProgramLinkCompletionAsync.apply(this, arguments);
}
function _waitForProgramLinkCompletionAsync() {
  _waitForProgramLinkCompletionAsync = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(gl, program) {
    var ext, checkFn, waitTime;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          ext = gl.getExtension('KHR_parallel_shader_compile');
          checkFn = ext ? function (gl, program) {
            return gl.getProgramParameter(program, ext.COMPLETION_STATUS_KHR);
          } : function () {
            return true;
          };
          waitTime = 0;
        case 3:
          _context.next = 5;
          return wait(waitTime);
        case 5:
          // must wait at least once
          waitTime = 1000 / 60;
        case 6:
          if (!checkFn(gl, program)) {
            _context.next = 3;
            break;
          }
        case 7:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return _waitForProgramLinkCompletionAsync.apply(this, arguments);
}
function waitForAllProgramsLinkCompletionAsync(_x3, _x4) {
  return _waitForAllProgramsLinkCompletionAsync.apply(this, arguments);
}
/**
 * Check a program's link status
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {WebGLProgram} program Program to check
 * @param {ErrorCallback} [errFn] func for errors
 * @return {string?} errors if program is failed, else undefined
 * @private
 */
function _waitForAllProgramsLinkCompletionAsync() {
  _waitForAllProgramsLinkCompletionAsync = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(gl, programs) {
    var _i3, _Object$values2, program;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _i3 = 0, _Object$values2 = Object.values(programs);
        case 1:
          if (!(_i3 < _Object$values2.length)) {
            _context2.next = 8;
            break;
          }
          program = _Object$values2[_i3];
          _context2.next = 5;
          return waitForProgramLinkCompletionAsync(gl, program);
        case 5:
          _i3++;
          _context2.next = 1;
          break;
        case 8:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return _waitForAllProgramsLinkCompletionAsync.apply(this, arguments);
}
function getProgramErrors(gl, program, errFn) {
  errFn = errFn || error;
  // Check the link status
  var linked = gl.getProgramParameter(program, LINK_STATUS);
  if (!linked) {
    // something went wrong with the link
    var lastError = gl.getProgramInfoLog(program);
    errFn("Error in program linking: ".concat(lastError));
    // print any errors from these shaders
    var shaders = gl.getAttachedShaders(program);
    var errors = shaders.map(function (shader) {
      return checkShaderStatus(gl, gl.getShaderParameter(shader, gl.SHADER_TYPE), shader, errFn);
    });
    return "".concat(lastError, "\n").concat(errors.filter(function (_) {
      return _;
    }).join('\n'));
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
function createProgramFromScripts(gl, shaderScriptIds, opt_attribs, opt_locations, opt_errorCallback) {
  var progOptions = getProgramOptions(opt_attribs, opt_locations, opt_errorCallback);
  var shaders = [];
  var _iterator2 = _createForOfIteratorHelper(shaderScriptIds),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var scriptId = _step2.value;
      var shaderScript = getElementById(scriptId);
      if (!shaderScript) {
        return reportError(progOptions, "unknown script element: ".concat(scriptId));
      }
      shaders.push(shaderScript.text);
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
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
function createProgramFromSources(gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback) {
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
  var name = info.name;
  return name.startsWith("gl_") || name.startsWith("webgl_");
}
var tokenRE = /(\.|\[|]|\w+)/g;
var isDigit = function isDigit(s) {
  return s >= '0' && s <= '9';
};
function addSetterToUniformTree(fullPath, setter, node, uniformSetters) {
  var tokens = fullPath.split(tokenRE).filter(function (s) {
    return s !== '';
  });
  var tokenNdx = 0;
  var path = '';
  for (;;) {
    var token = tokens[tokenNdx++]; // has to be name or number
    path += token;
    var isArrayIndex = isDigit(token[0]);
    var accessor = isArrayIndex ? parseInt(token) : token;
    if (isArrayIndex) {
      path += tokens[tokenNdx++]; // skip ']'
    }
    var isLastToken = tokenNdx === tokens.length;
    if (isLastToken) {
      node[accessor] = setter;
      break;
    } else {
      var _token = tokens[tokenNdx++]; // has to be . or [
      var isArray = _token === '[';
      var child = node[accessor] || (isArray ? [] : {});
      node[accessor] = child;
      node = child;
      uniformSetters[path] = uniformSetters[path] || function (node) {
        return function (value) {
          setUniformTree(node, value);
        };
      }(child);
      path += _token;
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
  var textureUnit = 0;

  /**
   * Creates a setter for a uniform of the given program with it's
   * location embedded in the setter.
   * @param {WebGLProgram} program
   * @param {WebGLUniformInfo} uniformInfo
   * @returns {function} the created setter.
   */
  function createUniformSetter(program, uniformInfo, location) {
    var isArray = uniformInfo.name.endsWith("[0]");
    var type = uniformInfo.type;
    var typeInfo = typeMap[type];
    if (!typeInfo) {
      throw new Error("unknown type: 0x".concat(type.toString(16))); // we should never get here.
    }
    var setter;
    if (typeInfo.bindPoint) {
      // it's a sampler
      var unit = textureUnit;
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
  var uniformSetters = {};
  var uniformTree = {};
  var numUniforms = gl.getProgramParameter(program, ACTIVE_UNIFORMS);
  for (var ii = 0; ii < numUniforms; ++ii) {
    var uniformInfo = gl.getActiveUniform(program, ii);
    if (isBuiltIn(uniformInfo)) {
      continue;
    }
    var name = uniformInfo.name;
    // remove the array suffix.
    if (name.endsWith("[0]")) {
      name = name.substr(0, name.length - 3);
    }
    var location = gl.getUniformLocation(program, uniformInfo.name);
    // the uniform will have no location if it's in a uniform block
    if (location) {
      var setter = createUniformSetter(program, uniformInfo, location);
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
  var info = {};
  var numVaryings = gl.getProgramParameter(program, TRANSFORM_FEEDBACK_VARYINGS);
  for (var ii = 0; ii < numVaryings; ++ii) {
    var varying = gl.getTransformFeedbackVarying(program, ii);
    info[varying.name] = {
      index: ii,
      type: varying.type,
      size: varying.size
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
  for (var name in bufferInfo) {
    var varying = transformFeedbackInfo[name];
    if (varying) {
      var buf = bufferInfo[name];
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
  var tf = gl.createTransformFeedback();
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
  var numUniforms = gl.getProgramParameter(program, ACTIVE_UNIFORMS);
  var uniformData = [];
  var uniformIndices = [];
  for (var ii = 0; ii < numUniforms; ++ii) {
    uniformIndices.push(ii);
    uniformData.push({});
    var uniformInfo = gl.getActiveUniform(program, ii);
    uniformData[ii].name = uniformInfo.name;
  }
  [["UNIFORM_TYPE", "type"], ["UNIFORM_SIZE", "size"],
  // num elements
  ["UNIFORM_BLOCK_INDEX", "blockNdx"], ["UNIFORM_OFFSET", "offset"]].forEach(function (pair) {
    var pname = pair[0];
    var key = pair[1];
    gl.getActiveUniforms(program, uniformIndices, gl[pname]).forEach(function (value, ndx) {
      uniformData[ndx][key] = value;
    });
  });
  var blockSpecs = {};
  var numUniformBlocks = gl.getProgramParameter(program, ACTIVE_UNIFORM_BLOCKS);
  for (var _ii = 0; _ii < numUniformBlocks; ++_ii) {
    var name = gl.getActiveUniformBlockName(program, _ii);
    var blockSpec = {
      index: gl.getUniformBlockIndex(program, name),
      usedByVertexShader: gl.getActiveUniformBlockParameter(program, _ii, UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER),
      usedByFragmentShader: gl.getActiveUniformBlockParameter(program, _ii, UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER),
      size: gl.getActiveUniformBlockParameter(program, _ii, UNIFORM_BLOCK_DATA_SIZE),
      uniformIndices: gl.getActiveUniformBlockParameter(program, _ii, UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES)
    };
    blockSpec.used = blockSpec.usedByVertexShader || blockSpec.usedByFragmentShader;
    blockSpecs[name] = blockSpec;
  }
  return {
    blockSpecs: blockSpecs,
    uniformData: uniformData
  };
}
var arraySuffixRE = /\[\d+\]\.$/; // better way to check?

var pad = function pad(v, padding) {
  return ((v + (padding - 1)) / padding | 0) * padding;
};
function createUniformBlockUniformSetter(view, isArray, rows, cols) {
  if (isArray || rows) {
    cols = cols || 1;
    var numElements = view.length;
    var totalRows = numElements / 4;
    return function (value) {
      var dst = 0;
      var src = 0;
      for (var row = 0; row < totalRows; ++row) {
        for (var col = 0; col < cols; ++col) {
          view[dst++] = value[src++];
        }
        dst += 4 - cols;
      }
    };
  } else {
    return function (value) {
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
function createUniformBlockInfoFromProgram(gl, program, uniformBlockSpec, blockName) {
  var _options$offset, _options$array, _options$buffer, _options$bufferOffset;
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var blockSpecs = uniformBlockSpec.blockSpecs;
  var uniformData = uniformBlockSpec.uniformData;
  var blockSpec = blockSpecs[blockName];
  if (!blockSpec) {
    warn("no uniform block object named:", blockName);
    return {
      name: blockName,
      uniforms: {}
    };
  }
  var offset = (_options$offset = options.offset) !== null && _options$offset !== void 0 ? _options$offset : 0;
  var array = (_options$array = options.array) !== null && _options$array !== void 0 ? _options$array : new ArrayBuffer(blockSpec.size);
  var buffer = (_options$buffer = options.buffer) !== null && _options$buffer !== void 0 ? _options$buffer : gl.createBuffer();
  var uniformBufferIndex = blockSpec.index;
  gl.bindBuffer(UNIFORM_BUFFER, buffer);
  if (!options.buffer) {
    gl.bufferData(UNIFORM_BUFFER, array.byteLength, DYNAMIC_DRAW);
  }
  gl.uniformBlockBinding(program, blockSpec.index, uniformBufferIndex);
  var prefix = blockName + ".";
  if (arraySuffixRE.test(prefix)) {
    prefix = prefix.replace(arraySuffixRE, ".");
  }
  var uniforms = {};
  var setters = {};
  var setterTree = {};
  blockSpec.uniformIndices.forEach(function (uniformNdx) {
    var data = uniformData[uniformNdx];
    var name = data.name;
    if (name.startsWith(prefix)) {
      name = name.substr(prefix.length);
    }
    var isArray = name.endsWith('[0]');
    if (isArray) {
      name = name.substr(0, name.length - 3);
    }
    var typeInfo = typeMap[data.type];
    var Type = typeInfo.Type;
    var byteLength = isArray ? pad(typeInfo.size, 16) * data.size : typeInfo.size * data.size;
    var uniformView = new Type(array, offset + data.offset, byteLength / Type.BYTES_PER_ELEMENT);
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
    var setter = createUniformBlockUniformSetter(uniformView, isArray, typeInfo.rows, typeInfo.cols);
    setters[name] = setter;
    addSetterToUniformTree(name, setter, setterTree, setters);
  });
  return {
    name: blockName,
    array: array,
    asFloat: new Float32Array(array),
    // for debugging
    asUint8: new Uint8Array(array),
    // needed for gl.bufferSubData because it doesn't take an array buffer
    buffer: buffer,
    uniforms: uniforms,
    setters: setters,
    offset: (_options$bufferOffset = options.bufferOffset) !== null && _options$bufferOffset !== void 0 ? _options$bufferOffset : offset,
    size: blockSpec.size
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
function createUniformBlockInfo(gl, programInfo, blockName) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
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
  var uniformBlockSpec = programInfo.uniformBlockSpec || programInfo;
  var blockSpec = uniformBlockSpec.blockSpecs[uniformBlockInfo.name];
  if (blockSpec) {
    var _uniformBlockInfo$siz;
    var bufferBindIndex = blockSpec.index;
    gl.bindBufferRange(UNIFORM_BUFFER, bufferBindIndex, uniformBlockInfo.buffer, uniformBlockInfo.offset || 0, (_uniformBlockInfo$siz = uniformBlockInfo.size) !== null && _uniformBlockInfo$siz !== void 0 ? _uniformBlockInfo$siz : uniformBlockInfo.array.byteLength);
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
  var setters = uniformBlockInfo.setters;
  for (var name in values) {
    var setter = setters[name];
    if (setter) {
      var value = values[name];
      setter(value);
    }
  }
}
function setUniformTree(tree, values) {
  for (var name in values) {
    var prop = tree[name];
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
function setUniforms(setters) {
  // eslint-disable-line
  var actualSetters = setters.uniformSetters || setters;
  var numArgs = arguments.length <= 1 ? 0 : arguments.length - 1;
  for (var aNdx = 0; aNdx < numArgs; ++aNdx) {
    var values = aNdx + 1 < 1 || arguments.length <= aNdx + 1 ? undefined : arguments[aNdx + 1];
    if (Array.isArray(values)) {
      var numValues = values.length;
      for (var ii = 0; ii < numValues; ++ii) {
        setUniforms(actualSetters, values[ii]);
      }
    } else {
      for (var name in values) {
        var setter = actualSetters[name];
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
var setUniformsAndBindTextures = exports.setUniformsAndBindTextures = setUniforms;

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
  var attribSetters = {};
  var numAttribs = gl.getProgramParameter(program, ACTIVE_ATTRIBUTES);
  for (var ii = 0; ii < numAttribs; ++ii) {
    var attribInfo = gl.getActiveAttrib(program, ii);
    if (isBuiltIn(attribInfo)) {
      continue;
    }
    var index = gl.getAttribLocation(program, attribInfo.name);
    var typeInfo = attrTypeMap[attribInfo.type];
    var setter = typeInfo.setter(gl, index, typeInfo);
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
  for (var name in buffers) {
    var setter = setters[name];
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
      gl.bindBuffer(ELEMENT_ARRAY_BUFFER, buffers.indices);
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
  var uniformSetters = createUniformSetters(gl, program);
  var attribSetters = createAttributeSetters(gl, program);
  var programInfo = {
    program: program,
    uniformSetters: uniformSetters,
    attribSetters: attribSetters,
    uniformLocations: Object.fromEntries(Object.entries(uniformSetters).map(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
        k = _ref4[0],
        v = _ref4[1];
      return [k, v.location];
    })),
    attribLocations: Object.fromEntries(Object.entries(attribSetters).map(function (_ref5) {
      var _ref6 = _slicedToArray(_ref5, 2),
        k = _ref6[0],
        v = _ref6[1];
      return [k, v.location];
    }))
  };
  if (utils.isWebGL2(gl)) {
    programInfo.uniformBlockSpec = createUniformBlockSpecFromProgram(gl, program);
    programInfo.transformFeedbackInfo = createTransformFeedbackInfo(gl, program);
  }
  return programInfo;
}
var notIdRE = /\s|{|}|;/;

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
function createProgramInfo(gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback) {
  var progOptions = getProgramOptions(opt_attribs, opt_locations, opt_errorCallback);
  var errors = [];
  shaderSources = shaderSources.map(function (source) {
    // Lets assume if there is no \n it's an id
    if (!notIdRE.test(source)) {
      var script = getElementById(source);
      if (!script) {
        var err = "no element with id: ".concat(source);
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
  var origCallback = progOptions.callback;
  if (origCallback) {
    progOptions.callback = function (err, program) {
      origCallback(err, err ? undefined : createProgramInfoFromProgram(gl, program));
    };
  }
  var program = createProgramFromSources(gl, shaderSources, progOptions);
  if (!program) {
    return null;
  }
  return createProgramInfoFromProgram(gl, program);
}
function checkAllPrograms(gl, programs, programSpecs, noDeleteShadersSet, programOptions) {
  // check errors for everything.
  for (var _i = 0, _Object$entries = Object.entries(programs); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
      name = _Object$entries$_i[0],
      program = _Object$entries$_i[1];
    var options = _objectSpread({}, programOptions);
    var spec = programSpecs[name];
    if (!Array.isArray(spec)) {
      Object.assign(options, spec);
    }
    var errors = getProgramErrors(gl, program, options.errorCallback);
    if (errors) {
      // delete everything we created
      for (var _i2 = 0, _Object$values = Object.values(programs); _i2 < _Object$values.length; _i2++) {
        var _program = _Object$values[_i2];
        var shaders = gl.getAttachedShaders(_program);
        gl.deleteProgram(_program);
        var _iterator3 = _createForOfIteratorHelper(shaders),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var shader = _step3.value;
            // Don't delete it if we didn't create it.
            if (!noDeleteShadersSet.has(shader)) {
              gl.deleteShader(shader);
            }
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
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
function createPrograms(gl, programSpecs) {
  var programOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  // Remember existing shaders so that if there is an error we don't delete them
  var noDeleteShadersSet = new Set();

  // compile and link everything
  var programs = Object.fromEntries(Object.entries(programSpecs).map(function (_ref7) {
    var _ref8 = _slicedToArray(_ref7, 2),
      name = _ref8[0],
      spec = _ref8[1];
    var options = _objectSpread({}, programOptions);
    var shaders = Array.isArray(spec) ? spec : spec.shaders;
    if (!Array.isArray(spec)) {
      Object.assign(options, spec);
    }
    shaders.forEach(noDeleteShadersSet.add, noDeleteShadersSet);
    return [name, createProgramNoCheck(gl, shaders, options)];
  }));
  if (programOptions.callback) {
    waitForAllProgramsLinkCompletionAsync(gl, programs).then(function () {
      var errors = checkAllPrograms(gl, programs, programSpecs, noDeleteShadersSet, programOptions);
      programOptions.callback(errors, errors ? undefined : programs);
    });
    return undefined;
  }
  var errors = checkAllPrograms(gl, programs, programSpecs, noDeleteShadersSet, programOptions);
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
    return Object.fromEntries(Object.entries(programs).map(function (_ref9) {
      var _ref10 = _slicedToArray(_ref9, 2),
        name = _ref10[0],
        program = _ref10[1];
      return [name, createProgramInfoFromProgram(gl, program)];
    }));
  }
  var origCallback = programOptions.callback;
  if (origCallback) {
    programOptions.callback = function (err, programs) {
      origCallback(err, err ? undefined : createProgramInfosForPrograms(gl, programs));
    };
  }
  var programs = createPrograms(gl, programSpecs, programOptions);
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
var createProgramsAsync = exports.createProgramsAsync = wrapCallbackFnToAsyncFn(createPrograms);

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
var createProgramInfosAsync = exports.createProgramInfosAsync = wrapCallbackFnToAsyncFn(createProgramInfos);

/***/ }),

/***/ "./src/textures.js":
/*!*************************!*\
  !*** ./src/textures.js ***!
  \*************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



exports.__esModule = true;
exports.canFilter = canFilter;
exports.canGenerateMipmap = canGenerateMipmap;
exports.createSampler = createSampler;
exports.createSamplers = createSamplers;
exports.createTexture = createTexture;
exports.createTextureAsync = createTextureAsync;
exports.createTextures = createTextures;
exports.createTexturesAsync = createTexturesAsync;
exports.getBytesPerElementForInternalFormat = getBytesPerElementForInternalFormat;
exports.getFormatAndTypeForInternalFormat = getFormatAndTypeForInternalFormat;
exports.getNumComponentsForFormat = getNumComponentsForFormat;
exports.loadTextureFromUrl = loadTextureFromUrl;
exports.resizeTexture = resizeTexture;
exports.setDefaultTextureColor = setDefaultTextureColor;
exports.setEmptyTexture = setEmptyTexture;
exports.setSamplerParameters = setSamplerParameters;
exports.setTextureDefaults_ = setDefaults;
exports.setTextureFilteringForSize = setTextureFilteringForSize;
exports.setTextureFromArray = setTextureFromArray;
exports.setTextureFromElement = setTextureFromElement;
exports.setTextureParameters = setTextureParameters;
var utils = _interopRequireWildcard(__webpack_require__(/*! ./utils.js */ "./src/utils.js"));
var typedArrays = _interopRequireWildcard(__webpack_require__(/*! ./typedarrays.js */ "./src/typedarrays.js"));
var helper = _interopRequireWildcard(__webpack_require__(/*! ./helper.js */ "./src/helper.js"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
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
 * Low level texture related functions
 *
 * You should generally not need to use these functions. They are provided
 * for those cases where you're doing something out of the ordinary
 * and you need lower level access.
 *
 * For backward compatibility they are available at both `twgl.textures` and `twgl`
 * itself
 *
 * See {@link module:twgl} for core functions
 *
 * @module twgl/textures
 */

// make sure we don't see a global gl
var gl = undefined; /* eslint-disable-line */
var defaults = {
  textureColor: new Uint8Array([128, 192, 255, 255]),
  textureOptions: {},
  crossOrigin: undefined
};
var isArrayBuffer = typedArrays.isArrayBuffer;

// Should we make this on demand?
var getShared2DContext = function () {
  var s_ctx;
  return function getShared2DContext() {
    s_ctx = s_ctx || (typeof document !== 'undefined' && document.createElement ? document.createElement("canvas").getContext("2d") : null);
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
var ALPHA = 0x1906;
var RGB = 0x1907;
var RGBA = 0x1908;
var LUMINANCE = 0x1909;
var LUMINANCE_ALPHA = 0x190A;
var DEPTH_COMPONENT = 0x1902;
var DEPTH_STENCIL = 0x84F9;

/* TextureWrapMode */
// const REPEAT                         = 0x2901;
// const MIRRORED_REPEAT                = 0x8370;
var CLAMP_TO_EDGE = 0x812f;

/* TextureMagFilter */
var NEAREST = 0x2600;
var LINEAR = 0x2601;
var NEAREST_MIPMAP_LINEAR = 0x2702;

/* TextureMinFilter */
// const NEAREST_MIPMAP_NEAREST         = 0x2700;
// const LINEAR_MIPMAP_NEAREST          = 0x2701;
// const NEAREST_MIPMAP_LINEAR          = 0x2702;
// const LINEAR_MIPMAP_LINEAR           = 0x2703;

/* Texture Target */
var TEXTURE_2D = 0x0de1;
var TEXTURE_CUBE_MAP = 0x8513;
var TEXTURE_3D = 0x806f;
var TEXTURE_2D_ARRAY = 0x8c1a;

/* Cubemap Targets */
var TEXTURE_CUBE_MAP_POSITIVE_X = 0x8515;
var TEXTURE_CUBE_MAP_NEGATIVE_X = 0x8516;
var TEXTURE_CUBE_MAP_POSITIVE_Y = 0x8517;
var TEXTURE_CUBE_MAP_NEGATIVE_Y = 0x8518;
var TEXTURE_CUBE_MAP_POSITIVE_Z = 0x8519;
var TEXTURE_CUBE_MAP_NEGATIVE_Z = 0x851a;

/* Texture Parameters */
var TEXTURE_MIN_FILTER = 0x2801;
var TEXTURE_MAG_FILTER = 0x2800;
var TEXTURE_WRAP_S = 0x2802;
var TEXTURE_WRAP_T = 0x2803;
var TEXTURE_WRAP_R = 0x8072;
var TEXTURE_MIN_LOD = 0x813a;
var TEXTURE_MAX_LOD = 0x813b;
var TEXTURE_BASE_LEVEL = 0x813c;
var TEXTURE_MAX_LEVEL = 0x813d;
var TEXTURE_COMPARE_MODE = 0x884C;
var TEXTURE_COMPARE_FUNC = 0x884D;

/* Pixel store */
var UNPACK_ALIGNMENT = 0x0cf5;
var UNPACK_ROW_LENGTH = 0x0cf2;
var UNPACK_IMAGE_HEIGHT = 0x806e;
var UNPACK_SKIP_PIXELS = 0x0cf4;
var UNPACK_SKIP_ROWS = 0x0cf3;
var UNPACK_SKIP_IMAGES = 0x806d;
var UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243;
var UNPACK_PREMULTIPLY_ALPHA_WEBGL = 0x9241;
var UNPACK_FLIP_Y_WEBGL = 0x9240;
var R8 = 0x8229;
var R8_SNORM = 0x8F94;
var R16F = 0x822D;
var R32F = 0x822E;
var R8UI = 0x8232;
var R8I = 0x8231;
var RG16UI = 0x823A;
var RG16I = 0x8239;
var RG32UI = 0x823C;
var RG32I = 0x823B;
var RG8 = 0x822B;
var RG8_SNORM = 0x8F95;
var RG16F = 0x822F;
var RG32F = 0x8230;
var RG8UI = 0x8238;
var RG8I = 0x8237;
var R16UI = 0x8234;
var R16I = 0x8233;
var R32UI = 0x8236;
var R32I = 0x8235;
var RGB8 = 0x8051;
var SRGB8 = 0x8C41;
var RGB565 = 0x8D62;
var RGB8_SNORM = 0x8F96;
var R11F_G11F_B10F = 0x8C3A;
var RGB9_E5 = 0x8C3D;
var RGB16F = 0x881B;
var RGB32F = 0x8815;
var RGB8UI = 0x8D7D;
var RGB8I = 0x8D8F;
var RGB16UI = 0x8D77;
var RGB16I = 0x8D89;
var RGB32UI = 0x8D71;
var RGB32I = 0x8D83;
var RGBA8 = 0x8058;
var SRGB8_ALPHA8 = 0x8C43;
var RGBA8_SNORM = 0x8F97;
var RGB5_A1 = 0x8057;
var RGBA4 = 0x8056;
var RGB10_A2 = 0x8059;
var RGBA16F = 0x881A;
var RGBA32F = 0x8814;
var RGBA8UI = 0x8D7C;
var RGBA8I = 0x8D8E;
var RGB10_A2UI = 0x906F;
var RGBA16UI = 0x8D76;
var RGBA16I = 0x8D88;
var RGBA32I = 0x8D82;
var RGBA32UI = 0x8D70;
var DEPTH_COMPONENT16 = 0x81A5;
var DEPTH_COMPONENT24 = 0x81A6;
var DEPTH_COMPONENT32F = 0x8CAC;
var DEPTH32F_STENCIL8 = 0x8CAD;
var DEPTH24_STENCIL8 = 0x88F0;

/* DataType */
var BYTE = 0x1400;
var UNSIGNED_BYTE = 0x1401;
var SHORT = 0x1402;
var UNSIGNED_SHORT = 0x1403;
var INT = 0x1404;
var UNSIGNED_INT = 0x1405;
var FLOAT = 0x1406;
var UNSIGNED_SHORT_4_4_4_4 = 0x8033;
var UNSIGNED_SHORT_5_5_5_1 = 0x8034;
var UNSIGNED_SHORT_5_6_5 = 0x8363;
var HALF_FLOAT = 0x140B;
var HALF_FLOAT_OES = 0x8D61; // Thanks Khronos for making this different >:(
var UNSIGNED_INT_2_10_10_10_REV = 0x8368;
var UNSIGNED_INT_10F_11F_11F_REV = 0x8C3B;
var UNSIGNED_INT_5_9_9_9_REV = 0x8C3E;
var FLOAT_32_UNSIGNED_INT_24_8_REV = 0x8DAD;
var UNSIGNED_INT_24_8 = 0x84FA;
var RG = 0x8227;
var RG_INTEGER = 0x8228;
var RED = 0x1903;
var RED_INTEGER = 0x8D94;
var RGB_INTEGER = 0x8D98;
var RGBA_INTEGER = 0x8D99;

/* Compressed Texture Formats */
// s3tc
var COMPRESSED_RGB_S3TC_DXT1_EXT = 0x83F0;
var COMPRESSED_RGBA_S3TC_DXT1_EXT = 0x83F1;
var COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2;
var COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3;
// s3tc_srgb
var COMPRESSED_SRGB_S3TC_DXT1_EXT = 0x8C4C;
var COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT = 0x8C4D;
var COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT = 0x8C4E;
var COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT = 0x8C4F;
// etc
var COMPRESSED_RGB_ETC1_WEBGL = 0x8D64;
var COMPRESSED_R11_EAC = 0x9270;
var COMPRESSED_SIGNED_R11_EAC = 0x9271;
var COMPRESSED_RG11_EAC = 0x9272;
var COMPRESSED_SIGNED_RG11_EAC = 0x9273;
var COMPRESSED_RGB8_ETC2 = 0x9274;
var COMPRESSED_SRGB8_ETC2 = 0x9275;
var COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2 = 0x9276;
var COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2 = 0x9277;
var COMPRESSED_RGBA8_ETC2_EAC = 0x9278;
var COMPRESSED_SRGB8_ALPHA8_ETC2_EAC = 0x9279;
// pvrtc
var COMPRESSED_RGB_PVRTC_4BPPV1_IMG = 0x8C00;
var COMPRESSED_RGB_PVRTC_2BPPV1_IMG = 0x8C01;
var COMPRESSED_RGBA_PVRTC_4BPPV1_IMG = 0x8C02;
var COMPRESSED_RGBA_PVRTC_2BPPV1_IMG = 0x8C03;
// astc
var COMPRESSED_RGBA_ASTC_4x4_KHR = 0x93B0;
var COMPRESSED_RGBA_ASTC_5x4_KHR = 0x93B1;
var COMPRESSED_RGBA_ASTC_5x5_KHR = 0x93B2;
var COMPRESSED_RGBA_ASTC_6x5_KHR = 0x93B3;
var COMPRESSED_RGBA_ASTC_6x6_KHR = 0x93B4;
var COMPRESSED_RGBA_ASTC_8x5_KHR = 0x93B5;
var COMPRESSED_RGBA_ASTC_8x6_KHR = 0x93B6;
var COMPRESSED_RGBA_ASTC_8x8_KHR = 0x93B7;
var COMPRESSED_RGBA_ASTC_10x5_KHR = 0x93B8;
var COMPRESSED_RGBA_ASTC_10x6_KHR = 0x93B9;
var COMPRESSED_RGBA_ASTC_10x8_KHR = 0x93BA;
var COMPRESSED_RGBA_ASTC_10x10_KHR = 0x93BB;
var COMPRESSED_RGBA_ASTC_12x10_KHR = 0x93BC;
var COMPRESSED_RGBA_ASTC_12x12_KHR = 0x93BD;
var COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR = 0x93D0;
var COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR = 0x93D1;
var COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR = 0x93D2;
var COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR = 0x93D3;
var COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR = 0x93D4;
var COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR = 0x93D5;
var COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR = 0x93D6;
var COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR = 0x93D7;
var COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR = 0x93D8;
var COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR = 0x93D9;
var COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR = 0x93DA;
var COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR = 0x93DB;
var COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR = 0x93DC;
var COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR = 0x93DD;
// bptc
var COMPRESSED_RGBA_BPTC_UNORM_EXT = 0x8E8C;
var COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT = 0x8E8D;
var COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT = 0x8E8E;
var COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT = 0x8E8F;
// rgtc
var COMPRESSED_RED_RGTC1_EXT = 0x8DBB;
var COMPRESSED_SIGNED_RED_RGTC1_EXT = 0x8DBC;
var COMPRESSED_RED_GREEN_RGTC2_EXT = 0x8DBD;
var COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT = 0x8DBE;
var formatInfo = {};
{
  // NOTE: this is named `numColorComponents` vs `numComponents` so we can let Uglify mangle
  // the name.
  var f = formatInfo;
  f[ALPHA] = {
    numColorComponents: 1
  };
  f[LUMINANCE] = {
    numColorComponents: 1
  };
  f[LUMINANCE_ALPHA] = {
    numColorComponents: 2
  };
  f[RGB] = {
    numColorComponents: 3
  };
  f[RGBA] = {
    numColorComponents: 4
  };
  f[RED] = {
    numColorComponents: 1
  };
  f[RED_INTEGER] = {
    numColorComponents: 1
  };
  f[RG] = {
    numColorComponents: 2
  };
  f[RG_INTEGER] = {
    numColorComponents: 2
  };
  f[RGB] = {
    numColorComponents: 3
  };
  f[RGB_INTEGER] = {
    numColorComponents: 3
  };
  f[RGBA] = {
    numColorComponents: 4
  };
  f[RGBA_INTEGER] = {
    numColorComponents: 4
  };
  f[DEPTH_COMPONENT] = {
    numColorComponents: 1
  };
  f[DEPTH_STENCIL] = {
    numColorComponents: 2
  };
}

/**
 * @typedef {Object} BlockInfo
 * @property {number} bytes number of bytes in the block
 * @property {number} width width of the block
 * @property {number} height height of the block
 * @private
 */

/**
 * @typedef {Object} TextureFormatDetails
 * @property {number} textureFormat format to pass texImage2D and similar functions.
 * @property {boolean} colorRenderable true if you can render to this format of texture.
 * @property {boolean} textureFilterable true if you can filter the texture, false if you can ony use `NEAREST`.
 * @property {number[]} type Array of possible types you can pass to texImage2D and similar function
 * @property {Object.<number,number>} [bytesPerElementMap] A map of types to bytes per element
 * @property {BlockInfo} [block] block size, only for compressed textures
 * @private
 */

var s_textureInternalFormatInfo;
function getTextureInternalFormatInfo(internalFormat) {
  if (!s_textureInternalFormatInfo) {
    // NOTE: these properties need unique names so we can let Uglify mangle the name.
    var t = {};
    // unsized formats
    t[ALPHA] = {
      textureFormat: ALPHA,
      colorRenderable: true,
      textureFilterable: true,
      bytesPerElement: [1, 2, 2, 4],
      type: [UNSIGNED_BYTE, HALF_FLOAT, HALF_FLOAT_OES, FLOAT]
    };
    t[LUMINANCE] = {
      textureFormat: LUMINANCE,
      colorRenderable: true,
      textureFilterable: true,
      bytesPerElement: [1, 2, 2, 4],
      type: [UNSIGNED_BYTE, HALF_FLOAT, HALF_FLOAT_OES, FLOAT]
    };
    t[LUMINANCE_ALPHA] = {
      textureFormat: LUMINANCE_ALPHA,
      colorRenderable: true,
      textureFilterable: true,
      bytesPerElement: [2, 4, 4, 8],
      type: [UNSIGNED_BYTE, HALF_FLOAT, HALF_FLOAT_OES, FLOAT]
    };
    t[RGB] = {
      textureFormat: RGB,
      colorRenderable: true,
      textureFilterable: true,
      bytesPerElement: [3, 6, 6, 12, 2],
      type: [UNSIGNED_BYTE, HALF_FLOAT, HALF_FLOAT_OES, FLOAT, UNSIGNED_SHORT_5_6_5]
    };
    t[RGBA] = {
      textureFormat: RGBA,
      colorRenderable: true,
      textureFilterable: true,
      bytesPerElement: [4, 8, 8, 16, 2, 2],
      type: [UNSIGNED_BYTE, HALF_FLOAT, HALF_FLOAT_OES, FLOAT, UNSIGNED_SHORT_4_4_4_4, UNSIGNED_SHORT_5_5_5_1]
    };
    t[DEPTH_COMPONENT] = {
      textureFormat: DEPTH_COMPONENT,
      colorRenderable: true,
      textureFilterable: false,
      bytesPerElement: [2, 4],
      type: [UNSIGNED_INT, UNSIGNED_SHORT]
    };

    // sized formats
    t[R8] = {
      textureFormat: RED,
      colorRenderable: true,
      textureFilterable: true,
      bytesPerElement: [1],
      type: [UNSIGNED_BYTE]
    };
    t[R8_SNORM] = {
      textureFormat: RED,
      colorRenderable: false,
      textureFilterable: true,
      bytesPerElement: [1],
      type: [BYTE]
    };
    t[R16F] = {
      textureFormat: RED,
      colorRenderable: false,
      textureFilterable: true,
      bytesPerElement: [4, 2],
      type: [FLOAT, HALF_FLOAT]
    };
    t[R32F] = {
      textureFormat: RED,
      colorRenderable: false,
      textureFilterable: false,
      bytesPerElement: [4],
      type: [FLOAT]
    };
    t[R8UI] = {
      textureFormat: RED_INTEGER,
      colorRenderable: true,
      textureFilterable: false,
      bytesPerElement: [1],
      type: [UNSIGNED_BYTE]
    };
    t[R8I] = {
      textureFormat: RED_INTEGER,
      colorRenderable: true,
      textureFilterable: false,
      bytesPerElement: [1],
      type: [BYTE]
    };
    t[R16UI] = {
      textureFormat: RED_INTEGER,
      colorRenderable: true,
      textureFilterable: false,
      bytesPerElement: [2],
      type: [UNSIGNED_SHORT]
    };
    t[R16I] = {
      textureFormat: RED_INTEGER,
      colorRenderable: true,
      textureFilterable: false,
      bytesPerElement: [2],
      type: [SHORT]
    };
    t[R32UI] = {
      textureFormat: RED_INTEGER,
      colorRenderable: true,
      textureFilterable: false,
      bytesPerElement: [4],
      type: [UNSIGNED_INT]
    };
    t[R32I] = {
      textureFormat: RED_INTEGER,
      colorRenderable: true,
      textureFilterable: false,
      bytesPerElement: [4],
      type: [INT]
    };
    t[RG8] = {
      textureFormat: RG,
      colorRenderable: true,
      textureFilterable: true,
      bytesPerElement: [2],
      type: [UNSIGNED_BYTE]
    };
    t[RG8_SNORM] = {
      textureFormat: RG,
      colorRenderable: false,
      textureFilterable: true,
      bytesPerElement: [2],
      type: [BYTE]
    };
    t[RG16F] = {
      textureFormat: RG,
      colorRenderable: false,
      textureFilterable: true,
      bytesPerElement: [8, 4],
      type: [FLOAT, HALF_FLOAT]
    };
    t[RG32F] = {
      textureFormat: RG,
      colorRenderable: false,
      textureFilterable: false,
      bytesPerElement: [8],
      type: [FLOAT]
    };
    t[RG8UI] = {
      textureFormat: RG_INTEGER,
      colorRenderable: true,
      textureFilterable: false,
      bytesPerElement: [2],
      type: [UNSIGNED_BYTE]
    };
    t[RG8I] = {
      textureFormat: RG_INTEGER,
      colorRenderable: true,
      textureFilterable: false,
      bytesPerElement: [2],
      type: [BYTE]
    };
    t[RG16UI] = {
      textureFormat: RG_INTEGER,
      colorRenderable: true,
      textureFilterable: false,
      bytesPerElement: [4],
      type: [UNSIGNED_SHORT]
    };
    t[RG16I] = {
      textureFormat: RG_INTEGER,
      colorRenderable: true,
      textureFilterable: false,
      bytesPerElement: [4],
      type: [SHORT]
    };
    t[RG32UI] = {
      textureFormat: RG_INTEGER,
      colorRenderable: true,
      textureFilterable: false,
      bytesPerElement: [8],
      type: [UNSIGNED_INT]
    };
    t[RG32I] = {
      textureFormat: RG_INTEGER,
      colorRenderable: true,
      textureFilterable: false,
      bytesPerElement: [8],
      type: [INT]
    };
    t[RGB8] = {
      textureFormat: RGB,
      colorRenderable: true,
      textureFilterable: true,
      bytesPerElement: [3],
      type: [UNSIGNED_BYTE]
    };
    t[SRGB8] = {
      textureFormat: RGB,
      colorRenderable: false,
      textureFilterable: true,
      bytesPerElement: [3],
      type: [UNSIGNED_BYTE]
    };
    t[RGB565] = {
      textureFormat: RGB,
      colorRenderable: true,
      textureFilterable: true,
      bytesPerElement: [3, 2],
      type: [UNSIGNED_BYTE, UNSIGNED_SHORT_5_6_5]
    };
    t[RGB8_SNORM] = {
      textureFormat: RGB,
      colorRenderable: false,
      textureFilterable: true,
      bytesPerElement: [3],
      type: [BYTE]
    };
    t[R11F_G11F_B10F] = {
      textureFormat: RGB,
      colorRenderable: false,
      textureFilterable: true,
      bytesPerElement: [12, 6, 4],
      type: [FLOAT, HALF_FLOAT, UNSIGNED_INT_10F_11F_11F_REV]
    };
    t[RGB9_E5] = {
      textureFormat: RGB,
      colorRenderable: false,
      textureFilterable: true,
      bytesPerElement: [12, 6, 4],
      type: [FLOAT, HALF_FLOAT, UNSIGNED_INT_5_9_9_9_REV]
    };
    t[RGB16F] = {
      textureFormat: RGB,
      colorRenderable: false,
      textureFilterable: true,
      bytesPerElement: [12, 6],
      type: [FLOAT, HALF_FLOAT]
    };
    t[RGB32F] = {
      textureFormat: RGB,
      colorRenderable: false,
      textureFilterable: false,
      bytesPerElement: [12],
      type: [FLOAT]
    };
    t[RGB8UI] = {
      textureFormat: RGB_INTEGER,
      colorRenderable: false,
      textureFilterable: false,
      bytesPerElement: [3],
      type: [UNSIGNED_BYTE]
    };
    t[RGB8I] = {
      textureFormat: RGB_INTEGER,
      colorRenderable: false,
      textureFilterable: false,
      bytesPerElement: [3],
      type: [BYTE]
    };
    t[RGB16UI] = {
      textureFormat: RGB_INTEGER,
      colorRenderable: false,
      textureFilterable: false,
      bytesPerElement: [6],
      type: [UNSIGNED_SHORT]
    };
    t[RGB16I] = {
      textureFormat: RGB_INTEGER,
      colorRenderable: false,
      textureFilterable: false,
      bytesPerElement: [6],
      type: [SHORT]
    };
    t[RGB32UI] = {
      textureFormat: RGB_INTEGER,
      colorRenderable: false,
      textureFilterable: false,
      bytesPerElement: [12],
      type: [UNSIGNED_INT]
    };
    t[RGB32I] = {
      textureFormat: RGB_INTEGER,
      colorRenderable: false,
      textureFilterable: false,
      bytesPerElement: [12],
      type: [INT]
    };
    t[RGBA8] = {
      textureFormat: RGBA,
      colorRenderable: true,
      textureFilterable: true,
      bytesPerElement: [4],
      type: [UNSIGNED_BYTE]
    };
    t[SRGB8_ALPHA8] = {
      textureFormat: RGBA,
      colorRenderable: true,
      textureFilterable: true,
      bytesPerElement: [4],
      type: [UNSIGNED_BYTE]
    };
    t[RGBA8_SNORM] = {
      textureFormat: RGBA,
      colorRenderable: false,
      textureFilterable: true,
      bytesPerElement: [4],
      type: [BYTE]
    };
    t[RGB5_A1] = {
      textureFormat: RGBA,
      colorRenderable: true,
      textureFilterable: true,
      bytesPerElement: [4, 2, 4],
      type: [UNSIGNED_BYTE, UNSIGNED_SHORT_5_5_5_1, UNSIGNED_INT_2_10_10_10_REV]
    };
    t[RGBA4] = {
      textureFormat: RGBA,
      colorRenderable: true,
      textureFilterable: true,
      bytesPerElement: [4, 2],
      type: [UNSIGNED_BYTE, UNSIGNED_SHORT_4_4_4_4]
    };
    t[RGB10_A2] = {
      textureFormat: RGBA,
      colorRenderable: true,
      textureFilterable: true,
      bytesPerElement: [4],
      type: [UNSIGNED_INT_2_10_10_10_REV]
    };
    t[RGBA16F] = {
      textureFormat: RGBA,
      colorRenderable: false,
      textureFilterable: true,
      bytesPerElement: [16, 8],
      type: [FLOAT, HALF_FLOAT]
    };
    t[RGBA32F] = {
      textureFormat: RGBA,
      colorRenderable: false,
      textureFilterable: false,
      bytesPerElement: [16],
      type: [FLOAT]
    };
    t[RGBA8UI] = {
      textureFormat: RGBA_INTEGER,
      colorRenderable: true,
      textureFilterable: false,
      bytesPerElement: [4],
      type: [UNSIGNED_BYTE]
    };
    t[RGBA8I] = {
      textureFormat: RGBA_INTEGER,
      colorRenderable: true,
      textureFilterable: false,
      bytesPerElement: [4],
      type: [BYTE]
    };
    t[RGB10_A2UI] = {
      textureFormat: RGBA_INTEGER,
      colorRenderable: true,
      textureFilterable: false,
      bytesPerElement: [4],
      type: [UNSIGNED_INT_2_10_10_10_REV]
    };
    t[RGBA16UI] = {
      textureFormat: RGBA_INTEGER,
      colorRenderable: true,
      textureFilterable: false,
      bytesPerElement: [8],
      type: [UNSIGNED_SHORT]
    };
    t[RGBA16I] = {
      textureFormat: RGBA_INTEGER,
      colorRenderable: true,
      textureFilterable: false,
      bytesPerElement: [8],
      type: [SHORT]
    };
    t[RGBA32I] = {
      textureFormat: RGBA_INTEGER,
      colorRenderable: true,
      textureFilterable: false,
      bytesPerElement: [16],
      type: [INT]
    };
    t[RGBA32UI] = {
      textureFormat: RGBA_INTEGER,
      colorRenderable: true,
      textureFilterable: false,
      bytesPerElement: [16],
      type: [UNSIGNED_INT]
    };
    // Sized Internal
    t[DEPTH_COMPONENT16] = {
      textureFormat: DEPTH_COMPONENT,
      colorRenderable: true,
      textureFilterable: false,
      bytesPerElement: [2, 4],
      type: [UNSIGNED_SHORT, UNSIGNED_INT]
    };
    t[DEPTH_COMPONENT24] = {
      textureFormat: DEPTH_COMPONENT,
      colorRenderable: true,
      textureFilterable: false,
      bytesPerElement: [4],
      type: [UNSIGNED_INT]
    };
    t[DEPTH_COMPONENT32F] = {
      textureFormat: DEPTH_COMPONENT,
      colorRenderable: true,
      textureFilterable: false,
      bytesPerElement: [4],
      type: [FLOAT]
    };
    t[DEPTH24_STENCIL8] = {
      textureFormat: DEPTH_STENCIL,
      colorRenderable: true,
      textureFilterable: false,
      bytesPerElement: [4],
      type: [UNSIGNED_INT_24_8]
    };
    t[DEPTH32F_STENCIL8] = {
      textureFormat: DEPTH_STENCIL,
      colorRenderable: true,
      textureFilterable: false,
      bytesPerElement: [4],
      type: [FLOAT_32_UNSIGNED_INT_24_8_REV]
    };
    Object.keys(t).forEach(function (internalFormat) {
      var info = t[internalFormat];
      info.bytesPerElementMap = {};
      info.bytesPerElement.forEach(function (bytesPerElement, ndx) {
        var type = info.type[ndx];
        info.bytesPerElementMap[type] = bytesPerElement;
      });
    });
    var block8_4_4 = {
      bytes: 8,
      width: 4,
      height: 4
    };
    var block16_4_4 = {
      bytes: 16,
      width: 4,
      height: 4
    };

    // compressed texture formats
    // s3tc:https://registry.khronos.org/OpenGL/extensions/EXT/EXT_texture_compression_s3tc.txt
    t[COMPRESSED_RGB_S3TC_DXT1_EXT] = {
      textureFormat: COMPRESSED_RGB_S3TC_DXT1_EXT,
      colorRenderable: false,
      textureFilterable: true,
      block: block8_4_4
    };
    t[COMPRESSED_RGBA_S3TC_DXT1_EXT] = {
      textureFormat: COMPRESSED_RGBA_S3TC_DXT1_EXT,
      colorRenderable: false,
      textureFilterable: true,
      block: block8_4_4
    };
    t[COMPRESSED_RGBA_S3TC_DXT3_EXT] = {
      textureFormat: COMPRESSED_RGBA_S3TC_DXT3_EXT,
      colorRenderable: false,
      textureFilterable: true,
      block: block16_4_4
    };
    t[COMPRESSED_RGBA_S3TC_DXT5_EXT] = {
      textureFormat: COMPRESSED_RGBA_S3TC_DXT5_EXT,
      colorRenderable: false,
      textureFilterable: true,
      block: block16_4_4
    };
    // https://registry.khronos.org/OpenGL/extensions/EXT/EXT_texture_compression_s3tc_srgb.txt
    t[COMPRESSED_SRGB_S3TC_DXT1_EXT] = {
      textureFormat: COMPRESSED_SRGB_S3TC_DXT1_EXT,
      colorRenderable: false,
      textureFilterable: true,
      block: block8_4_4
    };
    t[COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT] = {
      textureFormat: COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT,
      colorRenderable: false,
      textureFilterable: true,
      block: block8_4_4
    };
    t[COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT] = {
      textureFormat: COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT,
      colorRenderable: false,
      textureFilterable: true,
      block: block16_4_4
    };
    t[COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT] = {
      textureFormat: COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT,
      colorRenderable: false,
      textureFilterable: true,
      block: block16_4_4
    };
    // https://registry.khronos.org/OpenGL/extensions/OES/OES_compressed_ETC1_RGB8_texture.txt
    t[COMPRESSED_RGB_ETC1_WEBGL] = {
      textureFormat: COMPRESSED_RGB_ETC1_WEBGL,
      colorRenderable: false,
      textureFilterable: true,
      block: block8_4_4
    };
    t[COMPRESSED_R11_EAC] = {
      textureFormat: COMPRESSED_R11_EAC,
      colorRenderable: false,
      textureFilterable: true,
      block: block8_4_4
    };
    t[COMPRESSED_SIGNED_R11_EAC] = {
      textureFormat: COMPRESSED_SIGNED_R11_EAC,
      colorRenderable: false,
      textureFilterable: true,
      block: block8_4_4
    };
    t[COMPRESSED_RG11_EAC] = {
      textureFormat: COMPRESSED_RG11_EAC,
      colorRenderable: false,
      textureFilterable: true,
      block: block16_4_4
    };
    t[COMPRESSED_SIGNED_RG11_EAC] = {
      textureFormat: COMPRESSED_SIGNED_RG11_EAC,
      colorRenderable: false,
      textureFilterable: true,
      block: block16_4_4
    };
    t[COMPRESSED_RGB8_ETC2] = {
      textureFormat: COMPRESSED_RGB8_ETC2,
      colorRenderable: false,
      textureFilterable: true,
      block: block8_4_4
    };
    t[COMPRESSED_SRGB8_ETC2] = {
      textureFormat: COMPRESSED_SRGB8_ETC2,
      colorRenderable: false,
      textureFilterable: true,
      block: block8_4_4
    };
    t[COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2] = {
      textureFormat: COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2,
      colorRenderable: false,
      textureFilterable: true,
      block: block8_4_4
    };
    t[COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2] = {
      textureFormat: COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2,
      colorRenderable: false,
      textureFilterable: true,
      block: block8_4_4
    };
    t[COMPRESSED_RGBA8_ETC2_EAC] = {
      textureFormat: COMPRESSED_RGBA8_ETC2_EAC,
      colorRenderable: false,
      textureFilterable: true,
      block: block16_4_4
    };
    t[COMPRESSED_SRGB8_ALPHA8_ETC2_EAC] = {
      textureFormat: COMPRESSED_SRGB8_ALPHA8_ETC2_EAC,
      colorRenderable: false,
      textureFilterable: true,
      block: block16_4_4
    };
    // https://registry.khronos.org/OpenGL/extensions/IMG/IMG_texture_compression_pvrtc.txt
    t[COMPRESSED_RGB_PVRTC_4BPPV1_IMG] = {
      textureFormat: COMPRESSED_RGB_PVRTC_4BPPV1_IMG,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 32,
        width: 8,
        height: 8
      }
    };
    t[COMPRESSED_RGB_PVRTC_2BPPV1_IMG] = {
      textureFormat: COMPRESSED_RGB_PVRTC_2BPPV1_IMG,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 32,
        width: 16,
        height: 8
      }
    };
    t[COMPRESSED_RGBA_PVRTC_4BPPV1_IMG] = {
      textureFormat: COMPRESSED_RGBA_PVRTC_4BPPV1_IMG,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 32,
        width: 8,
        height: 8
      }
    };
    t[COMPRESSED_RGBA_PVRTC_2BPPV1_IMG] = {
      textureFormat: COMPRESSED_RGBA_PVRTC_2BPPV1_IMG,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 32,
        width: 16,
        height: 8
      }
    };
    // https://registry.khronos.org/OpenGL/extensions/KHR/KHR_texture_compression_astc_hdr.txt
    t[COMPRESSED_RGBA_ASTC_4x4_KHR] = {
      textureFormat: COMPRESSED_RGBA_ASTC_4x4_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 4,
        height: 4
      }
    };
    t[COMPRESSED_RGBA_ASTC_5x4_KHR] = {
      textureFormat: COMPRESSED_RGBA_ASTC_5x4_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 5,
        height: 4
      }
    };
    t[COMPRESSED_RGBA_ASTC_5x5_KHR] = {
      textureFormat: COMPRESSED_RGBA_ASTC_5x5_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 5,
        height: 5
      }
    };
    t[COMPRESSED_RGBA_ASTC_6x5_KHR] = {
      textureFormat: COMPRESSED_RGBA_ASTC_6x5_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 6,
        height: 5
      }
    };
    t[COMPRESSED_RGBA_ASTC_6x6_KHR] = {
      textureFormat: COMPRESSED_RGBA_ASTC_6x6_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 6,
        height: 6
      }
    };
    t[COMPRESSED_RGBA_ASTC_8x5_KHR] = {
      textureFormat: COMPRESSED_RGBA_ASTC_8x5_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 8,
        height: 5
      }
    };
    t[COMPRESSED_RGBA_ASTC_8x6_KHR] = {
      textureFormat: COMPRESSED_RGBA_ASTC_8x6_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 8,
        height: 6
      }
    };
    t[COMPRESSED_RGBA_ASTC_8x8_KHR] = {
      textureFormat: COMPRESSED_RGBA_ASTC_8x8_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 8,
        height: 8
      }
    };
    t[COMPRESSED_RGBA_ASTC_10x5_KHR] = {
      textureFormat: COMPRESSED_RGBA_ASTC_10x5_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 10,
        height: 5
      }
    };
    t[COMPRESSED_RGBA_ASTC_10x6_KHR] = {
      textureFormat: COMPRESSED_RGBA_ASTC_10x6_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 10,
        height: 6
      }
    };
    t[COMPRESSED_RGBA_ASTC_10x8_KHR] = {
      textureFormat: COMPRESSED_RGBA_ASTC_10x8_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 10,
        height: 8
      }
    };
    t[COMPRESSED_RGBA_ASTC_10x10_KHR] = {
      textureFormat: COMPRESSED_RGBA_ASTC_10x10_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 10,
        height: 10
      }
    };
    t[COMPRESSED_RGBA_ASTC_12x10_KHR] = {
      textureFormat: COMPRESSED_RGBA_ASTC_12x10_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 12,
        height: 10
      }
    };
    t[COMPRESSED_RGBA_ASTC_12x12_KHR] = {
      textureFormat: COMPRESSED_RGBA_ASTC_12x12_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 12,
        height: 12
      }
    };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR] = {
      textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 4,
        height: 4
      }
    };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR] = {
      textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 5,
        height: 4
      }
    };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR] = {
      textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 5,
        height: 5
      }
    };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR] = {
      textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 6,
        height: 5
      }
    };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR] = {
      textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 6,
        height: 6
      }
    };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR] = {
      textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 8,
        height: 5
      }
    };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR] = {
      textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 8,
        height: 6
      }
    };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR] = {
      textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 8,
        height: 8
      }
    };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR] = {
      textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 10,
        height: 5
      }
    };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR] = {
      textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 10,
        height: 6
      }
    };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR] = {
      textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 10,
        height: 8
      }
    };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR] = {
      textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 10,
        height: 10
      }
    };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR] = {
      textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 12,
        height: 10
      }
    };
    t[COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR] = {
      textureFormat: COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR,
      colorRenderable: false,
      textureFilterable: true,
      block: {
        bytes: 16,
        width: 12,
        height: 12
      }
    };
    // https://registry.khronos.org/OpenGL/extensions/EXT/EXT_texture_compression_bptc.txt
    t[COMPRESSED_RGBA_BPTC_UNORM_EXT] = {
      textureFormat: COMPRESSED_RGBA_BPTC_UNORM_EXT,
      colorRenderable: false,
      textureFilterable: true,
      block: block16_4_4
    };
    t[COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT] = {
      textureFormat: COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT,
      colorRenderable: false,
      textureFilterable: true,
      block: block16_4_4
    };
    t[COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT] = {
      textureFormat: COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT,
      colorRenderable: false,
      textureFilterable: true,
      block: block16_4_4
    };
    t[COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT] = {
      textureFormat: COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT,
      colorRenderable: false,
      textureFilterable: true,
      block: block16_4_4
    };
    // https://registry.khronos.org/OpenGL/extensions/EXT/EXT_texture_compression_rgtc.txt
    t[COMPRESSED_RED_RGTC1_EXT] = {
      textureFormat: COMPRESSED_RED_RGTC1_EXT,
      colorRenderable: false,
      textureFilterable: true,
      block: block8_4_4
    };
    t[COMPRESSED_SIGNED_RED_RGTC1_EXT] = {
      textureFormat: COMPRESSED_SIGNED_RED_RGTC1_EXT,
      colorRenderable: false,
      textureFilterable: true,
      block: block8_4_4
    };
    t[COMPRESSED_RED_GREEN_RGTC2_EXT] = {
      textureFormat: COMPRESSED_RED_GREEN_RGTC2_EXT,
      colorRenderable: false,
      textureFilterable: true,
      block: block8_4_4
    };
    t[COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT] = {
      textureFormat: COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT,
      colorRenderable: false,
      textureFilterable: true,
      block: block8_4_4
    };
    s_textureInternalFormatInfo = t;
  }
  var info = s_textureInternalFormatInfo[internalFormat];
  if (!info) {
    throw new Error("unknown internal format");
  }
  return info;
}

/**
 * Gets the number of bytes per element for a given internalFormat / type
 * @param {number} internalFormat The internalFormat parameter from texImage2D etc..
 * @param {number} type The type parameter for texImage2D etc..
 * @return {number} the number of bytes per element for the given internalFormat, type combo
 * @memberOf module:twgl/textures
 */
function getBytesPerElementForInternalFormat(internalFormat, type) {
  var info = getTextureInternalFormatInfo(internalFormat);
  var bytesPerElement = info.bytesPerElementMap[type];
  if (bytesPerElement === undefined) {
    throw new Error("type not supported for internal format");
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
  var _info$type$, _info$type;
  var info = getTextureInternalFormatInfo(internalFormat);
  if (!info) {
    throw new Error("unknown internal format");
  }
  return {
    format: info.textureFormat,
    type: (_info$type$ = (_info$type = info.type) === null || _info$type === void 0 ? void 0 : _info$type[0]) !== null && _info$type$ !== void 0 ? _info$type$ : UNSIGNED_BYTE
  };
}

/**
 * @param {number} internalFormat The internal format
 * @returns if the internalFormat is a compressed format
 * @private
 */
function isCompressedInternalFormat(internalFormat) {
  var info = getTextureInternalFormatInfo(internalFormat);
  return !!info.block;
}

/**
 * Gets the width, height, and bytes per block for the given internal format
 * @param {number} internalFormat
 * @param {number} type
 * @private
 */
function getBlockInfoForInternalFormat(internalFormat, type) {
  var info = getTextureInternalFormatInfo(internalFormat);
  if (info.block) {
    return {
      blockWidth: info.block.width,
      blockHeight: info.block.height,
      bytesPerBlock: info.block.bytes
    };
  }
  var bytesPerBlock = getBytesPerElementForInternalFormat(internalFormat, type);
  return {
    blockWidth: 1,
    blockHeight: 1,
    bytesPerBlock: bytesPerBlock
  };
}

/**
 * Returns true if value is power of 2
 * @param {number} value number to check.
 * @return true if value is power of 2
 * @private
 */
function isPowerOf2(value) {
  return (value & value - 1) === 0;
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
  if (!utils.isWebGL2(gl)) {
    return isPowerOf2(width) && isPowerOf2(height);
  }
  var info = getTextureInternalFormatInfo(internalFormat);
  return info.colorRenderable && info.textureFilterable;
}

/**
 * Gets whether or not we can generate mips for the given format
 * @param {number} internalFormat The internalFormat parameter from texImage2D etc..
 * @return {boolean} true if we can generate mips
 * @memberOf module:twgl/textures
 */
function canFilter(internalFormat) {
  var info = getTextureInternalFormatInfo(internalFormat);
  return info.textureFilterable;
}

/**
 * Gets the number of components for a given image format.
 * @param {number} format the format.
 * @return {number} the number of components for the format.
 * @memberOf module:twgl/textures
 */
function getNumComponentsForFormat(format) {
  var info = formatInfo[format];
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
    return typedArrays.getGLTypeForTypedArray(src);
  }
  return defaultType || UNSIGNED_BYTE;
}
function guessDimensions(gl, target, width, height, numElements) {
  if (numElements % 1 !== 0) {
    throw new Error("can't guess dimensions");
  }
  if (!width && !height) {
    var size = Math.sqrt(numElements / (target === TEXTURE_CUBE_MAP ? 6 : 1));
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
      throw new Error("can't guess dimensions");
    }
  } else if (!width) {
    width = numElements / height;
    if (width % 1) {
      throw new Error("can't guess dimensions");
    }
  }
  return {
    width: width,
    height: height
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
  defaults.textureColor = new Uint8Array([color[0] * 255, color[1] * 255, color[2] * 255, color[3] * 255]);
}
function setDefaults(newDefaults) {
  helper.copyExistingProperties(newDefaults, defaults);
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
 * @property {number} [depth] the depth of a texture. Only used if src is an array or typed array or null and target is `TEXTURE_3D` .
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
 *    If `number[]` or `ArrayBufferView` it's assumed to be data for a texture.
 *
 *    *  If `width` or `height` is not specified it is guessed as follows.
 *
 *       First the number of elements is computed by `src.length / numComponents`
 *       where `numComponents` is derived from `format`. If `target` is `gl.TEXTURE_CUBE_MAP` then `numElements` is divided
 *       by 6. Then
 *
 *       *   If neither `width` nor `height` are specified and `sqrt(numElements)` is an integer then width and height
 *           are set to `sqrt(numElements)`. Otherwise `width = numElements` and `height = 1`.
 *
 *       *   If only one of `width` or `height` is specified then the other equals `numElements / specifiedDimension`.
 *
 *    * If both `width` and `height` is specified, then, the size of mip levels from `level` will be computed
 *      and data for consecutive mip levels will be uploaded until the data runs out.
 *
 *      In other words: `{ format: g.RGBA, width: 4, height: 4, src: Uint8Array((4 * 4 + 2 * 2 + 1) * 4) }`
 *      uploads 3 mip levels (4x4, 2x2, 1x1) because src is more than the data for the first mip level.
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
 * Saves the current packing state, sets the packing state as specified
 * then calls a function, after which the packing state will be restored.
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
 * @param {function():void} [fn] A function to call, after which the packing state will be restored.
 * @private
 */
function scopedSetPackState(gl, options, fn) {
  var colorspaceConversion;
  var premultiplyAlpha;
  var flipY;
  if (options.colorspaceConversion !== undefined) {
    colorspaceConversion = gl.getParameter(UNPACK_COLORSPACE_CONVERSION_WEBGL);
    gl.pixelStorei(UNPACK_COLORSPACE_CONVERSION_WEBGL, options.colorspaceConversion);
  }
  if (options.premultiplyAlpha !== undefined) {
    premultiplyAlpha = gl.getParameter(UNPACK_PREMULTIPLY_ALPHA_WEBGL);
    gl.pixelStorei(UNPACK_PREMULTIPLY_ALPHA_WEBGL, options.premultiplyAlpha);
  }
  if (options.flipY !== undefined) {
    flipY = gl.getParameter(UNPACK_FLIP_Y_WEBGL);
    gl.pixelStorei(UNPACK_FLIP_Y_WEBGL, options.flipY);
  }
  fn();
  if (colorspaceConversion !== undefined) {
    gl.pixelStorei(UNPACK_COLORSPACE_CONVERSION_WEBGL, colorspaceConversion);
  }
  if (premultiplyAlpha !== undefined) {
    gl.pixelStorei(UNPACK_PREMULTIPLY_ALPHA_WEBGL, premultiplyAlpha);
  }
  if (flipY !== undefined) {
    gl.pixelStorei(UNPACK_FLIP_Y_WEBGL, flipY);
  }
}

/**
 * returns the property if set or the corresponding state if undefined
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {module:twgl.TextureOptions} options
 * @param {string} property the name of the property to copy
 * @param {number} pname
 * @return {module:twgl.TextureOptions}
 */
function getPackStateOption(gl, options, property, pname) {
  var v = options[property];
  return _defineProperty({}, property, v === undefined ? gl.getParameter(pname) : v);
}

/**
 * Copy the options object and apply pack state
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {module:twgl.TextureOptions} options
 * @return {module:twgl.TextureOptions}
 */
function copyOptionsAndApplyPackState(gl, options) {
  return _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, options), getPackStateOption(gl, options, 'flipY', UNPACK_FLIP_Y_WEBGL)), getPackStateOption(gl, options, 'premultiplyAlpha', UNPACK_PREMULTIPLY_ALPHA_WEBGL)), getPackStateOption(gl, options, 'colorspaceConversion', UNPACK_COLORSPACE_CONVERSION_WEBGL));
}

/**
 * Set skip state to defaults
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @private
 */
function setSkipStateToDefault(gl) {
  gl.pixelStorei(UNPACK_ALIGNMENT, 4);
  if (utils.isWebGL2(gl)) {
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
    if (target === TEXTURE_3D || helper.isSampler(gl, target)) {
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
  var target = options.target || TEXTURE_2D;
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
  var sampler = gl.createSampler();
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
  var samplers = {};
  Object.keys(samplerOptions).forEach(function (name) {
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
  color = color || defaults.textureColor;
  if (isArrayBuffer(color)) {
    return color;
  }
  return new Uint8Array([color[0] * 255, color[1] * 255, color[2] * 255, color[3] * 255]);
}

/**
 * @typedef {Object} SetTextureFilteringInternalOptions
 * @property {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
 *   This is often the same options you passed in when you created the texture.
 * @property {number} [width] width of texture
 * @property {number} [height] height of texture
 * @property {number} [internalFormat] The internalFormat parameter from texImage2D etc..
 * @property {number} [lastMipLevelUploaded] The last mip level manually uploaded
 * @private
 */

/**
 * Sets filtering or generates mips for texture based on width or height
 * If width or height is not passed in uses `options.width` and//or `options.height`
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {WebGLTexture} tex the WebGLTexture to set parameters for
 * @param {SetTextureFilteringInternalOptions} p
 * @private
 */
function setTextureFilteringForSizeInternal(gl, tex, _ref2) {
  var options = _ref2.options,
    width = _ref2.width,
    height = _ref2.height,
    internalFormat = _ref2.internalFormat,
    lastMipLevelUploaded = _ref2.lastMipLevelUploaded;
  options = options || defaults.textureOptions;
  internalFormat = internalFormat || RGBA;
  var target = options.target || TEXTURE_2D;
  width = width || options.width;
  height = height || options.height;
  gl.bindTexture(target, tex);
  if (lastMipLevelUploaded > 1) {
    var lastLevelWidth = Math.max(1, width >> lastMipLevelUploaded);
    var lastLevelHeight = Math.max(1, height >> lastMipLevelUploaded);
    // Note: This is a guess. The user can set maxLod etc...
    var canUseMips = lastLevelWidth === 1 && lastLevelHeight === 1;
    var magFiltering = canFilter(internalFormat) ? LINEAR : NEAREST;
    var minFiltering = canFilter(internalFormat) ? canUseMips ? NEAREST_MIPMAP_LINEAR : LINEAR : NEAREST;
    gl.texParameteri(target, TEXTURE_MAG_FILTER, magFiltering);
    gl.texParameteri(target, TEXTURE_MIN_FILTER, minFiltering);
  } else if (canGenerateMipmap(gl, width, height, internalFormat)) {
    gl.generateMipmap(target);
  } else {
    var filtering = canFilter(internalFormat) ? LINEAR : NEAREST;
    gl.texParameteri(target, TEXTURE_MIN_FILTER, filtering);
    gl.texParameteri(target, TEXTURE_MAG_FILTER, filtering);
    gl.texParameteri(target, TEXTURE_WRAP_S, CLAMP_TO_EDGE);
    gl.texParameteri(target, TEXTURE_WRAP_T, CLAMP_TO_EDGE);
  }
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
  setTextureFilteringForSizeInternal(gl, tex, {
    options: options,
    width: width,
    height: height,
    internalFormat: internalFormat
  });
}
function shouldAutomaticallySetTextureFilteringForSize(options) {
  return options.auto === true || options.auto === undefined && options.level === undefined;
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
  return options.cubeFaceOrder || [TEXTURE_CUBE_MAP_POSITIVE_X, TEXTURE_CUBE_MAP_NEGATIVE_X, TEXTURE_CUBE_MAP_POSITIVE_Y, TEXTURE_CUBE_MAP_NEGATIVE_Y, TEXTURE_CUBE_MAP_POSITIVE_Z, TEXTURE_CUBE_MAP_NEGATIVE_Z];
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
  var faces = getCubeFaceOrder(gl, options);
  // work around bug in NVidia drivers. We have to upload the first face first else the driver crashes :(
  var facesWithNdx = faces.map(function (face, ndx) {
    return {
      face: face,
      ndx: ndx
    };
  });
  facesWithNdx.sort(function (a, b) {
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
  options = options || defaults.textureOptions;
  var target = options.target || TEXTURE_2D;
  var level = options.level || 0;
  var width = element.width;
  var height = element.height;
  var internalFormat = options.internalFormat || options.format || RGBA;
  var formatType = getFormatAndTypeForInternalFormat(internalFormat);
  var format = options.format || formatType.format;
  var type = options.type || formatType.type;
  gl.bindTexture(target, tex);
  if (target === TEXTURE_CUBE_MAP) {
    // guess the parts
    var imgWidth = element.width;
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
      throw new Error("can't figure out cube map from element: ".concat(element.src ? element.src : element.nodeName));
    }
    var ctx = getShared2DContext();
    if (ctx) {
      ctx.canvas.width = size;
      ctx.canvas.height = size;
      width = size;
      height = size;
      scopedSetPackState(gl, options, function () {
        getCubeFacesWithNdx(gl, options).forEach(function (f) {
          var xOffset = slices[f.ndx * 2 + 0] * size;
          var yOffset = slices[f.ndx * 2 + 1] * size;
          ctx.drawImage(element, xOffset, yOffset, size, size, 0, 0, size, size);
          gl.texImage2D(f.face, level, internalFormat, format, type, ctx.canvas);
        });
        // Free up the canvas memory
        ctx.canvas.width = 1;
        ctx.canvas.height = 1;
      });
    } else if (typeof createImageBitmap !== 'undefined') {
      // NOTE: It seems like we should prefer ImageBitmap because unlike canvas it's
      // note lossy? (alpha is not premultiplied? although I'm not sure what
      width = size;
      height = size;
      getCubeFacesWithNdx(gl, options).forEach(function (f) {
        var xOffset = slices[f.ndx * 2 + 0] * size;
        var yOffset = slices[f.ndx * 2 + 1] * size;
        // We can't easily use a default texture color here as it would have to match
        // the type across all faces where as with a 2D one there's only one face
        // so we're replacing everything all at once. It also has to be the correct size.
        // On the other hand we need all faces to be the same size so as one face loads
        // the rest match else the texture will be un-renderable.
        gl.texImage2D(f.face, level, internalFormat, size, size, 0, format, type, null);
        createImageBitmap(element, xOffset, yOffset, size, size, {
          premultiplyAlpha: 'none',
          colorSpaceConversion: 'none'
        }).then(function (imageBitmap) {
          scopedSetPackState(gl, options, function () {
            gl.bindTexture(target, tex);
            gl.texImage2D(f.face, level, internalFormat, format, type, imageBitmap);
            if (shouldAutomaticallySetTextureFilteringForSize(options)) {
              setTextureFilteringForSize(gl, tex, options, width, height, internalFormat);
            }
          });
        });
      });
    }
  } else if (target === TEXTURE_3D || target === TEXTURE_2D_ARRAY) {
    scopedSetPackState(gl, options, function () {
      var smallest = Math.min(element.width, element.height);
      var largest = Math.max(element.width, element.height);
      var depth = largest / smallest;
      if (depth % 1 !== 0) {
        throw new Error("can not compute 3D dimensions of element");
      }
      var xMult = element.width === largest ? 1 : 0;
      var yMult = element.height === largest ? 1 : 0;
      gl.pixelStorei(UNPACK_ALIGNMENT, 1);
      gl.pixelStorei(UNPACK_ROW_LENGTH, element.width);
      gl.pixelStorei(UNPACK_IMAGE_HEIGHT, 0);
      gl.pixelStorei(UNPACK_SKIP_IMAGES, 0);
      gl.texImage3D(target, level, internalFormat, smallest, smallest, smallest, 0, format, type, null);
      for (var d = 0; d < depth; ++d) {
        var srcX = d * smallest * xMult;
        var srcY = d * smallest * yMult;
        gl.pixelStorei(UNPACK_SKIP_PIXELS, srcX);
        gl.pixelStorei(UNPACK_SKIP_ROWS, srcY);
        gl.texSubImage3D(target, level, 0, 0, d, smallest, smallest, 1, format, type, element);
      }
      setSkipStateToDefault(gl);
    });
  } else {
    scopedSetPackState(gl, options, function () {
      gl.texImage2D(target, level, internalFormat, format, type, element);
    });
  }
  if (shouldAutomaticallySetTextureFilteringForSize(options)) {
    setTextureFilteringForSize(gl, tex, options, width, height, internalFormat);
  }
  setTextureParameters(gl, tex, options);
}
function noop() {}

/**
 * Checks whether the url's origin is the same so that we can set the `crossOrigin`
 * @param {string} url url to image
 * @returns {boolean} true if the window's origin is the same as image's url
 * @private
 */
function urlIsSameOrigin(url) {
  if (typeof document !== 'undefined') {
    // for IE really
    var a = document.createElement('a');
    a.href = url;
    return a.hostname === location.hostname && a.port === location.port && a.protocol === location.protocol;
  } else {
    var localOrigin = new URL(location.href).origin;
    var urlOrigin = new URL(url, location.href).origin;
    return urlOrigin === localOrigin;
  }
}
function setToAnonymousIfUndefinedAndURLIsNotSameOrigin(url, crossOrigin) {
  return crossOrigin === undefined && !urlIsSameOrigin(url) ? 'anonymous' : crossOrigin;
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
  var img;
  crossOrigin = crossOrigin !== undefined ? crossOrigin : defaults.crossOrigin;
  crossOrigin = setToAnonymousIfUndefinedAndURLIsNotSameOrigin(url, crossOrigin);
  if (typeof Image !== 'undefined') {
    img = new Image();
    if (crossOrigin !== undefined) {
      img.crossOrigin = crossOrigin;
    }
    var clearEventHandlers = function clearEventHandlers() {
      img.removeEventListener('error', onError); // eslint-disable-line
      img.removeEventListener('load', onLoad); // eslint-disable-line
      img = null;
    };
    var onError = function onError() {
      var msg = "couldn't load image: " + url;
      helper.error(msg);
      callback(msg, img);
      clearEventHandlers();
    };
    var onLoad = function onLoad() {
      callback(null, img);
      clearEventHandlers();
    };
    img.addEventListener('error', onError);
    img.addEventListener('load', onLoad);
    img.src = url;
    return img;
  } else if (typeof ImageBitmap !== 'undefined') {
    var err;
    var bm;
    var cb = function cb() {
      callback(err, bm);
    };
    var options = {};
    if (crossOrigin) {
      options.mode = 'cors'; // TODO: not sure how to translate image.crossOrigin
    }
    fetch(url, options).then(function (response) {
      if (!response.ok) {
        throw response;
      }
      return response.blob();
    }).then(function (blob) {
      return createImageBitmap(blob, {
        premultiplyAlpha: 'none',
        colorSpaceConversion: 'none'
      });
    }).then(function (bitmap) {
      // not sure if this works. We don't want
      // to catch the user's error. So, call
      // the callback in a timeout so we're
      // not in this scope inside the promise.
      bm = bitmap;
      setTimeout(cb);
    })["catch"](function (e) {
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
  return typeof ImageBitmap !== 'undefined' && obj instanceof ImageBitmap || typeof ImageData !== 'undefined' && obj instanceof ImageData || typeof HTMLElement !== 'undefined' && obj instanceof HTMLElement;
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
    setTimeout(function () {
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
  options = options || defaults.textureOptions;
  var target = options.target || TEXTURE_2D;
  gl.bindTexture(target, tex);
  if (options.color === false) {
    return;
  }
  // Assume it's a URL
  // Put 1x1 pixels in texture. That makes it renderable immediately regardless of filtering.
  var color = make1Pixel(options.color);
  if (target === TEXTURE_CUBE_MAP) {
    for (var ii = 0; ii < 6; ++ii) {
      gl.texImage2D(TEXTURE_CUBE_MAP_POSITIVE_X + ii, 0, RGBA, 1, 1, 0, RGBA, UNSIGNED_BYTE, color);
    }
  } else if (target === TEXTURE_3D || target === TEXTURE_2D_ARRAY) {
    gl.texImage3D(target, 0, RGBA, 1, 1, 1, 0, RGBA, UNSIGNED_BYTE, color);
  } else {
    gl.texImage2D(target, 0, RGBA, 1, 1, 0, RGBA, UNSIGNED_BYTE, color);
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
  options = options || defaults.textureOptions;
  setTextureTo1PixelColor(gl, tex, options);
  // Because it's async we need to copy the options.
  options = copyOptionsAndApplyPackState(gl, options);
  var img = loadAndUseImage(options.src, options.crossOrigin, function (err, img) {
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
  var urls = options.src;
  if (urls.length !== 6) {
    throw new Error("there must be 6 urls for a cubemap");
  }
  var level = options.level || 0;
  var internalFormat = options.internalFormat || options.format || RGBA;
  var formatType = getFormatAndTypeForInternalFormat(internalFormat);
  var format = options.format || formatType.format;
  var type = options.type || UNSIGNED_BYTE;
  var target = options.target || TEXTURE_2D;
  if (target !== TEXTURE_CUBE_MAP) {
    throw new Error("target must be TEXTURE_CUBE_MAP");
  }
  setTextureTo1PixelColor(gl, tex, options);
  // Because it's async we need to copy the options.
  options = copyOptionsAndApplyPackState(gl, options);
  var numToLoad = 6;
  var errors = [];
  var faces = getCubeFaceOrder(gl, options);
  var imgs; // eslint-disable-line

  function uploadImg(faceTarget) {
    return function (err, img) {
      --numToLoad;
      if (err) {
        errors.push(err);
      } else {
        if (img.width !== img.height) {
          errors.push("cubemap face img is not a square: " + img.src);
        } else {
          scopedSetPackState(gl, options, function () {
            gl.bindTexture(target, tex);

            // So assuming this is the first image we now have one face that's img sized
            // and 5 faces that are 1x1 pixel so size the other faces
            if (numToLoad === 5) {
              // use the default order
              getCubeFaceOrder(gl).forEach(function (otherTarget) {
                // Should we re-use the same face or a color?
                gl.texImage2D(otherTarget, level, internalFormat, format, type, img);
              });
            } else {
              gl.texImage2D(faceTarget, level, internalFormat, format, type, img);
            }
            if (shouldAutomaticallySetTextureFilteringForSize(options)) {
              gl.generateMipmap(target);
            }
          });
        }
      }
      if (numToLoad === 0) {
        callback(errors.length ? errors : undefined, tex, imgs);
      }
    };
  }
  imgs = urls.map(function (url, ndx) {
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
  var urls = options.src;
  var internalFormat = options.internalFormat || options.format || RGBA;
  var formatType = getFormatAndTypeForInternalFormat(internalFormat);
  var format = options.format || formatType.format;
  var type = options.type || UNSIGNED_BYTE;
  var target = options.target || TEXTURE_2D_ARRAY;
  if (target !== TEXTURE_3D && target !== TEXTURE_2D_ARRAY) {
    throw new Error("target must be TEXTURE_3D or TEXTURE_2D_ARRAY");
  }
  setTextureTo1PixelColor(gl, tex, options);
  // Because it's async we need to copy the options.
  options = copyOptionsAndApplyPackState(gl, options);
  var numToLoad = urls.length;
  var errors = [];
  var imgs; // eslint-disable-line
  var level = options.level || 0;
  var width = options.width;
  var height = options.height;
  var depth = urls.length;
  var firstImage = true;
  function uploadImg(slice) {
    return function (err, img) {
      --numToLoad;
      if (err) {
        errors.push(err);
      } else {
        scopedSetPackState(gl, options, function () {
          gl.bindTexture(target, tex);
          if (firstImage) {
            firstImage = false;
            width = options.width || img.width;
            height = options.height || img.height;
            gl.texImage3D(target, level, internalFormat, width, height, depth, 0, format, type, null);

            // put it in every slice otherwise some slices will be 0,0,0,0
            for (var s = 0; s < depth; ++s) {
              gl.texSubImage3D(target, level, 0, 0, s, width, height, 1, format, type, img);
            }
          } else {
            var src = img;
            var ctx;
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
        });
      }
      if (numToLoad === 0) {
        callback(errors.length ? errors : undefined, tex, imgs);
      }
    };
  }
  imgs = urls.map(function (url, ndx) {
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
  options = options || defaults.textureOptions;
  var target = options.target || TEXTURE_2D;
  gl.bindTexture(target, tex);
  var level = options.level || 0;
  var internalFormat = options.internalFormat || options.format || RGBA;
  var formatType = getFormatAndTypeForInternalFormat(internalFormat);
  var format = options.format || formatType.format;
  var type = options.type || getTextureTypeForArrayType(gl, src, formatType.type);
  if (!isArrayBuffer(src)) {
    var Type = typedArrays.getTypedArrayTypeForGLType(type);
    src = new Type(src);
  } else if (src instanceof Uint8ClampedArray) {
    src = new Uint8Array(src.buffer);
  }
  var _getTextureSize = getTextureSize(target, src, options, internalFormat, format, type),
    width = _getTextureSize.width,
    height = _getTextureSize.height,
    depth = _getTextureSize.depth;
  var compressed = isCompressedInternalFormat(internalFormat);
  setSkipStateToDefault(gl);
  gl.pixelStorei(UNPACK_ALIGNMENT, options.unpackAlignment || 1);
  var mipLevelOffset = 0; // this is in addition to level
  scopedSetPackState(gl, options, function () {
    var mipLevelByteOffset = 0;
    var _getBlockInfoForInter = getBlockInfoForInternalFormat(internalFormat, type),
      blockWidth = _getBlockInfoForInter.blockWidth,
      blockHeight = _getBlockInfoForInter.blockHeight,
      bytesPerBlock = _getBlockInfoForInter.bytesPerBlock;
    var _loop = function _loop() {
      var mipWidth = Math.max(1, width >> mipLevelOffset);
      var mipHeight = Math.max(1, height >> mipLevelOffset);
      var mipDepth = target === TEXTURE_2D ? Math.max(1, depth >> mipLevelOffset) : depth;
      var blocksAcross = Math.ceil(mipWidth / blockWidth);
      var blocksDown = Math.ceil(mipHeight / blockHeight);
      var numFaces = target === TEXTURE_CUBE_MAP ? 6 : 1;
      var bytesPerMipLevel = blocksAcross * blocksDown * bytesPerBlock * mipDepth * numFaces;
      if (mipLevelByteOffset + bytesPerMipLevel > src.byteLength) {
        throw new Error('src size does not match number of mip levels');
      }
      var mipSource = src.subarray(mipLevelByteOffset / src.BYTES_PER_ELEMENT, (mipLevelByteOffset + bytesPerMipLevel) / src.BYTES_PER_ELEMENT);
      var mipLevel = level + mipLevelOffset;
      if (target === TEXTURE_CUBE_MAP) {
        var faceSize = mipSource.length / 6;
        getCubeFacesWithNdx(gl, options).forEach(function (f) {
          var offset = faceSize * f.ndx;
          var data = mipSource.subarray(offset, offset + faceSize);
          if (compressed) {
            gl.compressedTexImage2D(f.face, mipLevel, internalFormat, mipWidth, mipHeight, 0, data);
          } else {
            gl.texImage2D(f.face, mipLevel, internalFormat, mipWidth, mipHeight, 0, format, type, data);
          }
        });
      } else if (target === TEXTURE_3D || target === TEXTURE_2D_ARRAY) {
        gl.texImage3D(target, mipLevel, internalFormat, mipWidth, mipHeight, mipDepth, 0, format, type, mipSource);
      } else {
        if (compressed) {
          gl.compressedTexImage2D(target, mipLevel, internalFormat, mipWidth, mipHeight, 0, mipSource);
        } else {
          gl.texImage2D(target, mipLevel, internalFormat, mipWidth, mipHeight, 0, format, type, mipSource);
        }
      }
      ++mipLevelOffset;
      mipLevelByteOffset += bytesPerMipLevel;
      if (mipWidth === 1 && mipHeight === 1 && mipDepth === 1 && mipLevelByteOffset !== src.byteLength) {
        throw new Error('src size has more data than can fit in mip levels');
      }
    };
    while (mipLevelByteOffset < src.byteLength) {
      _loop();
    }
  });
  return {
    width: width,
    height: height,
    depth: depth,
    type: type,
    lastMipLevelUploaded: level + mipLevelOffset - 1
  };
}
function getTextureSize(target, src, options, internalFormat, format, type) {
  var width = options.width;
  var height = options.height;
  var depth = options.depth;
  var compressed = isCompressedInternalFormat(internalFormat);
  if (compressed) {
    if (!width || !height) {
      throw new Error("compressed texture needs to set width and height!");
    }
    depth = depth || 1;
  } else {
    var bytesPerElement = getBytesPerElementForInternalFormat(internalFormat, type);
    var numElements = src.byteLength / bytesPerElement; // TODO: check UNPACK_ALIGNMENT?
    if (numElements % 1) {
      throw new Error("length wrong size for format: ".concat(utils.glEnumToString(gl, format)));
    }
    if (compressed && (!width || !height)) {
      throw new Error("compressed texture needs to set width and height!");
    }
    var dimensions;
    if (target === TEXTURE_3D || target === TEXTURE_2D_ARRAY) {
      if (!width && !height && !depth) {
        var size = Math.cbrt(numElements);
        if (size % 1 !== 0) {
          throw new Error("can't guess cube size of array of numElements: ".concat(numElements));
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
  }
  return {
    width: width,
    height: height,
    depth: depth
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
  var target = options.target || TEXTURE_2D;
  gl.bindTexture(target, tex);
  var level = options.level || 0;
  var internalFormat = options.internalFormat || options.format || RGBA;
  var formatType = getFormatAndTypeForInternalFormat(internalFormat);
  var format = options.format || formatType.format;
  var type = options.type || formatType.type;
  scopedSetPackState(gl, options, function () {
    if (target === TEXTURE_CUBE_MAP) {
      for (var ii = 0; ii < 6; ++ii) {
        gl.texImage2D(TEXTURE_CUBE_MAP_POSITIVE_X + ii, level, internalFormat, options.width, options.height, 0, format, type, null);
      }
    } else if (target === TEXTURE_3D || target === TEXTURE_2D_ARRAY) {
      gl.texImage3D(target, level, internalFormat, options.width, options.height, options.depth, 0, format, type, null);
    } else {
      gl.texImage2D(target, level, internalFormat, options.width, options.height, 0, format, type, null);
    }
  });
}

/**
 * Creates a texture based on the options passed in.
 *
 * See {@link module:twgl.TextureOptions}
 *
 * Note: may reset UNPACK_ALIGNMENT, UNPACK_ROW_LENGTH, UNPACK_IMAGE_HEIGHT, UNPACK_SKIP_IMAGES
 * UNPACK_SKIP_PIXELS, and UNPACK_SKIP_ROWS
 *
 * UNPACK_FLIP_Y_WEBGL, UNPACK_PREMULTIPLY_ALPHA_WEBGL, UNPACK_COLORSPACE_CONVERSION_WEBGL
 * are left as is though you can pass in options for flipY, premultiplyAlpha, and colorspaceConversion
 * to override them.
 *
 * As for the behavior of these settings
 *
 * ```js
 * gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
 * t1 = twgl.createTexture({src: someImage }); // flipped
 * t2 = twgl.createTexture({src: someImage, flipY: true }); // flipped
 * t3 = twgl.createTexture({src: someImage, flipY: false }); // not flipped
 * t4 = twgl.createTexture({src: someImage }); // flipped
 * ```
 *
 * * t1 is flipped because UNPACK_FLIP_Y_WEBGL is true
 * * t2 is flipped because it was requested
 * * t3 is not flipped because it was requested
 * * t4 is flipped because UNPACK_FLIP_Y_WEBGL has been restored to true
 *
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
  var target = options.target || TEXTURE_2D;
  var width = options.width || 1;
  var height = options.height || 1;
  var lastMipLevelUploaded = 0;
  var internalFormat = options.internalFormat || RGBA;
  gl.bindTexture(target, tex);
  if (target === TEXTURE_CUBE_MAP) {
    // this should have been the default for cubemaps :(
    gl.texParameteri(target, TEXTURE_WRAP_S, CLAMP_TO_EDGE);
    gl.texParameteri(target, TEXTURE_WRAP_T, CLAMP_TO_EDGE);
  }
  var src = options.src;
  if (src) {
    if (typeof src === "function") {
      src = src(gl, options);
    }
    if (typeof src === "string") {
      loadTextureFromUrl(gl, tex, options, callback);
    } else if (isArrayBuffer(src) || Array.isArray(src) && (typeof src[0] === 'number' || Array.isArray(src[0]) || isArrayBuffer(src[0]))) {
      var dimensions = setTextureFromArray(gl, tex, src, options);
      width = dimensions.width;
      height = dimensions.height;
      lastMipLevelUploaded = dimensions.lastMipLevelUploaded;
    } else if (Array.isArray(src) && (typeof src[0] === 'string' || isTexImageSource(src[0]))) {
      if (target === TEXTURE_CUBE_MAP) {
        loadCubemapFromUrls(gl, tex, options, callback);
      } else {
        loadSlicesFromUrls(gl, tex, options, callback);
      }
    } else {
      // if (isTexImageSource(src))
      setTextureFromElement(gl, tex, src, options);
      width = src.width;
      height = src.height;
    }
  } else {
    setEmptyTexture(gl, tex, options);
  }
  if (shouldAutomaticallySetTextureFilteringForSize(options)) {
    setTextureFilteringForSizeInternal(gl, tex, {
      options: options,
      width: width,
      height: height,
      internalFormat: internalFormat,
      lastMipLevelUploaded: lastMipLevelUploaded
    });
  }
  setTextureParameters(gl, tex, options);
  return tex;
}

/**
 * Value returned by createTextureAsync
 *
 * @typedef {Object} CreateTextureInfo
 * @param {WebGLTexture} texture the texture.
 * @param {module:twgl.TextureSrc} source image(s) used to as the src for the texture
 * @memberOf module:twgl
 */

/**
 * Creates a texture based on the options passed in.
 *
 * see {@link module:twgl/textures.createTexture}.
 * The only difference is this function returns a promise
 * where as the other returns a texture and takes a callback.
 *
 * Note: this is here for completeness. It is probably better to use
 * the non-async version as it returns a usable texture immediately
 * where as this one you have to wait for it to load.
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
 * @return {Promise<CreateTextureInfo>} The created texture and source.
 */
function createTextureAsync(gl, options) {
  return new Promise(function (resolve, reject) {
    createTexture(gl, options, function (err, texture, source) {
      if (err) {
        reject(err);
      } else {
        resolve({
          texture: texture,
          source: source
        });
      }
    });
  });
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
  var target = options.target || TEXTURE_2D;
  gl.bindTexture(target, tex);
  var level = options.level || 0;
  var internalFormat = options.internalFormat || options.format || RGBA;
  var formatType = getFormatAndTypeForInternalFormat(internalFormat);
  var format = options.format || formatType.format;
  var type;
  var src = options.src;
  if (!src) {
    type = options.type || formatType.type;
  } else if (isArrayBuffer(src) || Array.isArray(src) && typeof src[0] === 'number') {
    type = options.type || getTextureTypeForArrayType(gl, src, formatType.type);
  } else {
    type = options.type || formatType.type;
  }
  if (target === TEXTURE_CUBE_MAP) {
    for (var ii = 0; ii < 6; ++ii) {
      gl.texImage2D(TEXTURE_CUBE_MAP_POSITIVE_X + ii, level, internalFormat, width, height, 0, format, type, null);
    }
  } else if (target === TEXTURE_3D || target === TEXTURE_2D_ARRAY) {
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
  return typeof src === 'string' || Array.isArray(src) && typeof src[0] === 'string';
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
  var numDownloading = 0;
  var errors = [];
  var textures = {};
  var images = {};
  function callCallbackIfReady() {
    if (numDownloading === 0) {
      setTimeout(function () {
        callback(errors.length ? errors : undefined, textures, images);
      }, 0);
    }
  }
  Object.keys(textureOptions).forEach(function (name) {
    var options = textureOptions[name];
    var onLoadFn;
    if (isAsyncSrc(options.src)) {
      onLoadFn = function onLoadFn(err, tex, img) {
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

/**
 * Value returned by createTextureAsync
 *
 * @typedef {Object} CreateTexturesInfo
 * @param {Object.<string, WebGLTexture>} textures the created textures by name. Same as returned by {@link module:twgl.createTextures}.
 * @param {Object.<string, module:twgl.TextureSrc>} sources the image(s) used for the texture by name.
 * @memberOf module:twgl
 */

/**
 * Creates textures based on the options passed in.
 *
 * see {@link module:twgl/textures.createTextures}.
 * The only difference is this function returns a promise
 * where as the other returns a texture and takes a callback.
 *
 * Note: this is here for completeness. It is probably better to use
 * the non-async version as it returns usable textures immediately
 * where as this one you have to wait for them to load.
 *
 * @param {WebGLRenderingContext} gl the WebGLRenderingContext
 * @param {Object.<string,module:twgl.TextureOptions>} options A object of TextureOptions one per texture.
 * @return {Promise<CreateTexturesInfo>} The created textures and sources.
 */
function createTexturesAsync(gl, options) {
  return new Promise(function (resolve, reject) {
    createTexture(gl, options, function (err, textures, sources) {
      if (err) {
        reject(err);
      } else {
        resolve({
          textures: textures,
          sources: sources
        });
      }
    });
  });
}

/***/ }),

/***/ "./src/twgl-base.js":
/*!**************************!*\
  !*** ./src/twgl-base.js ***!
  \**************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



exports.__esModule = true;
var _twgl = __webpack_require__(/*! ./twgl.js */ "./src/twgl.js");
Object.keys(_twgl).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _twgl[key]) return;
  exports[key] = _twgl[key];
});

/***/ }),

/***/ "./src/twgl.js":
/*!*********************!*\
  !*** ./src/twgl.js ***!
  \*********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
exports.__esModule = true;
var _exportNames = {
  addExtensionsToContext: true,
  getContext: true,
  getWebGLContext: true,
  resizeCanvasToDisplaySize: true,
  setDefaults: true,
  attributes: true,
  textures: true,
  utils: true,
  draw: true,
  framebuffers: true,
  programs: true,
  typedarrays: true,
  vertexArrays: true
};
exports.addExtensionsToContext = addExtensionsToContext;
exports.framebuffers = exports.draw = exports.attributes = void 0;
exports.getContext = getContext;
exports.getWebGLContext = getWebGLContext;
exports.programs = void 0;
exports.resizeCanvasToDisplaySize = resizeCanvasToDisplaySize;
exports.setDefaults = setDefaults;
exports.vertexArrays = exports.utils = exports.typedarrays = exports.textures = void 0;
var attributes = _interopRequireWildcard(__webpack_require__(/*! ./attributes.js */ "./src/attributes.js"));
exports.attributes = attributes;
Object.keys(attributes).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === attributes[key]) return;
  exports[key] = attributes[key];
});
var textures = _interopRequireWildcard(__webpack_require__(/*! ./textures.js */ "./src/textures.js"));
exports.textures = textures;
Object.keys(textures).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === textures[key]) return;
  exports[key] = textures[key];
});
var helper = _interopRequireWildcard(__webpack_require__(/*! ./helper.js */ "./src/helper.js"));
var utils = _interopRequireWildcard(__webpack_require__(/*! ./utils.js */ "./src/utils.js"));
exports.utils = utils;
Object.keys(utils).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === utils[key]) return;
  exports[key] = utils[key];
});
var draw = _interopRequireWildcard(__webpack_require__(/*! ./draw.js */ "./src/draw.js"));
exports.draw = draw;
Object.keys(draw).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === draw[key]) return;
  exports[key] = draw[key];
});
var framebuffers = _interopRequireWildcard(__webpack_require__(/*! ./framebuffers.js */ "./src/framebuffers.js"));
exports.framebuffers = framebuffers;
Object.keys(framebuffers).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === framebuffers[key]) return;
  exports[key] = framebuffers[key];
});
var programs = _interopRequireWildcard(__webpack_require__(/*! ./programs.js */ "./src/programs.js"));
exports.programs = programs;
Object.keys(programs).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === programs[key]) return;
  exports[key] = programs[key];
});
var typedarrays = _interopRequireWildcard(__webpack_require__(/*! ./typedarrays.js */ "./src/typedarrays.js"));
exports.typedarrays = typedarrays;
Object.keys(typedarrays).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === typedarrays[key]) return;
  exports[key] = typedarrays[key];
});
var vertexArrays = _interopRequireWildcard(__webpack_require__(/*! ./vertex-arrays.js */ "./src/vertex-arrays.js"));
exports.vertexArrays = vertexArrays;
Object.keys(vertexArrays).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === vertexArrays[key]) return;
  exports[key] = vertexArrays[key];
});
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
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
var gl = undefined; /* eslint-disable-line */
var defaults = {
  addExtensionsToContext: true
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
  helper.copyExistingProperties(newDefaults, defaults);
  attributes.setAttributeDefaults_(newDefaults); // eslint-disable-line
  textures.setTextureDefaults_(newDefaults); // eslint-disable-line
}
var prefixRE = /^(.*?)_/;
function addExtensionToContext(gl, extensionName) {
  utils.glEnumToString(gl, 0);
  var ext = gl.getExtension(extensionName);
  if (ext) {
    var enums = {};
    var fnSuffix = prefixRE.exec(extensionName)[1];
    var enumSuffix = '_' + fnSuffix;
    for (var key in ext) {
      var value = ext[key];
      var isFunc = typeof value === 'function';
      var suffix = isFunc ? fnSuffix : enumSuffix;
      var name = key;
      // examples of where this is not true are WEBGL_compressed_texture_s3tc
      // and WEBGL_compressed_texture_pvrtc
      if (key.endsWith(suffix)) {
        name = key.substring(0, key.length - suffix.length);
      }
      if (gl[name] !== undefined) {
        if (!isFunc && gl[name] !== value) {
          helper.warn(name, gl[name], value, key);
        }
      } else {
        if (isFunc) {
          gl[name] = function (origFn) {
            return function () {
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
      name: ext.constructor.name
    };
    utils.glEnumToString(enums, 0);
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
var supportedExtensions = ['ANGLE_instanced_arrays', 'EXT_blend_minmax', 'EXT_color_buffer_float', 'EXT_color_buffer_half_float', 'EXT_disjoint_timer_query', 'EXT_disjoint_timer_query_webgl2', 'EXT_frag_depth', 'EXT_sRGB', 'EXT_shader_texture_lod', 'EXT_texture_compression_bptc', 'EXT_texture_compression_rgtc', 'EXT_texture_filter_anisotropic', 'OES_element_index_uint', 'OES_standard_derivatives', 'OES_texture_float', 'OES_texture_float_linear', 'OES_texture_half_float', 'OES_texture_half_float_linear', 'OES_vertex_array_object', 'WEBGL_color_buffer_float', 'WEBGL_compressed_texture_atc', 'WEBGL_compressed_texture_etc1', 'WEBGL_compressed_texture_etc', 'WEBGL_compressed_texture_pvrtc', 'WEBGL_compressed_texture_s3tc', 'WEBGL_compressed_texture_s3tc_srgb', 'WEBGL_depth_texture', 'WEBGL_draw_buffers'];

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
  for (var ii = 0; ii < supportedExtensions.length; ++ii) {
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
  var names = ["webgl", "experimental-webgl"];
  var context = null;
  for (var ii = 0; ii < names.length; ++ii) {
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
  var gl = create3DContext(canvas, opt_attribs);
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
  var names = ["webgl2", "webgl", "experimental-webgl"];
  var context = null;
  for (var ii = 0; ii < names.length; ++ii) {
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
  var gl = createContext(canvas, opt_attribs);
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
  var width = canvas.clientWidth * multiplier | 0;
  var height = canvas.clientHeight * multiplier | 0;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
}

// function notPrivate(name) {
//   return name[name.length - 1] !== '_';
// }
//
// function copyPublicProperties(src, dst) {
//   Object.keys(src).filter(notPrivate).forEach(function(key) {
//     dst[key] = src[key];
//   });
//   return dst;
// }

/***/ }),

/***/ "./src/typedarrays.js":
/*!****************************!*\
  !*** ./src/typedarrays.js ***!
  \****************************/
/***/ ((__unused_webpack_module, exports) => {



exports.__esModule = true;
exports.getGLTypeForTypedArray = getGLTypeForTypedArray;
exports.getGLTypeForTypedArrayType = getGLTypeForTypedArrayType;
exports.getTypedArrayTypeForGLType = getTypedArrayTypeForGLType;
exports.isArrayBuffer = void 0;
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
 * Low level shader typed array related functions
 *
 * You should generally not need to use these functions. They are provided
 * for those cases where you're doing something out of the ordinary
 * and you need lower level access.
 *
 * For backward compatibility they are available at both `twgl.typedArray` and `twgl`
 * itself
 *
 * See {@link module:twgl} for core functions
 *
 * @module twgl/typedArray
 */

// make sure we don't see a global gl
var gl = undefined; /* eslint-disable-line */

/* DataType */
var BYTE = 0x1400;
var UNSIGNED_BYTE = 0x1401;
var SHORT = 0x1402;
var UNSIGNED_SHORT = 0x1403;
var INT = 0x1404;
var UNSIGNED_INT = 0x1405;
var FLOAT = 0x1406;
var UNSIGNED_SHORT_4_4_4_4 = 0x8033;
var UNSIGNED_SHORT_5_5_5_1 = 0x8034;
var UNSIGNED_SHORT_5_6_5 = 0x8363;
var HALF_FLOAT = 0x140B;
var UNSIGNED_INT_2_10_10_10_REV = 0x8368;
var UNSIGNED_INT_10F_11F_11F_REV = 0x8C3B;
var UNSIGNED_INT_5_9_9_9_REV = 0x8C3E;
var FLOAT_32_UNSIGNED_INT_24_8_REV = 0x8DAD;
var UNSIGNED_INT_24_8 = 0x84FA;
var glTypeToTypedArray = {};
{
  var tt = glTypeToTypedArray;
  tt[BYTE] = Int8Array;
  tt[UNSIGNED_BYTE] = Uint8Array;
  tt[SHORT] = Int16Array;
  tt[UNSIGNED_SHORT] = Uint16Array;
  tt[INT] = Int32Array;
  tt[UNSIGNED_INT] = Uint32Array;
  tt[FLOAT] = Float32Array;
  tt[UNSIGNED_SHORT_4_4_4_4] = Uint16Array;
  tt[UNSIGNED_SHORT_5_5_5_1] = Uint16Array;
  tt[UNSIGNED_SHORT_5_6_5] = Uint16Array;
  tt[HALF_FLOAT] = Uint16Array;
  tt[UNSIGNED_INT_2_10_10_10_REV] = Uint32Array;
  tt[UNSIGNED_INT_10F_11F_11F_REV] = Uint32Array;
  tt[UNSIGNED_INT_5_9_9_9_REV] = Uint32Array;
  tt[FLOAT_32_UNSIGNED_INT_24_8_REV] = Uint32Array;
  tt[UNSIGNED_INT_24_8] = Uint32Array;
}

/**
 * Get the GL type for a typedArray
 * @param {ArrayBufferView} typedArray a typedArray
 * @return {number} the GL type for array. For example pass in an `Int8Array` and `gl.BYTE` will
 *   be returned. Pass in a `Uint32Array` and `gl.UNSIGNED_INT` will be returned
 * @memberOf module:twgl/typedArray
 */
function getGLTypeForTypedArray(typedArray) {
  if (typedArray instanceof Int8Array) {
    return BYTE;
  } // eslint-disable-line
  if (typedArray instanceof Uint8Array) {
    return UNSIGNED_BYTE;
  } // eslint-disable-line
  if (typedArray instanceof Uint8ClampedArray) {
    return UNSIGNED_BYTE;
  } // eslint-disable-line
  if (typedArray instanceof Int16Array) {
    return SHORT;
  } // eslint-disable-line
  if (typedArray instanceof Uint16Array) {
    return UNSIGNED_SHORT;
  } // eslint-disable-line
  if (typedArray instanceof Int32Array) {
    return INT;
  } // eslint-disable-line
  if (typedArray instanceof Uint32Array) {
    return UNSIGNED_INT;
  } // eslint-disable-line
  if (typedArray instanceof Float32Array) {
    return FLOAT;
  } // eslint-disable-line
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
  if (typedArrayType === Int8Array) {
    return BYTE;
  } // eslint-disable-line
  if (typedArrayType === Uint8Array) {
    return UNSIGNED_BYTE;
  } // eslint-disable-line
  if (typedArrayType === Uint8ClampedArray) {
    return UNSIGNED_BYTE;
  } // eslint-disable-line
  if (typedArrayType === Int16Array) {
    return SHORT;
  } // eslint-disable-line
  if (typedArrayType === Uint16Array) {
    return UNSIGNED_SHORT;
  } // eslint-disable-line
  if (typedArrayType === Int32Array) {
    return INT;
  } // eslint-disable-line
  if (typedArrayType === Uint32Array) {
    return UNSIGNED_INT;
  } // eslint-disable-line
  if (typedArrayType === Float32Array) {
    return FLOAT;
  } // eslint-disable-line
  throw new Error('unsupported typed array type');
}

/**
 * Get the typed array constructor for a given GL type
 * @param {number} type the GL type. (eg: `gl.UNSIGNED_INT`)
 * @return {function} the constructor for a the corresponding typed array. (eg. `Uint32Array`).
 * @memberOf module:twgl/typedArray
 */
function getTypedArrayTypeForGLType(type) {
  var CTOR = glTypeToTypedArray[type];
  if (!CTOR) {
    throw new Error('unknown gl type');
  }
  return CTOR;
}
var isArrayBuffer = exports.isArrayBuffer = typeof SharedArrayBuffer !== 'undefined' ? function isArrayBufferOrSharedArrayBuffer(a) {
  return a && a.buffer && (a.buffer instanceof ArrayBuffer || a.buffer instanceof SharedArrayBuffer);
} : function isArrayBuffer(a) {
  return a && a.buffer && a.buffer instanceof ArrayBuffer;
};

/***/ }),

/***/ "./src/utils.js":
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/***/ ((__unused_webpack_module, exports) => {



exports.__esModule = true;
exports.glEnumToString = void 0;
exports.isWebGL1 = isWebGL1;
exports.isWebGL2 = isWebGL2;
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
var glEnumToString = exports.glEnumToString = function () {
  var haveEnumsForType = {};
  var enums = {};
  function addEnums(gl) {
    var type = gl.constructor.name;
    if (!haveEnumsForType[type]) {
      for (var key in gl) {
        if (typeof gl[key] === 'number') {
          var existing = enums[gl[key]];
          enums[gl[key]] = existing ? "".concat(existing, " | ").concat(key) : key;
        }
      }
      haveEnumsForType[type] = true;
    }
  }
  return function glEnumToString(gl, value) {
    addEnums(gl);
    return enums[value] || (typeof value === 'number' ? "0x".concat(value.toString(16)) : value);
  };
}();

/***/ }),

/***/ "./src/vertex-arrays.js":
/*!******************************!*\
  !*** ./src/vertex-arrays.js ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
exports.__esModule = true;
exports.createVAOAndSetAttributes = createVAOAndSetAttributes;
exports.createVAOFromBufferInfo = createVAOFromBufferInfo;
exports.createVertexArrayInfo = createVertexArrayInfo;
var programs = _interopRequireWildcard(__webpack_require__(/*! ./programs.js */ "./src/programs.js"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
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

var ELEMENT_ARRAY_BUFFER = 0x8893;

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
  var vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  if (!programInfos.length) {
    programInfos = [programInfos];
  }
  programInfos.forEach(function (programInfo) {
    programs.setBuffersAndAttributes(gl, programInfo, bufferInfo);
  });
  gl.bindVertexArray(null);
  return {
    numElements: bufferInfo.numElements,
    elementType: bufferInfo.elementType,
    vertexArrayObject: vao
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
  var vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  programs.setAttributes(setters, attribs);
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

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/twgl-base.js");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=twgl.js.map