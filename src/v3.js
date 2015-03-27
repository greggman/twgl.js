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
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else {
    // Browser globals
    var lib = factory.call(root);
    root.twgl = root.twgl || {};
    root.twgl.v3 = lib;
  }
}(this, function () {
  "use strict";

  var VecType = Float32Array;

  /**
   * Creates a vec3
   * @return {Vec3} the created vector
   */
  function create() {
    return new VecType(3);
  };

  /**
   * Adds two vectors; assumes a and b have the same dimension.
   * @param {Vec3} a Operand vector.
   * @param {Vec3} b Operand vector.
   * @param {Vec3?} dst vector to hold result. If not new one is created..
   */
  function add(a, b, dst) {
    dst = dst || new VecType(3);

    dst[0] = a[0] + b[0];
    dst[1] = a[1] + b[1];
    dst[2] = a[2] + b[2];

    return dst;
  };

  /**
   * Subtracts two vectors.
   * @param {Vec3} a Operand vector.
   * @param {Vec3} b Operand vector.
   * @param {Vec3?} dst vector to hold result. If not new one is created..
   */
  function subtract(a, b, dst) {
    dst = dst || new VecType(3);

    dst[0] = a[0] - b[0];
    dst[1] = a[1] - b[1];
    dst[2] = a[2] - b[2];

    return dst;
  };

  /**
   * Performs linear interpolation on two vectors.
   * Given vectors a and b and interpolation coefficient t, returns
   * (1 - t) * a + t * b.
   * @param {Vec3} a Operand vector.
   * @param {Vec3} b Operand vector.
   * @param {number} t Interpolation coefficient.
  * @param {Vec3?} dst vector to hold result. If not new one is created..
   */
  function lerp(a, b, t, dst) {
    dst = dst || new VecType(3);

    dst[0] = (1 - t) * a[0] + t * b[0];
    dst[1] = (1 - t) * a[1] + t * b[1];
    dst[2] = (1 - t) * a[2] + t * b[2];

    return dst;
  };

  /**
   * Mutiplies a vector by a scalar.
   * @param {Vec3} v The vector.
   * @param {number} k The scalar.
   * @param {Vec3?} dst vector to hold result. If not new one is created..
   * @return {Vec3} dst.
   */
  function mulScalar(v, k, dst) {
    dst = dst || new VecType(3);

    dst[0] = v[0] * k;
    dst[1] = v[1] * k;
    dst[2] = v[2] * k;

    return dst;
  };

  /**
   * Divides a vector by a scalar.
   * @param {Vec3} v The vector.
   * @param {number} k The scalar.
   * @param {Vec3?} dst vector to hold result. If not new one is created..
   * @return {Vec3} dst.
   */
  function divScalar(v, k, dst) {
    dst = dst || new VecType(3);

    dst[0] = v[0] / k;
    dst[1] = v[1] / k;
    dst[2] = v[2] / k;

    return dst;
  };

  /**
   * Computes the cross product of two vectors; assumes both vectors have
   * three entries.
   * @param {Vec3} a Operand vector.
   * @param {Vec3} b Operand vector.
   * @param {Vec3?} dst vector to hold result. If not new one is created..
   * @return {Vec3} The vector a cross b.
   */
  function cross(a, b, dst) {
    dst = dst || new VecType(3);

    dst[0] = a[1] * b[2] - a[2] * b[1];
    dst[1] = a[2] * b[0] - a[0] * b[2];
    dst[2] = a[0] * b[1] - a[1] * b[0];

    return dst;
  };

  /**
   * Computes the dot product of two vectors; assumes both vectors have
   * three entries.
   * @param {Vec3} a Operand vector.
   * @param {Vec3} b Operand vector.
   * @return {number} dot product
   */
  function dot(a, b) {
    return (a[0] * b[0]) + (a[1] * b[1]) + (a[2] * b[2]);
  };

  /**
   * Computes the length of vector
   * @param {Vec3} v vector.
   * @return {number} length of vector.
   */
  function length(v) {
    return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
  }

  /**
   * Computes the square of the length of vector
   * @param {Vec3} v vector.
   * @return {number} square of the length of vector.
   */
  function lengthSq(a) {
    return a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
  }

  /**
   * Divides a vector by its Euclidean length and returns the quotient.
   * @param {Vec3} a The vector.
   * @param {Vec3?} dst vector to hold result. If not new one is created..
   * @return {Vec3} The normalized vector.
   */
  function normalize(a, dst) {
    dst = dst || new VecType(3);

    var lenSq = a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
    var len = Math.sqrt(lenSq);
    if (len > 0.00001) {
      dst[0] = a[0] / len;
      dst[1] = a[1] / len;
      dst[2] = a[2] / len;
    } else {
      dst[0] = 0;
      dst[1] = 0;
      dst[2] = 0;
    }

    return dst;
  };

  /**
   * Negates a vector.
   * @param {Vec3} v The vector.
   * @param {Vec3?} dst vector to hold result. If not new one is created..
   * @return {Vec3} -v.
   */
  function negate(v, dst) {
    dst = dst || new VecType(3);

    dst[0] = -v[0];
    dst[1] = -v[1];
    dst[2] = -v[2];

    return dst;
  };

  /**
   * Copies a vector.
   * @param {Vec3} v The vector.
   * @param {Vec3?} dst vector to hold result. If not new one is created..
   * @return {Vec3} A copy of v.
   */
  function copy(v, dst) {
    dst = dst || new VecType(3);

    dst[0] = v[0];
    dst[1] = v[1];
    dst[2] = v[2];

    return dst;
  };

  /**
   * Multiplies a vector by another vector (component-wise); assumes a and
   * b have the same length.
   * @param {Vec3} a Operand vector.
   * @param {Vec3} b Operand vector.
   * @param {Vec3?} dst vector to hold result. If not new one is created..
   * @return {Vec3} The vector of products of entries of a and
   *     b.
   */
  function multiply(a, b, dst) {
    dst = dst || new VecType(3);

    dst[0] = a[0] * b[0];
    dst[1] = a[1] * b[1];
    dst[2] = a[2] * b[2];

    return dst;
  };

  /**
   * Divides a vector by another vector (component-wise); assumes a and
   * b have the same length.
   * @param {Vec3} a Operand vector.
   * @param {Vec3} b Operand vector.
   * @param {Vec3?} dst vector to hold result. If not new one is created..
   * @return {Vec3} The vector of quotients of entries of a and
   *     b.
   */
  function divide(a, b, dst) {
    dst = dst || new VecType(3);

    dst[0] = a[0] / b[0];
    dst[1] = a[1] / b[1];
    dst[2] = a[2] / b[2];

    return dst;
  };

  return {
    add: add,
    copy: copy,
    create: create,
    cross: cross,
    divide: divide,
    divScalar: divScalar,
    dot: dot,
    lerp: lerp,
    length: length,
    lengthSq: lengthSq,
    mulScalar: mulScalar,
    multiply: multiply,
    negate: negate,
    normalize: normalize,
    subtract: subtract,
  };

}));
