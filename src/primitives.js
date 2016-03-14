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

/**
 * Various functions to make simple primitives
 *
 * note: Most primitive functions come in 3 styles
 *
 * *  `createSomeShapeBufferInfo`
 *
 *    These functions are almost always the functions you want to call. They
 *    create vertices then make WebGLBuffers and create {@link module:twgl.AttribInfo}s
 *    returing a {@link module:twgl.BufferInfo} you can pass to {@link module:twgl.setBuffersAndAttributes}
 *    and {@link module:twgl.drawBufferInfo} etc...
 *
 * *  `createSomeShapeBuffers`
 *
 *    These create WebGLBuffers and put your data in them but nothing else.
 *    It's a shortcut to doing it yourself if you don't want to use
 *    the higher level functions.
 *
 * *  `createSomeShapeVertices`
 *
 *    These just create vertices, no buffers. This allows you to manipulate the vertices
 *    or add more data before generating a {@link module:twgl.BufferInfo}. Once you're finished
 *    manipulating the vertices call {@link module:twgl.createBufferInfoFromArrays}.
 *
 *    example:
 *
 *        var arrays = twgl.primitives.createPlaneArrays(1);
 *        twgl.primitives.reorientVertices(arrays, m4.rotationX(Math.PI * 0.5));
 *        var bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
 *
 * @module twgl/primitives
 */
