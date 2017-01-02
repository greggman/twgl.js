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
   * vertex array object related functions
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
   * @module twgl/vertexArrays
   */

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
    programInfos.forEach(function(programInfo) {
      programs.setBuffersAndAttributes(gl, programInfo, bufferInfo);
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
   * @memberOf module:twgl/vertexArrays
   */
  function createVAOAndSetAttributes(gl, setters, attribs, indices) {
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    programs.setAttributes(setters, attribs);
    if (indices) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
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
   * @memberOf module:twgl/vertexArrays
   */
  function createVAOFromBufferInfo(gl, programInfo, bufferInfo) {
    return createVAOAndSetAttributes(gl, programInfo.attribSetters || programInfo, bufferInfo.attribs, bufferInfo.indices);
  }

  // Using quotes prevents Uglify from changing the names.
  // No speed diff AFAICT.
  return {
    "createVertexArrayInfo": createVertexArrayInfo,
    "createVAOAndSetAttributes": createVAOAndSetAttributes,
    "createVAOFromBufferInfo": createVAOFromBufferInfo,
  };

});


