import {assertArrayEqual, assertTruthy} from '../assert.js';
import {describe, it} from '../mocha-support.js';
import {createContext2} from '../webgl.js';

describe('program tests', () => {

  it('test uniform block', async() => {
    const {gl} = createContext2();
    if (!gl) {
      return;
    }

    const vs = `#version 300 es
    void main() {
      gl_Position = vec4(0, 0, 0, 1);
      gl_PointSize = 1.0;
    }
    `;

    const fs = `#version 300 es
    precision mediump float;
    uniform Foo {
      vec2 v2a[3];
      vec3 v3a[3];
      mat2 m2a[3];
      mat2x3 m23a[3];
      mat3x2 m32a[3];
      float f;
      float f1;
      vec2 v21;
      vec2 v22;
      vec4 v4;
      float f2;
      float fa[2];
      float f3;
    };

    out vec4 outColor;
    void main() {
      outColor = v4;
    }
    `;

    const programInfo = twgl.createProgramInfo(gl, [vs, fs]);
    assertTruthy(programInfo);

    const uboInfo = twgl.createUniformBlockInfo(gl, programInfo, "Foo");
    twgl.setBlockUniforms(uboInfo, {
      v2a: [
        1, 2,
        3, 4,
        5, 6,
      ],
      v3a: [
        11, 12, 13,
        14, 15, 16,
        17, 18, 19,
      ],
      m2a: [
        21, 22,
        23, 24,

        25, 26,
        27, 28,

        29, 210,
        211, 212,
      ],
      m23a: [
        31, 32, 33,
        34, 35, 36,

        37, 38, 39,
        310, 311, 312,

        313, 314, 315,
        316, 317, 318,
      ],
      m32a: [
        41, 42,
        43, 44,
        45, 46,

        47, 48,
        49, 410,
        411, 412,

        412, 412,
        415, 416,
        417, 418,
      ],
      f: [51],
      f1: [61],
      v21: [71, 72],
      v22: [81, 82],
      v4: [91, 92, 93, 94],
      f2: 101,              // test I can set scalar with value, not array
      fa: [111, 112],
      f3: [121],
    });
    twgl.setUniformBlock(gl, programInfo, uboInfo);
    const data = new Float32Array(
      4 * 3 +     // vec2 v2a[3];     //   0:    0
      4 * 3 +     // vec3 v3a[3];     //  12:   48
      2 * 4 * 3 + // mat2 m2a[3];     //  24:   96
      2 * 4 * 3 + // mat2x3 m23a[3];  //  48:  192
      3 * 4 * 3 + // mat3x2 m32a[3];  //  72:  288
      1 +         // float f;         // 108:  432
      1 +         // float f1;        // 109:  436
      2 +         // vec2 v21;        // 110:  440
      2 +         // vec2 v22;        // 112:  448
      2 +         // padding          //
      4 +         // vec4 v4;         // 116:  464
      1 +         // float f2         // 120:  480
      3 +         // padding          //
      2 * 4 +     // float fa[2];     // 124:  496
      1 +         // float f3;        // 132:  528
      0
    );
    gl.getBufferSubData(gl.UNIFORM_BUFFER, 0, data);

    const expected = new Float32Array([
      // v2a: [
        1, 2, 0, 0,
        3, 4, 0, 0,
        5, 6, 0, 0,
      // ],
      // v3a: [
        11, 12, 13, 0,
        14, 15, 16, 0,
        17, 18, 19, 0,
      // ],
      // m2a: [
        21, 22, 0, 0,
        23, 24, 0, 0,

        25, 26, 0, 0,
        27, 28, 0, 0,

        29, 210, 0, 0,
        211, 212, 0, 0,
      // ],
      // m23a: [
        31, 32, 33, 0,
        34, 35, 36, 0,

        37, 38, 39, 0,
        310, 311, 312, 0,

        313, 314, 315, 0,
        316, 317, 318, 0,
      // ],
      // m32a: [
        41, 42, 0, 0,
        43, 44, 0, 0,
        45, 46, 0, 0,

        47, 48, 0, 0,
        49, 410, 0, 0,
        411, 412, 0, 0,

        412, 412, 0, 0,
        415, 416, 0, 0,
        417, 418, 0, 0,
      // ],
      //f: [
        51,
      //],
      // f1: [
        61,
      //],
      // v21: [
        71, 72,
      //],
      // v22: [
        81, 82,
      //],
      // padding
      0, 0,
      //v4: [
        91, 92, 93, 94,
      //],
      //f1: [
        101,
      // ],
      // padding
      0, 0, 0,
      //fa: [
        111, 0, 0, 0,
        112, 0, 0, 0,
      //],
      //f2: [
        121,
      //],
    ]);
    assertArrayEqual(data, expected);
  });

});