define([
    './attributes',
    './twgl',
    './utils',
    './m4',
    './v3',
  ], function(
    attributes,
    twgl,
    utils,
    m4,
    v3
  ) {
  "use strict";

  var getArray = attributes.getArray_;  // eslint-disable-line
  var getNumComponents = attributes.getNumComponents_;  // eslint-disable-line

  /**
   * Add `push` to a typed array. It just keeps a 'cursor'
   * and allows use to `push` values into the array so we
   * don't have to manually compute offsets
   * @param {TypedArray} typedArray TypedArray to augment
   * @param {number} numComponents number of components.
   */
  function augmentTypedArray(typedArray, numComponents) {
    var cursor = 0;
    typedArray.push = function() {
      for (var ii = 0; ii < arguments.length; ++ii) {
        var value = arguments[ii];
        if (value instanceof Array || (value.buffer && value.buffer instanceof ArrayBuffer)) {
          for (var jj = 0; jj < value.length; ++jj) {
            typedArray[cursor++] = value[jj];
          }
        } else {
          typedArray[cursor++] = value;
        }
      }
    };
    typedArray.reset = function(opt_index) {
      cursor = opt_index || 0;
    };
    typedArray.numComponents = numComponents;
    Object.defineProperty(typedArray, 'numElements', {
      get: function() {
        return this.length / this.numComponents | 0;
      },
    });
    return typedArray;
  }

  /**
   * creates a typed array with a `push` function attached
   * so that you can easily *push* values.
   *
   * `push` can take multiple arguments. If an argument is an array each element
   * of the array will be added to the typed array.
   *
   * Example:
   *
   *     var array = createAugmentedTypedArray(3, 2);  // creates a Float32Array with 6 values
   *     array.push(1, 2, 3);
   *     array.push([4, 5, 6]);
   *     // array now contains [1, 2, 3, 4, 5, 6]
   *
   * Also has `numComponents` and `numElements` properties.
   *
   * @param {number} numComponents number of components
   * @param {number} numElements number of elements. The total size of the array will be `numComponents * numElements`.
   * @param {constructor} opt_type A constructor for the type. Default = `Float32Array`.
   * @return {ArrayBuffer} A typed array.
   * @memberOf module:twgl/primitives
   */
  function createAugmentedTypedArray(numComponents, numElements, opt_type) {
    var Type = opt_type || Float32Array;
    return augmentTypedArray(new Type(numComponents * numElements), numComponents);
  }

  function allButIndices(name) {
    return name !== "indices";
  }

  /**
   * Given indexed vertices creates a new set of vertices unindexed by expanding the indexed vertices.
   * @param {Object.<string, TypedArray>} vertices The indexed vertices to deindex
   * @return {Object.<string, TypedArray>} The deindexed vertices
   * @memberOf module:twgl/primitives
   */
  function deindexVertices(vertices) {
    var indices = vertices.indices;
    var newVertices = {};
    var numElements = indices.length;

    function expandToUnindexed(channel) {
      var srcBuffer = vertices[channel];
      var numComponents = srcBuffer.numComponents;
      var dstBuffer = createAugmentedTypedArray(numComponents, numElements, srcBuffer.constructor);
      for (var ii = 0; ii < numElements; ++ii) {
        var ndx = indices[ii];
        var offset = ndx * numComponents;
        for (var jj = 0; jj < numComponents; ++jj) {
          dstBuffer.push(srcBuffer[offset + jj]);
        }
      }
      newVertices[channel] = dstBuffer;
    }

    Object.keys(vertices).filter(allButIndices).forEach(expandToUnindexed);

    return newVertices;
  }

  /**
   * flattens the normals of deindexed vertices in place.
   * @param {Object.<string, TypedArray>} vertices The deindexed vertices who's normals to flatten
   * @return {Object.<string, TypedArray>} The flattened vertices (same as was passed in)
   * @memberOf module:twgl/primitives
   */
  function flattenNormals(vertices) {
    if (vertices.indices) {
      throw "can't flatten normals of indexed vertices. deindex them first";
    }

    var normals = vertices.normal;
    var numNormals = normals.length;
    for (var ii = 0; ii < numNormals; ii += 9) {
      // pull out the 3 normals for this triangle
      var nax = normals[ii + 0];
      var nay = normals[ii + 1];
      var naz = normals[ii + 2];

      var nbx = normals[ii + 3];
      var nby = normals[ii + 4];
      var nbz = normals[ii + 5];

      var ncx = normals[ii + 6];
      var ncy = normals[ii + 7];
      var ncz = normals[ii + 8];

      // add them
      var nx = nax + nbx + ncx;
      var ny = nay + nby + ncy;
      var nz = naz + nbz + ncz;

      // normalize them
      var length = Math.sqrt(nx * nx + ny * ny + nz * nz);

      nx /= length;
      ny /= length;
      nz /= length;

      // copy them back in
      normals[ii + 0] = nx;
      normals[ii + 1] = ny;
      normals[ii + 2] = nz;

      normals[ii + 3] = nx;
      normals[ii + 4] = ny;
      normals[ii + 5] = nz;

      normals[ii + 6] = nx;
      normals[ii + 7] = ny;
      normals[ii + 8] = nz;
    }

    return vertices;
  }

  function applyFuncToV3Array(array, matrix, fn) {
    var len = array.length;
    var tmp = new Float32Array(3);
    for (var ii = 0; ii < len; ii += 3) {
      fn(matrix, [array[ii], array[ii + 1], array[ii + 2]], tmp);
      array[ii    ] = tmp[0];
      array[ii + 1] = tmp[1];
      array[ii + 2] = tmp[2];
    }
  }

  function transformNormal(mi, v, dst) {
    dst = dst || v3.create();
    var v0 = v[0];
    var v1 = v[1];
    var v2 = v[2];

    dst[0] = v0 * mi[0 * 4 + 0] + v1 * mi[0 * 4 + 1] + v2 * mi[0 * 4 + 2];
    dst[1] = v0 * mi[1 * 4 + 0] + v1 * mi[1 * 4 + 1] + v2 * mi[1 * 4 + 2];
    dst[2] = v0 * mi[2 * 4 + 0] + v1 * mi[2 * 4 + 1] + v2 * mi[2 * 4 + 2];

    return dst;
  }

  /**
   * Reorients directions by the given matrix..
   * @param {number[]|TypedArray} array The array. Assumes value floats per element.
   * @param {Matrix} matrix A matrix to multiply by.
   * @return {number[]|TypedArray} the same array that was passed in
   * @memberOf module:twgl/primitives
   */
  function reorientDirections(array, matrix) {
    applyFuncToV3Array(array, matrix, m4.transformDirection);
    return array;
  }

  /**
   * Reorients normals by the inverse-transpose of the given
   * matrix..
   * @param {number[]|TypedArray} array The array. Assumes value floats per element.
   * @param {Matrix} matrix A matrix to multiply by.
   * @return {number[]|TypedArray} the same array that was passed in
   * @memberOf module:twgl/primitives
   */
  function reorientNormals(array, matrix) {
    applyFuncToV3Array(array, m4.inverse(matrix), transformNormal);
    return array;
  }

  /**
   * Reorients positions by the given matrix. In other words, it
   * multiplies each vertex by the given matrix.
   * @param {number[]|TypedArray} array The array. Assumes value floats per element.
   * @param {Matrix} matrix A matrix to multiply by.
   * @return {number[]|TypedArray} the same array that was passed in
   * @memberOf module:twgl/primitives
   */
  function reorientPositions(array, matrix) {
    applyFuncToV3Array(array, matrix, m4.transformPoint);
    return array;
  }

  /**
   * Reorients arrays by the given matrix. Assumes arrays have
   * names that contains 'pos' could be reoriented as positions,
   * 'binorm' or 'tan' as directions, and 'norm' as normals.
   *
   * @param {Object.<string, (number[]|TypedArray)>} arrays The vertices to reorient
   * @param {Matrix} matrix matrix to reorient by.
   * @return {Object.<string, (number[]|TypedArray)>} same arrays that were passed in.
   * @memberOf module:twgl/primitives
   */
  function reorientVertices(arrays, matrix) {
    Object.keys(arrays).forEach(function(name) {
      var array = arrays[name];
      if (name.indexOf("pos") >= 0) {
        reorientPositions(array, matrix);
      } else if (name.indexOf("tan") >= 0 || name.indexOf("binorm") >= 0) {
        reorientDirections(array, matrix);
      } else if (name.indexOf("norm") >= 0) {
        reorientNormals(array, matrix);
      }
    });
    return arrays;
  }

  /**
   * Creates XY quad BufferInfo
   *
   * The default with no parameters will return a 2x2 quad with values from -1 to +1.
   * If you want a unit quad with that goes from 0 to 1 you'd call it with
   *
   *     twgl.primitives.createXYQuadBufferInfo(gl, 1, 0.5, 0.5);
   *
   * If you want a unit quad centered above 0,0 you'd call it with
   *
   *     twgl.primitives.createXYQuadBufferInfo(gl, 1, 0, 0.5);
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} [size] the size across the quad. Defaults to 2 which means vertices will go from -1 to +1
   * @param {number} [xOffset] the amount to offset the quad in X
   * @param {number} [yOffset] the amount to offset the quad in Y
   * @return {Object.<string, WebGLBuffer>} the created XY Quad BufferInfo
   * @memberOf module:twgl/primitives
   * @function createXYQuadBufferInfo
   */

  /**
   * Creates XY quad Buffers
   *
   * The default with no parameters will return a 2x2 quad with values from -1 to +1.
   * If you want a unit quad with that goes from 0 to 1 you'd call it with
   *
   *     twgl.primitives.createXYQuadBufferInfo(gl, 1, 0.5, 0.5);
   *
   * If you want a unit quad centered above 0,0 you'd call it with
   *
   *     twgl.primitives.createXYQuadBufferInfo(gl, 1, 0, 0.5);
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} [size] the size across the quad. Defaults to 2 which means vertices will go from -1 to +1
   * @param {number} [xOffset] the amount to offset the quad in X
   * @param {number} [yOffset] the amount to offset the quad in Y
   * @return {module:twgl.BufferInfo} the created XY Quad buffers
   * @memberOf module:twgl/primitives
   * @function createXYQuadBuffers
   */

  /**
   * Creates XY quad vertices
   *
   * The default with no parameters will return a 2x2 quad with values from -1 to +1.
   * If you want a unit quad with that goes from 0 to 1 you'd call it with
   *
   *     twgl.primitives.createXYQuadVertices(1, 0.5, 0.5);
   *
   * If you want a unit quad centered above 0,0 you'd call it with
   *
   *     twgl.primitives.createXYQuadVertices(1, 0, 0.5);
   *
   * @param {number} [size] the size across the quad. Defaults to 2 which means vertices will go from -1 to +1
   * @param {number} [xOffset] the amount to offset the quad in X
   * @param {number} [yOffset] the amount to offset the quad in Y
   * @return {Object.<string, TypedArray> the created XY Quad vertices
   * @memberOf module:twgl/primitives
   */
  function createXYQuadVertices(size, xOffset, yOffset) {
    size = size || 2;
    xOffset = xOffset || 0;
    yOffset = yOffset || 0;
    size *= 0.5;
    return {
      position: {
        numComponents: 2,
        data: [
          xOffset + -1 * size, yOffset + -1 * size,
          xOffset +  1 * size, yOffset + -1 * size,
          xOffset + -1 * size, yOffset +  1 * size,
          xOffset +  1 * size, yOffset +  1 * size,
        ],
      },
      normal: [
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
      ],
      texcoord: [
        0, 0,
        1, 0,
        0, 1,
        1, 1,
      ],
      indices: [ 0, 1, 2, 2, 1, 3 ],
    };
  }

  /**
   * Creates XZ plane BufferInfo.
   *
   * The created plane has position, normal, and texcoord data
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} [width] Width of the plane. Default = 1
   * @param {number} [depth] Depth of the plane. Default = 1
   * @param {number} [subdivisionsWidth] Number of steps across the plane. Default = 1
   * @param {number} [subdivisionsDepth] Number of steps down the plane. Default = 1
   * @param {Matrix4} [matrix] A matrix by which to multiply all the vertices.
   * @return {@module:twgl.BufferInfo} The created plane BufferInfo.
   * @memberOf module:twgl/primitives
   * @function createPlaneBufferInfo
   */

  /**
   * Creates XZ plane buffers.
   *
   * The created plane has position, normal, and texcoord data
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} [width] Width of the plane. Default = 1
   * @param {number} [depth] Depth of the plane. Default = 1
   * @param {number} [subdivisionsWidth] Number of steps across the plane. Default = 1
   * @param {number} [subdivisionsDepth] Number of steps down the plane. Default = 1
   * @param {Matrix4} [matrix] A matrix by which to multiply all the vertices.
   * @return {Object.<string, WebGLBuffer>} The created plane buffers.
   * @memberOf module:twgl/primitives
   * @function createPlaneBuffers
   */

  /**
   * Creates XZ plane vertices.
   *
   * The created plane has position, normal, and texcoord data
   *
   * @param {number} [width] Width of the plane. Default = 1
   * @param {number} [depth] Depth of the plane. Default = 1
   * @param {number} [subdivisionsWidth] Number of steps across the plane. Default = 1
   * @param {number} [subdivisionsDepth] Number of steps down the plane. Default = 1
   * @param {Matrix4} [matrix] A matrix by which to multiply all the vertices.
   * @return {Object.<string, TypedArray>} The created plane vertices.
   * @memberOf module:twgl/primitives
   */
  function createPlaneVertices(
      width,
      depth,
      subdivisionsWidth,
      subdivisionsDepth,
      matrix) {
    width = width || 1;
    depth = depth || 1;
    subdivisionsWidth = subdivisionsWidth || 1;
    subdivisionsDepth = subdivisionsDepth || 1;
    matrix = matrix || m4.identity();

    var numVertices = (subdivisionsWidth + 1) * (subdivisionsDepth + 1);
    var positions = createAugmentedTypedArray(3, numVertices);
    var normals = createAugmentedTypedArray(3, numVertices);
    var texcoords = createAugmentedTypedArray(2, numVertices);

    for (var z = 0; z <= subdivisionsDepth; z++) {
      for (var x = 0; x <= subdivisionsWidth; x++) {
        var u = x / subdivisionsWidth;
        var v = z / subdivisionsDepth;
        positions.push(
            width * u - width * 0.5,
            0,
            depth * v - depth * 0.5);
        normals.push(0, 1, 0);
        texcoords.push(u, v);
      }
    }

    var numVertsAcross = subdivisionsWidth + 1;
    var indices = createAugmentedTypedArray(
        3, subdivisionsWidth * subdivisionsDepth * 2, Uint16Array);

    for (var z = 0; z < subdivisionsDepth; z++) {  // eslint-disable-line
      for (var x = 0; x < subdivisionsWidth; x++) {  // eslint-disable-line
        // Make triangle 1 of quad.
        indices.push(
            (z + 0) * numVertsAcross + x,
            (z + 1) * numVertsAcross + x,
            (z + 0) * numVertsAcross + x + 1);

        // Make triangle 2 of quad.
        indices.push(
            (z + 1) * numVertsAcross + x,
            (z + 1) * numVertsAcross + x + 1,
            (z + 0) * numVertsAcross + x + 1);
      }
    }

    var arrays = reorientVertices({
      position: positions,
      normal: normals,
      texcoord: texcoords,
      indices: indices,
    }, matrix);
    return arrays;
  }

  /**
   * Creates sphere BufferInfo.
   *
   * The created sphere has position, normal, and texcoord data
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} radius radius of the sphere.
   * @param {number} subdivisionsAxis number of steps around the sphere.
   * @param {number} subdivisionsHeight number of vertically on the sphere.
   * @param {number} [opt_startLatitudeInRadians] where to start the
   *     top of the sphere. Default = 0.
   * @param {number} [opt_endLatitudeInRadians] Where to end the
   *     bottom of the sphere. Default = Math.PI.
   * @param {number} [opt_startLongitudeInRadians] where to start
   *     wrapping the sphere. Default = 0.
   * @param {number} [opt_endLongitudeInRadians] where to end
   *     wrapping the sphere. Default = 2 * Math.PI.
   * @return {module:twgl.BufferInfo} The created sphere BufferInfo.
   * @memberOf module:twgl/primitives
   * @function createSphereBufferInfo
   */

  /**
   * Creates sphere buffers.
   *
   * The created sphere has position, normal, and texcoord data
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} radius radius of the sphere.
   * @param {number} subdivisionsAxis number of steps around the sphere.
   * @param {number} subdivisionsHeight number of vertically on the sphere.
   * @param {number} [opt_startLatitudeInRadians] where to start the
   *     top of the sphere. Default = 0.
   * @param {number} [opt_endLatitudeInRadians] Where to end the
   *     bottom of the sphere. Default = Math.PI.
   * @param {number} [opt_startLongitudeInRadians] where to start
   *     wrapping the sphere. Default = 0.
   * @param {number} [opt_endLongitudeInRadians] where to end
   *     wrapping the sphere. Default = 2 * Math.PI.
   * @return {Object.<string, WebGLBuffer>} The created sphere buffers.
   * @memberOf module:twgl/primitives
   * @function createSphereBuffers
   */

  /**
   * Creates sphere vertices.
   *
   * The created sphere has position, normal, and texcoord data
   *
   * @param {number} radius radius of the sphere.
   * @param {number} subdivisionsAxis number of steps around the sphere.
   * @param {number} subdivisionsHeight number of vertically on the sphere.
   * @param {number} [opt_startLatitudeInRadians] where to start the
   *     top of the sphere. Default = 0.
   * @param {number} [opt_endLatitudeInRadians] Where to end the
   *     bottom of the sphere. Default = Math.PI.
   * @param {number} [opt_startLongitudeInRadians] where to start
   *     wrapping the sphere. Default = 0.
   * @param {number} [opt_endLongitudeInRadians] where to end
   *     wrapping the sphere. Default = 2 * Math.PI.
   * @return {Object.<string, TypedArray>} The created sphere vertices.
   * @memberOf module:twgl/primitives
   */
  function createSphereVertices(
      radius,
      subdivisionsAxis,
      subdivisionsHeight,
      opt_startLatitudeInRadians,
      opt_endLatitudeInRadians,
      opt_startLongitudeInRadians,
      opt_endLongitudeInRadians) {
    if (subdivisionsAxis <= 0 || subdivisionsHeight <= 0) {
      throw Error('subdivisionAxis and subdivisionHeight must be > 0');
    }

    opt_startLatitudeInRadians = opt_startLatitudeInRadians || 0;
    opt_endLatitudeInRadians = opt_endLatitudeInRadians || Math.PI;
    opt_startLongitudeInRadians = opt_startLongitudeInRadians || 0;
    opt_endLongitudeInRadians = opt_endLongitudeInRadians || (Math.PI * 2);

    var latRange = opt_endLatitudeInRadians - opt_startLatitudeInRadians;
    var longRange = opt_endLongitudeInRadians - opt_startLongitudeInRadians;

    // We are going to generate our sphere by iterating through its
    // spherical coordinates and generating 2 triangles for each quad on a
    // ring of the sphere.
    var numVertices = (subdivisionsAxis + 1) * (subdivisionsHeight + 1);
    var positions = createAugmentedTypedArray(3, numVertices);
    var normals   = createAugmentedTypedArray(3, numVertices);
    var texcoords = createAugmentedTypedArray(2 , numVertices);

    // Generate the individual vertices in our vertex buffer.
    for (var y = 0; y <= subdivisionsHeight; y++) {
      for (var x = 0; x <= subdivisionsAxis; x++) {
        // Generate a vertex based on its spherical coordinates
        var u = x / subdivisionsAxis;
        var v = y / subdivisionsHeight;
        var theta = longRange * u;
        var phi = latRange * v;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);
        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);
        var ux = cosTheta * sinPhi;
        var uy = cosPhi;
        var uz = sinTheta * sinPhi;
        positions.push(radius * ux, radius * uy, radius * uz);
        normals.push(ux, uy, uz);
        texcoords.push(1 - u, v);
      }
    }

    var numVertsAround = subdivisionsAxis + 1;
    var indices = createAugmentedTypedArray(3, subdivisionsAxis * subdivisionsHeight * 2, Uint16Array);
    for (var x = 0; x < subdivisionsAxis; x++) {  // eslint-disable-line
      for (var y = 0; y < subdivisionsHeight; y++) {  // eslint-disable-line
        // Make triangle 1 of quad.
        indices.push(
            (y + 0) * numVertsAround + x,
            (y + 0) * numVertsAround + x + 1,
            (y + 1) * numVertsAround + x);

        // Make triangle 2 of quad.
        indices.push(
            (y + 1) * numVertsAround + x,
            (y + 0) * numVertsAround + x + 1,
            (y + 1) * numVertsAround + x + 1);
      }
    }

    return {
      position: positions,
      normal: normals,
      texcoord: texcoords,
      indices: indices,
    };
  }

  /**
   * Array of the indices of corners of each face of a cube.
   * @type {Array.<number[]>}
   */
  var CUBE_FACE_INDICES = [
    [3, 7, 5, 1],  // right
    [6, 2, 0, 4],  // left
    [6, 7, 3, 2],  // ??
    [0, 1, 5, 4],  // ??
    [7, 6, 4, 5],  // front
    [2, 3, 1, 0],  // back
  ];

  /**
   * Creates a BufferInfo for a cube.
   *
   * The cube is created around the origin. (-size / 2, size / 2).
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} [size] width, height and depth of the cube.
   * @return {module:twgl.BufferInfo} The created BufferInfo.
   * @memberOf module:twgl/primitives
   * @function createCubeBufferInfo
   */

  /**
   * Creates the buffers and indices for a cube.
   *
   * The cube is created around the origin. (-size / 2, size / 2).
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} [size] width, height and depth of the cube.
   * @return {Object.<string, WebGLBuffer>} The created buffers.
   * @memberOf module:twgl/primitives
   * @function createCubeBuffers
   */

  /**
   * Creates the vertices and indices for a cube.
   *
   * The cube is created around the origin. (-size / 2, size / 2).
   *
   * @param {number} [size] width, height and depth of the cube.
   * @return {Object.<string, TypedArray>} The created vertices.
   * @memberOf module:twgl/primitives
   */
  function createCubeVertices(size) {
    size = size || 1;
    var k = size / 2;

    var cornerVertices = [
      [-k, -k, -k],
      [+k, -k, -k],
      [-k, +k, -k],
      [+k, +k, -k],
      [-k, -k, +k],
      [+k, -k, +k],
      [-k, +k, +k],
      [+k, +k, +k],
    ];

    var faceNormals = [
      [+1, +0, +0],
      [-1, +0, +0],
      [+0, +1, +0],
      [+0, -1, +0],
      [+0, +0, +1],
      [+0, +0, -1],
    ];

    var uvCoords = [
      [1, 0],
      [0, 0],
      [0, 1],
      [1, 1],
    ];

    var numVertices = 6 * 4;
    var positions = createAugmentedTypedArray(3, numVertices);
    var normals   = createAugmentedTypedArray(3, numVertices);
    var texcoords = createAugmentedTypedArray(2 , numVertices);
    var indices   = createAugmentedTypedArray(3, 6 * 2, Uint16Array);

    for (var f = 0; f < 6; ++f) {
      var faceIndices = CUBE_FACE_INDICES[f];
      for (var v = 0; v < 4; ++v) {
        var position = cornerVertices[faceIndices[v]];
        var normal = faceNormals[f];
        var uv = uvCoords[v];

        // Each face needs all four vertices because the normals and texture
        // coordinates are not all the same.
        positions.push(position);
        normals.push(normal);
        texcoords.push(uv);

      }
      // Two triangles make a square face.
      var offset = 4 * f;
      indices.push(offset + 0, offset + 1, offset + 2);
      indices.push(offset + 0, offset + 2, offset + 3);
    }

    return {
      position: positions,
      normal: normals,
      texcoord: texcoords,
      indices: indices,
    };
  }

  /**
   * Creates a BufferInfo for a truncated cone, which is like a cylinder
   * except that it has different top and bottom radii. A truncated cone
   * can also be used to create cylinders and regular cones. The
   * truncated cone will be created centered about the origin, with the
   * y axis as its vertical axis.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} bottomRadius Bottom radius of truncated cone.
   * @param {number} topRadius Top radius of truncated cone.
   * @param {number} height Height of truncated cone.
   * @param {number} radialSubdivisions The number of subdivisions around the
   *     truncated cone.
   * @param {number} verticalSubdivisions The number of subdivisions down the
   *     truncated cone.
   * @param {boolean} [opt_topCap] Create top cap. Default = true.
   * @param {boolean} [opt_bottomCap] Create bottom cap. Default = true.
   * @return {module:twgl.BufferInfo} The created cone BufferInfo.
   * @memberOf module:twgl/primitives
   * @function createTruncatedConeBufferInfo
   */

  /**
   * Creates buffers for a truncated cone, which is like a cylinder
   * except that it has different top and bottom radii. A truncated cone
   * can also be used to create cylinders and regular cones. The
   * truncated cone will be created centered about the origin, with the
   * y axis as its vertical axis.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} bottomRadius Bottom radius of truncated cone.
   * @param {number} topRadius Top radius of truncated cone.
   * @param {number} height Height of truncated cone.
   * @param {number} radialSubdivisions The number of subdivisions around the
   *     truncated cone.
   * @param {number} verticalSubdivisions The number of subdivisions down the
   *     truncated cone.
   * @param {boolean} [opt_topCap] Create top cap. Default = true.
   * @param {boolean} [opt_bottomCap] Create bottom cap. Default = true.
   * @return {Object.<string, WebGLBuffer>} The created cone buffers.
   * @memberOf module:twgl/primitives
   * @function createTruncatedConeBuffers
   */

  /**
   * Creates vertices for a truncated cone, which is like a cylinder
   * except that it has different top and bottom radii. A truncated cone
   * can also be used to create cylinders and regular cones. The
   * truncated cone will be created centered about the origin, with the
   * y axis as its vertical axis. .
   *
   * @param {number} bottomRadius Bottom radius of truncated cone.
   * @param {number} topRadius Top radius of truncated cone.
   * @param {number} height Height of truncated cone.
   * @param {number} radialSubdivisions The number of subdivisions around the
   *     truncated cone.
   * @param {number} verticalSubdivisions The number of subdivisions down the
   *     truncated cone.
   * @param {boolean} [opt_topCap] Create top cap. Default = true.
   * @param {boolean} [opt_bottomCap] Create bottom cap. Default = true.
   * @return {Object.<string, TypedArray>} The created cone vertices.
   * @memberOf module:twgl/primitives
   */
  function createTruncatedConeVertices(
      bottomRadius,
      topRadius,
      height,
      radialSubdivisions,
      verticalSubdivisions,
      opt_topCap,
      opt_bottomCap) {
    if (radialSubdivisions < 3) {
      throw Error('radialSubdivisions must be 3 or greater');
    }

    if (verticalSubdivisions < 1) {
      throw Error('verticalSubdivisions must be 1 or greater');
    }

    var topCap = (opt_topCap === undefined) ? true : opt_topCap;
    var bottomCap = (opt_bottomCap === undefined) ? true : opt_bottomCap;

    var extra = (topCap ? 2 : 0) + (bottomCap ? 2 : 0);

    var numVertices = (radialSubdivisions + 1) * (verticalSubdivisions + 1 + extra);
    var positions = createAugmentedTypedArray(3, numVertices);
    var normals   = createAugmentedTypedArray(3, numVertices);
    var texcoords = createAugmentedTypedArray(2, numVertices);
    var indices   = createAugmentedTypedArray(3, radialSubdivisions * (verticalSubdivisions + extra) * 2, Uint16Array);

    var vertsAroundEdge = radialSubdivisions + 1;

    // The slant of the cone is constant across its surface
    var slant = Math.atan2(bottomRadius - topRadius, height);
    var cosSlant = Math.cos(slant);
    var sinSlant = Math.sin(slant);

    var start = topCap ? -2 : 0;
    var end = verticalSubdivisions + (bottomCap ? 2 : 0);

    for (var yy = start; yy <= end; ++yy) {
      var v = yy / verticalSubdivisions;
      var y = height * v;
      var ringRadius;
      if (yy < 0) {
        y = 0;
        v = 1;
        ringRadius = bottomRadius;
      } else if (yy > verticalSubdivisions) {
        y = height;
        v = 1;
        ringRadius = topRadius;
      } else {
        ringRadius = bottomRadius +
          (topRadius - bottomRadius) * (yy / verticalSubdivisions);
      }
      if (yy === -2 || yy === verticalSubdivisions + 2) {
        ringRadius = 0;
        v = 0;
      }
      y -= height / 2;
      for (var ii = 0; ii < vertsAroundEdge; ++ii) {
        var sin = Math.sin(ii * Math.PI * 2 / radialSubdivisions);
        var cos = Math.cos(ii * Math.PI * 2 / radialSubdivisions);
        positions.push(sin * ringRadius, y, cos * ringRadius);
        normals.push(
            (yy < 0 || yy > verticalSubdivisions) ? 0 : (sin * cosSlant),
            (yy < 0) ? -1 : (yy > verticalSubdivisions ? 1 : sinSlant),
            (yy < 0 || yy > verticalSubdivisions) ? 0 : (cos * cosSlant));
        texcoords.push((ii / radialSubdivisions), 1 - v);
      }
    }

    for (var yy = 0; yy < verticalSubdivisions + extra; ++yy) {  // eslint-disable-line
      for (var ii = 0; ii < radialSubdivisions; ++ii) {  // eslint-disable-line
        indices.push(vertsAroundEdge * (yy + 0) + 0 + ii,
                     vertsAroundEdge * (yy + 0) + 1 + ii,
                     vertsAroundEdge * (yy + 1) + 1 + ii);
        indices.push(vertsAroundEdge * (yy + 0) + 0 + ii,
                     vertsAroundEdge * (yy + 1) + 1 + ii,
                     vertsAroundEdge * (yy + 1) + 0 + ii);
      }
    }

    return {
      position: positions,
      normal: normals,
      texcoord: texcoords,
      indices: indices,
    };
  }

  /**
   * Expands RLE data
   * @param {number[]} rleData data in format of run-length, x, y, z, run-length, x, y, z
   * @param {number[]} [padding] value to add each entry with.
   * @return {number[]} the expanded rleData
   */
  function expandRLEData(rleData, padding) {
    padding = padding || [];
    var data = [];
    for (var ii = 0; ii < rleData.length; ii += 4) {
      var runLength = rleData[ii];
      var element = rleData.slice(ii + 1, ii + 4);
      element.push.apply(element, padding);
      for (var jj = 0; jj < runLength; ++jj) {
        data.push.apply(data, element);
      }
    }
    return data;
  }

  /**
   * Creates 3D 'F' BufferInfo.
   * An 'F' is useful because you can easily tell which way it is oriented.
   * The created 'F' has position, normal, texcoord, and color buffers.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @return {module:twgl.BufferInfo} The created BufferInfo.
   * @memberOf module:twgl/primitives
   * @function create3DFBufferInfo
   */

  /**
   * Creates 3D 'F' buffers.
   * An 'F' is useful because you can easily tell which way it is oriented.
   * The created 'F' has position, normal, texcoord, and color buffers.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @return {Object.<string, WebGLBuffer>} The created buffers.
   * @memberOf module:twgl/primitives
   * @function create3DFBuffers
   */

  /**
   * Creates 3D 'F' vertices.
   * An 'F' is useful because you can easily tell which way it is oriented.
   * The created 'F' has position, normal, texcoord, and color arrays.
   *
   * @return {Object.<string, TypedArray>} The created vertices.
   * @memberOf module:twgl/primitives
   */
  function create3DFVertices() {

    var positions = [
      // left column front
      0,   0,  0,
      0, 150,  0,
      30,   0,  0,
      0, 150,  0,
      30, 150,  0,
      30,   0,  0,

      // top rung front
      30,   0,  0,
      30,  30,  0,
      100,   0,  0,
      30,  30,  0,
      100,  30,  0,
      100,   0,  0,

      // middle rung front
      30,  60,  0,
      30,  90,  0,
      67,  60,  0,
      30,  90,  0,
      67,  90,  0,
      67,  60,  0,

      // left column back
        0,   0,  30,
       30,   0,  30,
        0, 150,  30,
        0, 150,  30,
       30,   0,  30,
       30, 150,  30,

      // top rung back
       30,   0,  30,
      100,   0,  30,
       30,  30,  30,
       30,  30,  30,
      100,   0,  30,
      100,  30,  30,

      // middle rung back
       30,  60,  30,
       67,  60,  30,
       30,  90,  30,
       30,  90,  30,
       67,  60,  30,
       67,  90,  30,

      // top
        0,   0,   0,
      100,   0,   0,
      100,   0,  30,
        0,   0,   0,
      100,   0,  30,
        0,   0,  30,

      // top rung front
      100,   0,   0,
      100,  30,   0,
      100,  30,  30,
      100,   0,   0,
      100,  30,  30,
      100,   0,  30,

      // under top rung
      30,   30,   0,
      30,   30,  30,
      100,  30,  30,
      30,   30,   0,
      100,  30,  30,
      100,  30,   0,

      // between top rung and middle
      30,   30,   0,
      30,   60,  30,
      30,   30,  30,
      30,   30,   0,
      30,   60,   0,
      30,   60,  30,

      // top of middle rung
      30,   60,   0,
      67,   60,  30,
      30,   60,  30,
      30,   60,   0,
      67,   60,   0,
      67,   60,  30,

      // front of middle rung
      67,   60,   0,
      67,   90,  30,
      67,   60,  30,
      67,   60,   0,
      67,   90,   0,
      67,   90,  30,

      // bottom of middle rung.
      30,   90,   0,
      30,   90,  30,
      67,   90,  30,
      30,   90,   0,
      67,   90,  30,
      67,   90,   0,

      // front of bottom
      30,   90,   0,
      30,  150,  30,
      30,   90,  30,
      30,   90,   0,
      30,  150,   0,
      30,  150,  30,

      // bottom
      0,   150,   0,
      0,   150,  30,
      30,  150,  30,
      0,   150,   0,
      30,  150,  30,
      30,  150,   0,

      // left side
      0,   0,   0,
      0,   0,  30,
      0, 150,  30,
      0,   0,   0,
      0, 150,  30,
      0, 150,   0,
    ];

    var texcoords = [
      // left column front
      0.22, 0.19,
      0.22, 0.79,
      0.34, 0.19,
      0.22, 0.79,
      0.34, 0.79,
      0.34, 0.19,

      // top rung front
      0.34, 0.19,
      0.34, 0.31,
      0.62, 0.19,
      0.34, 0.31,
      0.62, 0.31,
      0.62, 0.19,

      // middle rung front
      0.34, 0.43,
      0.34, 0.55,
      0.49, 0.43,
      0.34, 0.55,
      0.49, 0.55,
      0.49, 0.43,

      // left column back
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1,

      // top rung back
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1,

      // middle rung back
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1,

      // top
      0, 0,
      1, 0,
      1, 1,
      0, 0,
      1, 1,
      0, 1,

      // top rung front
      0, 0,
      1, 0,
      1, 1,
      0, 0,
      1, 1,
      0, 1,

      // under top rung
      0, 0,
      0, 1,
      1, 1,
      0, 0,
      1, 1,
      1, 0,

      // between top rung and middle
      0, 0,
      1, 1,
      0, 1,
      0, 0,
      1, 0,
      1, 1,

      // top of middle rung
      0, 0,
      1, 1,
      0, 1,
      0, 0,
      1, 0,
      1, 1,

      // front of middle rung
      0, 0,
      1, 1,
      0, 1,
      0, 0,
      1, 0,
      1, 1,

      // bottom of middle rung.
      0, 0,
      0, 1,
      1, 1,
      0, 0,
      1, 1,
      1, 0,

      // front of bottom
      0, 0,
      1, 1,
      0, 1,
      0, 0,
      1, 0,
      1, 1,

      // bottom
      0, 0,
      0, 1,
      1, 1,
      0, 0,
      1, 1,
      1, 0,

      // left side
      0, 0,
      0, 1,
      1, 1,
      0, 0,
      1, 1,
      1, 0,
    ];

    var normals = expandRLEData([
      // left column front
      // top rung front
      // middle rung front
      18, 0, 0, 1,

      // left column back
      // top rung back
      // middle rung back
      18, 0, 0, -1,

      // top
      6, 0, 1, 0,

      // top rung front
      6, 1, 0, 0,

      // under top rung
      6, 0, -1, 0,

      // between top rung and middle
      6, 1, 0, 0,

      // top of middle rung
      6, 0, 1, 0,

      // front of middle rung
      6, 1, 0, 0,

      // bottom of middle rung.
      6, 0, -1, 0,

      // front of bottom
      6, 1, 0, 0,

      // bottom
      6, 0, -1, 0,

      // left side
      6, -1, 0, 0,
    ]);

    var colors = expandRLEData([
          // left column front
          // top rung front
          // middle rung front
        18, 200,  70, 120,

          // left column back
          // top rung back
          // middle rung back
        18, 80, 70, 200,

          // top
        6, 70, 200, 210,

          // top rung front
        6, 200, 200, 70,

          // under top rung
        6, 210, 100, 70,

          // between top rung and middle
        6, 210, 160, 70,

          // top of middle rung
        6, 70, 180, 210,

          // front of middle rung
        6, 100, 70, 210,

          // bottom of middle rung.
        6, 76, 210, 100,

          // front of bottom
        6, 140, 210, 80,

          // bottom
        6, 90, 130, 110,

          // left side
        6, 160, 160, 220,
    ], [255]);

    var numVerts = positions.length / 3;

    var arrays = {
      position: createAugmentedTypedArray(3, numVerts),
      texcoord: createAugmentedTypedArray(2,  numVerts),
      normal: createAugmentedTypedArray(3, numVerts),
      color: createAugmentedTypedArray(4, numVerts, Uint8Array),
      indices: createAugmentedTypedArray(3, numVerts / 3, Uint16Array),
    };

    arrays.position.push(positions);
    arrays.texcoord.push(texcoords);
    arrays.normal.push(normals);
    arrays.color.push(colors);

    for (var ii = 0; ii < numVerts; ++ii) {
      arrays.indices.push(ii);
    }

    return arrays;
  }

  /**
   * Creates cresent BufferInfo.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} verticalRadius The vertical radius of the cresent.
   * @param {number} outerRadius The outer radius of the cresent.
   * @param {number} innerRadius The inner radius of the cresent.
   * @param {number} thickness The thickness of the cresent.
   * @param {number} subdivisionsDown number of steps around the cresent.
   * @param {number} subdivisionsThick number of vertically on the cresent.
   * @param {number} [startOffset] Where to start arc. Default 0.
   * @param {number} [endOffset] Where to end arg. Default 1.
   * @return {module:twgl.BufferInfo} The created BufferInfo.
   * @memberOf module:twgl/primitives
   * @function createCresentBufferInfo
   */

  /**
   * Creates cresent buffers.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} verticalRadius The vertical radius of the cresent.
   * @param {number} outerRadius The outer radius of the cresent.
   * @param {number} innerRadius The inner radius of the cresent.
   * @param {number} thickness The thickness of the cresent.
   * @param {number} subdivisionsDown number of steps around the cresent.
   * @param {number} subdivisionsThick number of vertically on the cresent.
   * @param {number} [startOffset] Where to start arc. Default 0.
   * @param {number} [endOffset] Where to end arg. Default 1.
   * @return {Object.<string, WebGLBuffer>} The created buffers.
   * @memberOf module:twgl/primitives
   * @function createCresentBuffers
   */

  /**
   * Creates cresent vertices.
   *
   * @param {number} verticalRadius The vertical radius of the cresent.
   * @param {number} outerRadius The outer radius of the cresent.
   * @param {number} innerRadius The inner radius of the cresent.
   * @param {number} thickness The thickness of the cresent.
   * @param {number} subdivisionsDown number of steps around the cresent.
   * @param {number} subdivisionsThick number of vertically on the cresent.
   * @param {number} [startOffset] Where to start arc. Default 0.
   * @param {number} [endOffset] Where to end arg. Default 1.
   * @return {Object.<string, TypedArray>} The created vertices.
   * @memberOf module:twgl/primitives
   */
   function createCresentVertices(
      verticalRadius,
      outerRadius,
      innerRadius,
      thickness,
      subdivisionsDown,
      startOffset,
      endOffset) {
    if (subdivisionsDown <= 0) {
      throw Error('subdivisionDown must be > 0');
    }

    startOffset = startOffset || 0;
    endOffset   = endOffset || 1;

    var subdivisionsThick = 2;

    var offsetRange = endOffset - startOffset;
    var numVertices = (subdivisionsDown + 1) * 2 * (2 + subdivisionsThick);
    var positions   = createAugmentedTypedArray(3, numVertices);
    var normals     = createAugmentedTypedArray(3, numVertices);
    var texcoords   = createAugmentedTypedArray(2, numVertices);

    function lerp(a, b, s) {
      return a + (b - a) * s;
    }

    function createArc(arcRadius, x, normalMult, normalAdd, uMult, uAdd) {
      for (var z = 0; z <= subdivisionsDown; z++) {
        var uBack = x / (subdivisionsThick - 1);
        var v = z / subdivisionsDown;
        var xBack = (uBack - 0.5) * 2;
        var angle = (startOffset + (v * offsetRange)) * Math.PI;
        var s = Math.sin(angle);
        var c = Math.cos(angle);
        var radius = lerp(verticalRadius, arcRadius, s);
        var px = xBack * thickness;
        var py = c * verticalRadius;
        var pz = s * radius;
        positions.push(px, py, pz);
        var n = v3.add(v3.multiply([0, s, c], normalMult), normalAdd);
        normals.push(n);
        texcoords.push(uBack * uMult + uAdd, v);
      }
    }

    // Generate the individual vertices in our vertex buffer.
    for (var x = 0; x < subdivisionsThick; x++) {
      var uBack = (x / (subdivisionsThick - 1) - 0.5) * 2;
      createArc(outerRadius, x, [1, 1, 1], [0,     0, 0], 1, 0);
      createArc(outerRadius, x, [0, 0, 0], [uBack, 0, 0], 0, 0);
      createArc(innerRadius, x, [1, 1, 1], [0,     0, 0], 1, 0);
      createArc(innerRadius, x, [0, 0, 0], [uBack, 0, 0], 0, 1);
    }

    // Do outer surface.
    var indices = createAugmentedTypedArray(3, (subdivisionsDown * 2) * (2 + subdivisionsThick), Uint16Array);

    function createSurface(leftArcOffset, rightArcOffset) {
      for (var z = 0; z < subdivisionsDown; ++z) {
        // Make triangle 1 of quad.
        indices.push(
            leftArcOffset + z + 0,
            leftArcOffset + z + 1,
            rightArcOffset + z + 0);

        // Make triangle 2 of quad.
        indices.push(
            leftArcOffset + z + 1,
            rightArcOffset + z + 1,
            rightArcOffset + z + 0);
      }
    }

    var numVerticesDown = subdivisionsDown + 1;
    // front
    createSurface(numVerticesDown * 0, numVerticesDown * 4);
    // right
    createSurface(numVerticesDown * 5, numVerticesDown * 7);
    // back
    createSurface(numVerticesDown * 6, numVerticesDown * 2);
    // left
    createSurface(numVerticesDown * 3, numVerticesDown * 1);

    return {
      position: positions,
      normal:   normals,
      texcoord: texcoords,
      indices:  indices,
    };
  }

  /**
   * Creates cylinder BufferInfo. The cylinder will be created around the origin
   * along the y-axis.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} radius Radius of cylinder.
   * @param {number} height Height of cylinder.
   * @param {number} radialSubdivisions The number of subdivisions around the cylinder.
   * @param {number} verticalSubdivisions The number of subdivisions down the cylinder.
   * @param {boolean} [topCap] Create top cap. Default = true.
   * @param {boolean} [bottomCap] Create bottom cap. Default = true.
   * @return {module:twgl.BufferInfo} The created BufferInfo.
   * @memberOf module:twgl/primitives
   * @function createCylinderBufferInfo
   */

   /**
    * Creates cylinder buffers. The cylinder will be created around the origin
    * along the y-axis.
    *
    * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
    * @param {number} radius Radius of cylinder.
    * @param {number} height Height of cylinder.
    * @param {number} radialSubdivisions The number of subdivisions around the cylinder.
    * @param {number} verticalSubdivisions The number of subdivisions down the cylinder.
    * @param {boolean} [topCap] Create top cap. Default = true.
    * @param {boolean} [bottomCap] Create bottom cap. Default = true.
    * @return {Object.<string, WebGLBuffer>} The created buffers.
    * @memberOf module:twgl/primitives
    * @function createCylinderBuffers
    */

   /**
    * Creates cylinder vertices. The cylinder will be created around the origin
    * along the y-axis.
    *
    * @param {number} radius Radius of cylinder.
    * @param {number} height Height of cylinder.
    * @param {number} radialSubdivisions The number of subdivisions around the cylinder.
    * @param {number} verticalSubdivisions The number of subdivisions down the cylinder.
    * @param {boolean} [topCap] Create top cap. Default = true.
    * @param {boolean} [bottomCap] Create bottom cap. Default = true.
    * @return {Object.<string, TypedArray>} The created vertices.
    * @memberOf module:twgl/primitives
    */
  function createCylinderVertices(
      radius,
      height,
      radialSubdivisions,
      verticalSubdivisions,
      topCap,
      bottomCap) {
    return createTruncatedConeVertices(
        radius,
        radius,
        height,
        radialSubdivisions,
        verticalSubdivisions,
        topCap,
        bottomCap);
  }

  /**
   * Creates BufferInfo for a torus
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} radius radius of center of torus circle.
   * @param {number} thickness radius of torus ring.
   * @param {number} radialSubdivisions The number of subdivisions around the torus.
   * @param {number} bodySubdivisions The number of subdivisions around the body torus.
   * @param {boolean} [startAngle] start angle in radians. Default = 0.
   * @param {boolean} [endAngle] end angle in radians. Default = Math.PI * 2.
   * @return {module:twgl.BufferInfo} The created BufferInfo.
   * @memberOf module:twgl/primitives
   * @function createTorusBufferInfo
   */

  /**
   * Creates buffers for a torus
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} radius radius of center of torus circle.
   * @param {number} thickness radius of torus ring.
   * @param {number} radialSubdivisions The number of subdivisions around the torus.
   * @param {number} bodySubdivisions The number of subdivisions around the body torus.
   * @param {boolean} [startAngle] start angle in radians. Default = 0.
   * @param {boolean} [endAngle] end angle in radians. Default = Math.PI * 2.
   * @return {Object.<string, WebGLBuffer>} The created buffers.
   * @memberOf module:twgl/primitives
   * @function createTorusBuffers
   */

  /**
   * Creates vertices for a torus
   *
   * @param {number} radius radius of center of torus circle.
   * @param {number} thickness radius of torus ring.
   * @param {number} radialSubdivisions The number of subdivisions around the torus.
   * @param {number} bodySubdivisions The number of subdivisions around the body torus.
   * @param {boolean} [startAngle] start angle in radians. Default = 0.
   * @param {boolean} [endAngle] end angle in radians. Default = Math.PI * 2.
   * @return {Object.<string, TypedArray>} The created vertices.
   * @memberOf module:twgl/primitives
   */
  function createTorusVertices(
      radius,
      thickness,
      radialSubdivisions,
      bodySubdivisions,
      startAngle,
      endAngle) {
    if (radialSubdivisions < 3) {
      throw Error('radialSubdivisions must be 3 or greater');
    }

    if (bodySubdivisions < 3) {
      throw Error('verticalSubdivisions must be 3 or greater');
    }

    startAngle = startAngle || 0;
    endAngle = endAngle || Math.PI * 2;
    range = endAngle - startAngle;

    var radialParts = radialSubdivisions + 1;
    var bodyParts   = bodySubdivisions + 1;
    var numVertices = radialParts * bodyParts;
    var positions   = createAugmentedTypedArray(3, numVertices);
    var normals     = createAugmentedTypedArray(3, numVertices);
    var texcoords   = createAugmentedTypedArray(2, numVertices);
    var indices     = createAugmentedTypedArray(3, (radialSubdivisions) * (bodySubdivisions) * 2, Uint16Array);

    for (var slice = 0; slice < bodyParts; ++slice) {
      var v = slice / bodySubdivisions;
      var sliceAngle = v * Math.PI * 2;
      var sliceSin = Math.sin(sliceAngle);
      var ringRadius = radius + sliceSin * thickness;
      var ny = Math.cos(sliceAngle);
      var y = ny * thickness;
      for (var ring = 0; ring < radialParts; ++ring) {
        var u = ring / radialSubdivisions;
        var ringAngle = startAngle + u * range;
        var xSin = Math.sin(ringAngle);
        var zCos = Math.cos(ringAngle);
        var x = xSin * ringRadius;
        var z = zCos * ringRadius;
        var nx = xSin * sliceSin;
        var nz = zCos * sliceSin;
        positions.push(x, y, z);
        normals.push(nx, ny, nz);
        texcoords.push(u, 1 - v);
      }
    }

    for (var slice = 0; slice < bodySubdivisions; ++slice) {  // eslint-disable-line
      for (var ring = 0; ring < radialSubdivisions; ++ring) {  // eslint-disable-line
        var nextRingIndex  = 1 + ring;
        var nextSliceIndex = 1 + slice;
        indices.push(radialParts * slice          + ring,
                     radialParts * nextSliceIndex + ring,
                     radialParts * slice          + nextRingIndex);
        indices.push(radialParts * nextSliceIndex + ring,
                     radialParts * nextSliceIndex + nextRingIndex,
                     radialParts * slice          + nextRingIndex);
      }
    }

    return {
      position: positions,
      normal:   normals,
      texcoord: texcoords,
      indices:  indices,
    };
  }


  /**
   * Creates a disc BufferInfo. The disc will be in the xz plane, centered at
   * the origin. When creating, at least 3 divisions, or pie
   * pieces, need to be specified, otherwise the triangles making
   * up the disc will be degenerate. You can also specify the
   * number of radial pieces `stacks`. A value of 1 for
   * stacks will give you a simple disc of pie pieces.  If you
   * want to create an annulus you can set `innerRadius` to a
   * value > 0. Finally, `stackPower` allows you to have the widths
   * increase or decrease as you move away from the center. This
   * is particularly useful when using the disc as a ground plane
   * with a fixed camera such that you don't need the resolution
   * of small triangles near the perimeter. For example, a value
   * of 2 will produce stacks whose ouside radius increases with
   * the square of the stack index. A value of 1 will give uniform
   * stacks.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} radius Radius of the ground plane.
   * @param {number} divisions Number of triangles in the ground plane (at least 3).
   * @param {number} [stacks] Number of radial divisions (default=1).
   * @param {number} [innerRadius] Default 0.
   * @param {number} [stackPower] Power to raise stack size to for decreasing width.
   * @return {module:twgl.BufferInfo} The created BufferInfo.
   * @memberOf module:twgl/primitives
   * @function createDiscBufferInfo
   */

  /**
   * Creates disc buffers. The disc will be in the xz plane, centered at
   * the origin. When creating, at least 3 divisions, or pie
   * pieces, need to be specified, otherwise the triangles making
   * up the disc will be degenerate. You can also specify the
   * number of radial pieces `stacks`. A value of 1 for
   * stacks will give you a simple disc of pie pieces.  If you
   * want to create an annulus you can set `innerRadius` to a
   * value > 0. Finally, `stackPower` allows you to have the widths
   * increase or decrease as you move away from the center. This
   * is particularly useful when using the disc as a ground plane
   * with a fixed camera such that you don't need the resolution
   * of small triangles near the perimeter. For example, a value
   * of 2 will produce stacks whose ouside radius increases with
   * the square of the stack index. A value of 1 will give uniform
   * stacks.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} radius Radius of the ground plane.
   * @param {number} divisions Number of triangles in the ground plane (at least 3).
   * @param {number} [stacks] Number of radial divisions (default=1).
   * @param {number} [innerRadius] Default 0.
   * @param {number} [stackPower] Power to raise stack size to for decreasing width.
   * @return {Object.<string, WebGLBuffer>} The created buffers.
   * @memberOf module:twgl/primitives
   * @function createDiscBuffers
   */

  /**
   * Creates disc vertices. The disc will be in the xz plane, centered at
   * the origin. When creating, at least 3 divisions, or pie
   * pieces, need to be specified, otherwise the triangles making
   * up the disc will be degenerate. You can also specify the
   * number of radial pieces `stacks`. A value of 1 for
   * stacks will give you a simple disc of pie pieces.  If you
   * want to create an annulus you can set `innerRadius` to a
   * value > 0. Finally, `stackPower` allows you to have the widths
   * increase or decrease as you move away from the center. This
   * is particularly useful when using the disc as a ground plane
   * with a fixed camera such that you don't need the resolution
   * of small triangles near the perimeter. For example, a value
   * of 2 will produce stacks whose ouside radius increases with
   * the square of the stack index. A value of 1 will give uniform
   * stacks.
   *
   * @param {number} radius Radius of the ground plane.
   * @param {number} divisions Number of triangles in the ground plane (at least 3).
   * @param {number} [stacks] Number of radial divisions (default=1).
   * @param {number} [innerRadius] Default 0.
   * @param {number} [stackPower] Power to raise stack size to for decreasing width.
   * @return {Object.<string, TypedArray>} The created vertices.
   * @memberOf module:twgl/primitives
   */
  function createDiscVertices(
      radius,
      divisions,
      stacks,
      innerRadius,
      stackPower) {
    if (divisions < 3) {
      throw Error('divisions must be at least 3');
    }

    stacks = stacks ? stacks : 1;
    stackPower = stackPower ? stackPower : 1;
    innerRadius = innerRadius ? innerRadius : 0;

    // Note: We don't share the center vertex because that would
    // mess up texture coordinates.
    var numVertices = (divisions + 1) * (stacks + 1);

    var positions = createAugmentedTypedArray(3, numVertices);
    var normals   = createAugmentedTypedArray(3, numVertices);
    var texcoords = createAugmentedTypedArray(2, numVertices);
    var indices   = createAugmentedTypedArray(3, stacks * divisions * 2, Uint16Array);

    var firstIndex = 0;
    var radiusSpan = radius - innerRadius;
    var pointsPerStack = divisions + 1;

    // Build the disk one stack at a time.
    for (var stack = 0; stack <= stacks; ++stack) {
      var stackRadius = innerRadius + radiusSpan * Math.pow(stack / stacks, stackPower);

      for (var i = 0; i <= divisions; ++i) {
        var theta = 2.0 * Math.PI * i / divisions;
        var x = stackRadius * Math.cos(theta);
        var z = stackRadius * Math.sin(theta);

        positions.push(x, 0, z);
        normals.push(0, 1, 0);
        texcoords.push(1 - (i / divisions), stack / stacks);
        if (stack > 0 && i !== divisions) {
          // a, b, c and d are the indices of the vertices of a quad.  unless
          // the current stack is the one closest to the center, in which case
          // the vertices a and b connect to the center vertex.
          var a = firstIndex + (i + 1);
          var b = firstIndex + i;
          var c = firstIndex + i - pointsPerStack;
          var d = firstIndex + (i + 1) - pointsPerStack;

          // Make a quad of the vertices a, b, c, d.
          indices.push(a, b, c);
          indices.push(a, c, d);
        }
      }

      firstIndex += divisions + 1;
    }

    return {
      position: positions,
      normal: normals,
      texcoord: texcoords,
      indices: indices,
    };
  }

  /**
   * creates a random integer between 0 and range - 1 inclusive.
   * @param {number} range
   * @return {number} random value between 0 and range - 1 inclusive.
   */
  function randInt(range) {
    return Math.random() * range | 0;
  }

  /**
   * Used to supply random colors
   * @callback RandomColorFunc
   * @param {number} ndx index of triangle/quad if unindexed or index of vertex if indexed
   * @param {number} channel 0 = red, 1 = green, 2 = blue, 3 = alpha
   * @return {number} a number from 0 to 255
   * @memberOf module:twgl/primitives
   */

  /**
   * @typedef {Object} RandomVerticesOptions
   * @property {number} [vertsPerColor] Defaults to 3 for non-indexed vertices
   * @property {module:twgl/primitives.RandomColorFunc} [rand] A function to generate random numbers
   * @memberOf module:twgl/primitives
   */

  /**
   * Creates an augmentedTypedArray of random vertex colors.
   * If the vertices are indexed (have an indices array) then will
   * just make random colors. Otherwise assumes they are triangles
   * and makes one random color for every 3 vertices.
   * @param {Object.<string, augmentedTypedArray>} vertices Vertices as returned from one of the createXXXVertices functions.
   * @param {module:twgl/primitives.RandomVerticesOptions} [options] options.
   * @return {Object.<string, augmentedTypedArray>} same vertices as passed in with `color` added.
   * @memberOf module:twgl/primitives
   */
  function makeRandomVertexColors(vertices, options) {
    options = options || {};
    var numElements = vertices.position.numElements;
    var vcolors = createAugmentedTypedArray(4, numElements, Uint8Array);
    var rand = options.rand || function(ndx, channel) {
      return channel < 3 ? randInt(256) : 255;
    };
    vertices.color = vcolors;
    if (vertices.indices) {
      // just make random colors if index
      for (var ii = 0; ii < numElements; ++ii) {
        vcolors.push(rand(ii, 0), rand(ii, 1), rand(ii, 2), rand(ii, 3));
      }
    } else {
      // make random colors per triangle
      var numVertsPerColor = options.vertsPerColor || 3;
      var numSets = numElements / numVertsPerColor;
      for (var ii = 0; ii < numSets; ++ii) {  // eslint-disable-line
        var color = [rand(ii, 0), rand(ii, 1), rand(ii, 2), rand(ii, 3)];
        for (var jj = 0; jj < numVertsPerColor; ++jj) {
          vcolors.push(color);
        }
      }
    }
    return vertices;
  }

  /**
   * creates a function that calls fn to create vertices and then
   * creates a buffers for them
   */
  function createBufferFunc(fn) {
    return function(gl) {
      var arrays = fn.apply(this, Array.prototype.slice.call(arguments, 1));
      return twgl.createBuffersFromArrays(gl, arrays);
    };
  }

  /**
   * creates a function that calls fn to create vertices and then
   * creates a bufferInfo object for them
   */
  function createBufferInfoFunc(fn) {
    return function(gl) {
      var arrays = fn.apply(null,  Array.prototype.slice.call(arguments, 1));
      return twgl.createBufferInfoFromArrays(gl, arrays);
    };
  }

  var arraySpecPropertyNames = [
    "numComponents",
    "size",
    "type",
    "normalize",
    "stride",
    "offset",
    "attrib",
    "name",
    "attribName",
  ];

  /**
   * Copy elements from one array to another
   *
   * @param {Array|TypedArray} src source array
   * @param {Array|TypedArray} dst dest array
   * @param {number} dstNdx index in dest to copy src
   * @param {number} [offset] offset to add to copied values
   */
  function copyElements(src, dst, dstNdx, offset) {
    offset = offset || 0;
    var length = src.length;
    for (var ii = 0; ii < length; ++ii) {
      dst[dstNdx + ii] = src[ii] + offset;
    }
  }

  /**
   * Creates an array of the same time
   *
   * @param {(number[]|ArrayBuffer|module:twgl.FullArraySpec)} srcArray array who's type to copy
   * @param {number} length size of new array
   * @return {(number[]|ArrayBuffer|module:twgl.FullArraySpec)} array with same type as srcArray
   */
  function createArrayOfSameType(srcArray, length) {
    var arraySrc = getArray(srcArray);
    var newArray = new arraySrc.constructor(length);
    var newArraySpec = newArray;
    // If it appears to have been augmented make new one augemented
    if (arraySrc.numComponents && arraySrc.numElements) {
      augmentTypedArray(newArray, arraySrc.numComponents);
    }
    // If it was a fullspec make new one a fullspec
    if (srcArray.data) {
      newArraySpec = {
        data: newArray,
      };
      utils.copyNamedProperties(arraySpecPropertyNames, srcArray, newArraySpec);
    }
    return newArraySpec;
  }

  /**
   * Concatinates sets of vertices
   *
   * Assumes the vertices match in composition. For example
   * if one set of vertices has positions, normals, and indices
   * all sets of vertices must have positions, normals, and indices
   * and of the same type.
   *
   * Example:
   *
   *      var cubeVertices = twgl.primtiives.createCubeVertices(2);
   *      var sphereVertices = twgl.primitives.createSphereVertices(1, 10, 10);
   *      // move the sphere 2 units up
   *      twgl.primitives.reorientVertices(
   *          sphereVertices, twgl.m4.translation([0, 2, 0]));
   *      // merge the sphere with the cube
   *      var cubeSphereVertices = twgl.primitives.concatVertices(
   *          [cubeVertices, sphereVertices]);
   *      // turn them into WebGL buffers and attrib data
   *      var bufferInfo = twgl.createBufferInfoFromArrays(gl, cubeSphereVertices);
   *
   * @param {module:twgl.Arrays[]} arrays Array of arrays of vertices
   * @return {module:twgl.Arrays} The concatinated vertices.
   * @memberOf module:twgl/primitives
   */
  function concatVertices(arrayOfArrays) {
    var names = {};
    var baseName;
    // get names of all arrays.
    // and numElements for each set of vertices
    for (var ii = 0; ii < arrayOfArrays.length; ++ii) {
      var arrays = arrayOfArrays[ii];
      Object.keys(arrays).forEach(function(name) {  // eslint-disable-line
        if (!names[name]) {
          names[name] = [];
        }
        if (!baseName && name !== 'indices') {
          baseName = name;
        }
        var arrayInfo = arrays[name];
        var numComponents = getNumComponents(arrayInfo, name);
        var array = getArray(arrayInfo);
        var numElements = array.length / numComponents;
        names[name].push(numElements);
      });
    }

    // compute length of combined array
    // and return one for reference
    function getLengthOfCombinedArrays(name) {
      var length = 0;
      var arraySpec;
      for (var ii = 0; ii < arrayOfArrays.length; ++ii) {
        var arrays = arrayOfArrays[ii];
        var arrayInfo = arrays[name];
        var array = getArray(arrayInfo);
        length += array.length;
        if (!arraySpec || arrayInfo.data) {
          arraySpec = arrayInfo;
        }
      }
      return {
        length: length,
        spec: arraySpec,
      };
    }

    function copyArraysToNewArray(name, base, newArray) {
      var baseIndex = 0;
      var offset = 0;
      for (var ii = 0; ii < arrayOfArrays.length; ++ii) {
        var arrays = arrayOfArrays[ii];
        var arrayInfo = arrays[name];
        var array = getArray(arrayInfo);
        if (name === 'indices') {
          copyElements(array, newArray, offset, baseIndex);
          baseIndex += base[ii];
        } else {
          copyElements(array, newArray, offset);
        }
        offset += array.length;
      }
    }

    var base = names[baseName];

    var newArrays = {};
    Object.keys(names).forEach(function(name) {
      var info = getLengthOfCombinedArrays(name);
      var newArraySpec = createArrayOfSameType(info.spec, info.length);
      copyArraysToNewArray(name, base, getArray(newArraySpec));
      newArrays[name] = newArraySpec;
    });
    return newArrays;
  }

  /**
   * Creates a duplicate set of vertices
   *
   * This is useful for calling reorientVertices when you
   * also want to keep the original available
   *
   * @param {module:twgl.Arrays} arrays of vertices
   * @return {module:twgl.Arrays} The dupilicated vertices.
   * @memberOf module:twgl/primitives
   */
  function duplicateVertices(arrays) {
    var newArrays = {};
    Object.keys(arrays).forEach(function(name) {
      var arraySpec = arrays[name];
      var srcArray = getArray(arraySpec);
      var newArraySpec = createArrayOfSameType(arraySpec, srcArray.length);
      copyElements(srcArray, getArray(newArraySpec), 0);
      newArrays[name] = newArraySpec;
    });
    return newArrays;
  }

  // Using quotes prevents Uglify from changing the names.
  // No speed diff AFAICT.
  return {
    "create3DFBufferInfo": createBufferInfoFunc(create3DFVertices),
    "create3DFBuffers": createBufferFunc(create3DFVertices),
    "create3DFVertices": create3DFVertices,
    "createAugmentedTypedArray": createAugmentedTypedArray,
    "createCubeBufferInfo": createBufferInfoFunc(createCubeVertices),
    "createCubeBuffers": createBufferFunc(createCubeVertices),
    "createCubeVertices": createCubeVertices,
    "createPlaneBufferInfo": createBufferInfoFunc(createPlaneVertices),
    "createPlaneBuffers": createBufferFunc(createPlaneVertices),
    "createPlaneVertices": createPlaneVertices,
    "createSphereBufferInfo": createBufferInfoFunc(createSphereVertices),
    "createSphereBuffers": createBufferFunc(createSphereVertices),
    "createSphereVertices": createSphereVertices,
    "createTruncatedConeBufferInfo": createBufferInfoFunc(createTruncatedConeVertices),
    "createTruncatedConeBuffers": createBufferFunc(createTruncatedConeVertices),
    "createTruncatedConeVertices": createTruncatedConeVertices,
    "createXYQuadBufferInfo": createBufferInfoFunc(createXYQuadVertices),
    "createXYQuadBuffers": createBufferFunc(createXYQuadVertices),
    "createXYQuadVertices": createXYQuadVertices,
    "createCresentBufferInfo": createBufferInfoFunc(createCresentVertices),
    "createCresentBuffers": createBufferFunc(createCresentVertices),
    "createCresentVertices": createCresentVertices,
    "createCylinderBufferInfo": createBufferInfoFunc(createCylinderVertices),
    "createCylinderBuffers": createBufferFunc(createCylinderVertices),
    "createCylinderVertices": createCylinderVertices,
    "createTorusBufferInfo": createBufferInfoFunc(createTorusVertices),
    "createTorusBuffers": createBufferFunc(createTorusVertices),
    "createTorusVertices": createTorusVertices,
    "createDiscBufferInfo": createBufferInfoFunc(createDiscVertices),
    "createDiscBuffers": createBufferFunc(createDiscVertices),
    "createDiscVertices": createDiscVertices,
    "deindexVertices": deindexVertices,
    "flattenNormals": flattenNormals,
    "makeRandomVertexColors": makeRandomVertexColors,
    "reorientDirections": reorientDirections,
    "reorientNormals": reorientNormals,
    "reorientPositions": reorientPositions,
    "reorientVertices": reorientVertices,
    "concatVertices": concatVertices,
    "duplicateVertices": duplicateVertices,
  };

});
