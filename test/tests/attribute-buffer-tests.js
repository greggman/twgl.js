import {
  // assertArrayEqual,
  // assertTruthy,
  // assertFalsy,
  assertEqual,
} from '../assert.js';
import {describe} from '../mocha-support.js';
import {
  assertNoWebGLError,
  checkColor,
  createContext,
  itWebGL,
} from '../webgl.js';


describe('attribute/buffer tests', () => {

  function createBuffer(gl, size) {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, size, gl.STATIC_DRAW);
    return buf;
  }

  function getBufferSize(gl, buf) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    return gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);
  }

  itWebGL('draws with just attribute values', () => {
    const {gl} = createContext();
    gl.canvas.width = 1;
    gl.canvas.height = 1;
    gl.viewport(0, 0, 1, 1);

    const vs = `
    attribute vec4 position;
    attribute vec4 color;

    varying vec4 v_color;

    void main() {
      gl_PointSize = 1.0;
      gl_Position = position;
      v_color = color;
    }
    `;
    const fs = `
    precision mediump float;

    varying vec4 v_color;
    void main() {
      gl_FragColor = v_color;
    }`;

    const programInfo = twgl.createProgramInfo(gl, [vs, fs]);
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, {
      position: { value: [0, 0] },
      color: { value: [1, 0, 0, 1] },
    });

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    gl.drawArrays(gl.POINTS, 0, 1);

    checkColor(gl, [255, 0, 0, 255]);

    bufferInfo.attribs.color.value = [0, 1, 0, 1];
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    gl.drawArrays(gl.POINTS, 0, 1);

    checkColor(gl, [0, 255, 0, 255]);
    assertNoWebGLError(gl);
  });

  const types = [
    { Type: Int8Array,    glTypeName: 'BYTE',          normalize: true,},
    { Type: Uint8Array,   glTypeName: 'UNSIGNED_BYTE', normalize: true,},
    { Type: Int16Array,   glTypeName: 'SHORT'},
    { Type: Uint16Array,  glTypeName: 'UNSIGNED_SHORT'},
    { Type: Int32Array,   glTypeName: 'INT'},
    { Type: Uint32Array,  glTypeName: 'UNSIGNED_INT'},
    { Type: Float32Array, glTypeName: 'FLOAT'},
  ];
  const safeSize = 2 * 3 * 4;

  for (const {Type, glTypeName, normalize = false} of types) {
    itWebGL(`gets the correct AttribInfo for ${Type.name}`, () => {
      const {gl} = createContext();
      const glType = gl[glTypeName];
      const buf = createBuffer(gl, safeSize);
      const bufferInfo = twgl.createBufferInfoFromArrays(gl, {
        base: new Type(safeSize),
        bySize: { data: safeSize, type: Type, },
        byData: { data: [1, 2, 3, 4, 5, 6], type: Type, },
        byBuf: { buffer: buf, type: Type, },
      });

      const attribs = bufferInfo.attribs;
      assertEqual(attribs.base.type, glType);
      assertEqual(attribs.bySize.type, glType);
      assertEqual(attribs.byData.type, glType);
      assertEqual(attribs.byBuf.type, glType);
      assertEqual(attribs.base.normalize, normalize);
      assertEqual(attribs.byData.normalize, normalize);
      assertEqual(attribs.byBuf.normalize, normalize);
    });

    itWebGL(`gets the correct AttribInfo for ${glTypeName}`, () => {
      const {gl} = createContext();
      const glType = gl[glTypeName];
      const buf = createBuffer(gl, safeSize);
      const bufferInfo = twgl.createBufferInfoFromArrays(gl, {
        bySize: { data: safeSize, type: glType, },
        byData: { data: [1, 2, 3, 4, 5, 6], type: glType, },
        byBuf: { buffer: buf, type: glType, },
      });
      const attribs = bufferInfo.attribs;
      assertEqual(attribs.bySize.type, glType);
      assertEqual(attribs.byData.type, glType);
      assertEqual(attribs.byBuf.type, glType);
      assertEqual(getBufferSize(gl, attribs.bySize.buffer), Type.BYTES_PER_ELEMENT * safeSize);
      assertEqual(getBufferSize(gl, attribs.byData.buffer), Type.BYTES_PER_ELEMENT * 6);
    });
  }

  itWebGL('sets correct type', () => {
    const {gl} = createContext();
    const buf = createBuffer(gl, 24);
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, {
      untyped: [1, 2, 3, 4, 5, 6],
      buf: { buffer: buf, },
    });
    const attribs = bufferInfo.attribs;
    assertEqual(attribs.untyped.type, gl.FLOAT);
    assertEqual(attribs.buf.type, gl.FLOAT);
    assertEqual(getBufferSize(gl, attribs.untyped.buffer), Float32Array.BYTES_PER_ELEMENT * 6);
  });

});