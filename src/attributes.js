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
   * Low level attribute and buffer related functions
   *
   * You should generally not need to use these functions. They are provided
   * for those cases where you're doing something out of the ordinary
   * and you need lower level access.
   *
   * For backward compatibily they are available at both `twgl.attributes` and `twgl`
   * itself
   *
   * See {@link module:twgl} for core functions
   *
   * @module twgl/attributes
   */

  // make sure we don't see a global gl
  var gl = undefined;  // eslint-disable-line
  var defaults = {
    attribPrefix: "",
  };

  /**
   * Sets the default attrib prefix
   *
   * When writing shaders I prefer to name attributes with `a_`, uniforms with `u_` and varyings with `v_`
   * as it makes it clear where they came from. But, when building geometry I prefer using unprefixed names.
   *
   * In otherwords I'll create arrays of geometry like this
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
    utils.copyExistingProperties(newDefaults, defaults);
  }

  function setBufferFromTypedArray(gl, type, buffer, array, drawType) {
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, array, drawType || gl.STATIC_DRAW);
  }

  /**
   * Given typed array creates a WebGLBuffer and copies the typed array
   * into it.
   *
   * @param {WebGLRenderingContext} gl A WebGLRenderingContext
   * @param {ArrayBuffer|ArrayBufferView|WebGLBuffer} typedArray the typed array. Note: If a WebGLBuffer is passed in it will just be returned. No action will be taken
   * @param {number} [type] the GL bind type for the buffer. Default = `gl.ARRAY_BUFFER`.
   * @param {number} [drawType] the GL draw type for the buffer. Default = 'gl.STATIC_DRAW`.
   * @return {WebGLBuffer} the created WebGLBuffer
   * @memberOf module:twgl/attributes
   */
  function createBufferFromTypedArray(gl, typedArray, type, drawType) {
    if (typedArray instanceof WebGLBuffer) {
      return typedArray;
    }
    type = type || gl.ARRAY_BUFFER;
    var buffer = gl.createBuffer();
    setBufferFromTypedArray(gl, type, buffer, typedArray, drawType);
    return buffer;
  }

  function isIndices(name) {
    return name === "indices";
  }

  // This is really just a guess. Though I can't really imagine using
  // anything else? Maybe for some compression?
  function getNormalizationForTypedArray(typedArray) {
    if (typedArray instanceof Int8Array)    { return true; }  // eslint-disable-line
    if (typedArray instanceof Uint8Array)   { return true; }  // eslint-disable-line
    return false;
  }

  function getArray(array) {
    return array.length ? array : array.data;
  }

  function guessNumComponentsFromName(name, length) {
    var numComponents;
    if (name.indexOf("coord") >= 0) {
      numComponents = 2;
    } else if (name.indexOf("color") >= 0) {
      numComponents = 4;
    } else {
      numComponents = 3;  // position, normals, indices ...
    }

    if (length % numComponents > 0) {
      throw "can not guess numComponents. You should specify it.";
    }

    return numComponents;
  }

  function getNumComponents(array, arrayName) {
    return array.numComponents || array.size || guessNumComponentsFromName(arrayName, getArray(array).length);
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
        data: array,
      };
    }

    var Type = array.type;
    if (!Type) {
      if (name === "indices") {
        Type = Uint16Array;
      } else {
        Type = Float32Array;
      }
    }
    return new Type(array.data);
  }

  /**
   * The info for an attribute. This is effectively just the arguments to `gl.vertexAttribPointer` plus the WebGLBuffer
   * for the attribute.
   *
   * @typedef {Object} AttribInfo
   * @property {number} [numComponents] the number of components for this attribute.
   * @property {number} [size] synonym for `numComponents`.
   * @property {number} [type] the type of the attribute (eg. `gl.FLOAT`, `gl.UNSIGNED_BYTE`, etc...) Default = `gl.FLOAT`
   * @property {boolean} [normalized] whether or not to normalize the data. Default = false
   * @property {number} [offset] offset into buffer in bytes. Default = 0
   * @property {number} [stride] the stride in bytes per element. Default = 0
   * @property {WebGLBuffer} buffer the buffer that contains the data for this attribute
   * @property {number} [drawType] the draw type passed to gl.bufferData. Default = gl.STATIC_DRAW
   * @memberOf module:twgl
   */

  /**
   * Use this type of array spec when TWGL can't guess the type or number of compoments of an array
   * @typedef {Object} FullArraySpec
   * @property {(number[]|ArrayBuffer)} data The data of the array.
   * @property {number} [numComponents] number of components for `vertexAttribPointer`. Default is based on the name of the array.
   *    If `coord` is in the name assumes `numComponents = 2`.
   *    If `color` is in the name assumes `numComponents = 4`.
   *    otherwise assumes `numComponents = 3`
   * @property {constructor} type The type. This is only used if `data` is a JavaScript array. It is the constructor for the typedarray. (eg. `Uint8Array`).
   * For example if you want colors in a `Uint8Array` you might have a `FullArraySpec` like `{ type: Uint8Array, data: [255,0,255,255, ...], }`.
   * @property {number} [size] synonym for `numComponents`.
   * @property {boolean} [normalize] normalize for `vertexAttribPointer`. Default is true if type is `Int8Array` or `Uint8Array` otherwise false.
   * @property {number} [stride] stride for `vertexAttribPointer`. Default = 0
   * @property {number} [offset] offset for `vertexAttribPointer`. Default = 0
   * @property {string} [attrib] name of attribute this array maps to. Defaults to same name as array prefixed by the default attribPrefix.
   * @property {string} [name] synonym for `attrib`.
   * @property {string} [attribName] synonym for `attrib`.
   * @memberOf module:twgl
   */

  /**
   * An individual array in {@link module:twgl.Arrays}
   *
   * When passed to {@link module:twgl.createBufferInfoFromArrays} if an ArraySpec is `number[]` or `ArrayBuffer`
   * the types will be guessed based on the name. `indices` will be `Uint16Array`, everything else will
   * be `Float32Array`
   *
   * @typedef {(number[]|ArrayBuffer|module:twgl.FullArraySpec)} ArraySpec
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
   * @return {Object.<string, module:twgl.AttribInfo>} the attribs
   * @memberOf module:twgl/attributes
   */
  function createAttribsFromArrays(gl, arrays) {
    var attribs = {};
    Object.keys(arrays).forEach(function(arrayName) {
      if (!isIndices(arrayName)) {
        var array = arrays[arrayName];
        var attribName = array.attrib || array.name || array.attribName || (defaults.attribPrefix + arrayName);
        var typedArray = makeTypedArray(array, arrayName);
        attribs[attribName] = {
          buffer:        createBufferFromTypedArray(gl, typedArray, undefined, array.drawType),
          numComponents: getNumComponents(array, arrayName),
          type:          typedArrays.getGLTypeForTypedArray(typedArray),
          normalize:     array.normalize !== undefined ? array.normalize : getNormalizationForTypedArray(typedArray),
          stride:        array.stride || 0,
          offset:        array.offset || 0,
          drawType:      array.drawType,
        };
      }
    });
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
   *  And you want to dynamically upate the positions. You could do this
   *
   *     // assuming arrays.position has already been updated with new data.
   *     twgl.setAttribInfoBufferFromArray(gl, bufferInfo.attribs.position, arrays.position);
   *
   * @param {WebGLRenderingContext} gl
   * @param {AttribInfo} attribInfo The attribInfo who's buffer contents to set. NOTE: If you have an attribute prefix
   *   the name of the attribute will include the prefix.
   * @param {ArraySpec} array Note: it is arguably ineffient to pass in anything but a typed array because anything
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
    if (offset) {
      gl.bindBuffer(gl.ARRAY_BUFFER, attribInfo.buffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, offset, array);
    } else {
      setBufferFromTypedArray(gl, gl.ARRAY_BUFFER, attribInfo.buffer, array, attribInfo.drawType);
    }
  }

  /**
   * tries to get the number of elements from a set of arrays.
   */

  var getNumElementsFromNonIndexedArrays = (function() {
    var positionKeys = ['position', 'positions', 'a_position'];

    return function getNumElementsFromNonIndexedArrays(arrays) {
      var key;
      for (var ii = 0; ii < positionKeys.length; ++ii) {
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
      var numComponents = getNumComponents(array, key);
      var numElements = length / numComponents;
      if (length % numComponents > 0) {
        throw "numComponents " + numComponents + " not correct for length " + length;
      }
      return numElements;
    };
  }());

  /**
   * @typedef {Object} BufferInfo
   * @property {number} numElements The number of elements to pass to `gl.drawArrays` or `gl.drawElements`.
   * @property {number} [elementType] The type of indices `UNSIGNED_BYTE`, `UNSIGNED_SHORT` etc..
   * @property {WebGLBuffer} [indices] The indices `ELEMENT_ARRAY_BUFFER` if any indices exist.
   * @property {Object.<string, module:twgl.AttribInfo>} [attribs] The attribs approriate to call `setAttributes`
   * @memberOf module:twgl
   */

  /**
   * @typedef {Object} VertexArrayInfo
   * @property {number} numElements The number of elements to pass to `gl.drawArrays` or `gl.drawElements`.
   * @property {number} [elementType] The type of indices `UNSIGNED_BYTE`, `UNSIGNED_SHORT` etc..
   * @property {WebGLVertexArrayObject> [vertexArrayObject] a vertex array object
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
   *         a_position: { buffer: WebGLBuffer, numComponents: 3, },
   *         a_normal:   { buffer: WebGLBuffer, numComponents: 3, },
   *         a_texcoord: { buffer: WebGLBuffer, numComponents: 2, },
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
   *  They can also by TypedArrays
   *
   *     var arrays = {
   *        position: new Float32Array([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]),
   *        texcoord: new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]),
   *        normal:   new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
   *        indices:  new Uint16Array([0, 1, 2, 1, 2, 3]),
   *     };
   *
   *  Or augmentedTypedArrays
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
   *         a_position: { numComponents: 3, buffer: gl.createBuffer(), },
   *         a_texcoods: { numComponents: 2, buffer: gl.createBuffer(), },
   *         a_normals: { numComponents: 3, buffer: gl.createBuffer(), },
   *       },
   *       indices: gl.createBuffer(),
   *       numElements: 6,
   *     };
   *
   *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_position.buffer);
   *     gl.bufferData(gl.ARRAY_BUFFER, arrays.position, gl.STATIC_DRAW);
   *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_texcoord.buffer);
   *     gl.bufferData(gl.ARRAY_BUFFER, arrays.texcoord, gl.STATIC_DRAW);
   *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_normal.buffer);
   *     gl.bufferData(gl.ARRAY_BUFFER, arrays.normal, gl.STATIC_DRAW);
   *     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indices);
   *     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrays.indices, gl.STATIC_DRAW);
   *
   * @param {WebGLRenderingContext} gl A WebGLRenderingContext
   * @param {module:twgl.Arrays} arrays Your data
   * @return {module:twgl.BufferInfo} A BufferInfo
   * @memberOf module:twgl/attributes
   */
  function createBufferInfoFromArrays(gl, arrays) {
    var bufferInfo = {
      attribs: createAttribsFromArrays(gl, arrays),
    };
    var indices = arrays.indices;
    if (indices) {
      indices = makeTypedArray(indices, "indices");
      bufferInfo.indices = createBufferFromTypedArray(gl, indices, gl.ELEMENT_ARRAY_BUFFER);
      bufferInfo.numElements = indices.length;
      bufferInfo.elementType = typedArrays.getGLTypeForTypedArray(indices);
    } else {
      bufferInfo.numElements = getNumElementsFromNonIndexedArrays(arrays);
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
   * returns a WebGLBuffer that constains the given data.
   *
   * @param {WebGLRenderingContext} gl A WebGLRenderingContext.
   * @param {module:twgl.ArraySpec} array an array, typed array, or array spec.
   * @param {string} arrayName name of array. Used to guess the type if type can not be dervied other wise.
   * @return {WebGLBuffer} a WebGLBuffer containing the data in array.
   * @memberOf module:twgl/attributes
   */
  function createBufferFromArray(gl, array, arrayName) {
    var type = arrayName === "indices" ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
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
    var buffers = { };
    Object.keys(arrays).forEach(function(key) {
      buffers[key] = createBufferFromArray(gl, arrays[key], key);
    });

    return buffers;
  }

  /**
   * Creates a BufferInfo from an object of arrays.
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
   * @memberOf module:twgl/attributes
   */
  function createVertexArrayInfo(gl, programInfos, bufferInfo) {
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    if (!programInfos.length) {
      programInfos = [programInfos];
    }
    programInfos.forEach(function(programInfo) {
      twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    });
    gl.bindVertexArray(null);
    return {
      numElements: bufferInfo.numElements,
      elementType: bufferInfo.elementType,
      vertexArrayObject: vao,
    };
  }

  // Using quotes prevents Uglify from changing the names.
  // No speed diff AFAICT.
  return {
    "createAttribsFromArrays": createAttribsFromArrays,
    "createBuffersFromArrays": createBuffersFromArrays,
    "createBufferFromArray": createBufferFromArray,
    "createBufferFromTypedArray": createBufferFromTypedArray,
    "createBufferInfoFromArrays": createBufferInfoFromArrays,
    "setAttribInfoBufferFromArray": setAttribInfoBufferFromArray,

    "createVertexArrayInfo": createVertexArrayInfo,

    "setAttributePrefix": setAttributePrefix,

    "setDefaults_": setDefaults,
    "getNumComponents_": getNumComponents,
    "getArray_": getArray,
  };

});

