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
    './programs',
  ], function(
    programs) {
  "use strict";

  /**
   * Drawing related functions
   *
   * For backward compatibily they are available at both `twgl.draw` and `twgl`
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
   * @param {enum} type eg (gl.TRIANGLES, gl.LINES, gl.POINTS, gl.TRIANGLE_STRIP, ...)
   * @param {(module:twgl.BufferInfo|module:twgl.VertexArrayInfo)} bufferInfo A BufferInfo as returned from {@link module:twgl.createBufferInfoFromArrays} or
   *   a VertexArrayInfo as returned from {@link module:twgl.createVertexArrayInfo}
   * @param {number} [count] An optional count. Defaults to bufferInfo.numElements
   * @param {number} [offset] An optional offset. Defaults to 0.
   * @memberOf module:twgl/draw
   */
  function drawBufferInfo(gl, type, bufferInfo, count, offset) {
    var indices = bufferInfo.indices;
    var elementType = bufferInfo.elementType;
    var numElements = count === undefined ? bufferInfo.numElements : count;
    offset = offset === undefined ? 0 : offset;
    if (elementType || indices) {
      gl.drawElements(type, numElements, elementType === undefined ? gl.UNSIGNED_SHORT : bufferInfo.elementType, offset);
    } else {
      gl.drawArrays(type, offset, numElements);
    }
  }

  /**
   * A DrawObject is useful for putting objects in to an array and passing them to {@link module:twgl.drawObjectList}.
   *
   * You need either a `BufferInfo` or a `VertexArrayInfo`.
   *
   * @typedef {Object} DrawObject
   * @property {boolean} [active] whether or not to draw. Default = `true` (must be `false` to be not true). In otherwords `undefined` = `true`
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
   * @property {number} [count] the count to pass to `gl.drawArrays` or `gl.drawElemnts`. Defaults to bufferInfo.numElements.
   * @memberOf module:twgl
   */

  /**
   * Draws a list of objects
   * @param {DrawObject[]} objectsToDraw an array of objects to draw.
   * @memberOf module:twgl/draw
   */
  function drawObjectList(gl, objectsToDraw) {
    var lastUsedProgramInfo = null;
    var lastUsedBufferInfo = null;

    objectsToDraw.forEach(function(object) {
      if (object.active === false) {
        return;
      }

      var programInfo = object.programInfo;
      var bufferInfo = object.vertexArrayInfo || object.bufferInfo;
      var bindBuffers = false;
      var type = object.type === undefined ? gl.TRIANGLES : object.type;

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
      drawBufferInfo(gl, type, bufferInfo, object.count, object.offset);
    });

    if (lastUsedBufferInfo.vertexArrayObject) {
      gl.bindVertexArray(null);
    }
  }

  // Using quotes prevents Uglify from changing the names.
  // No speed diff AFAICT.
  return {
    "drawBufferInfo": drawBufferInfo,
    "drawObjectList": drawObjectList,
  };

});

