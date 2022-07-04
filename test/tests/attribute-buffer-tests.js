import {
  // assertArrayEqual,
  // assertTruthy,
  // assertFalsy,
  // assertEqual,
} from '../assert.js';
import {describe} from '../mocha-support.js';
import {
  assertNoWebGLError,
  checkColor,
  createContext,
  itWebGL,
} from '../webgl.js';


describe('attribute/buffer tests', () => {

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

});