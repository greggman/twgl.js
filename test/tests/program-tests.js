import {
  assertArrayEqual,
  assertTruthy,
  assertFalsy,
  assertEqual,
} from '../assert.js';
import {beforeEach, afterEach, describe, it} from '../mocha-support.js';
import {
  assertNoWebGLError,
  itWebGL2,
  createContext,
  createContext2,
  checkColor,
  itWebGL,
  fnWithCallbackToPromise,
} from '../webgl.js';

class MsgCapturer {
  constructor() {
    this.errors = [];
    this.cb = (msg) => this.errors.push(msg);
  }
  hasMsgs() {
    return this.errors.length > 0;
  }
}

describe('program tests', () => {

  describe('createProgramInfo', () => {

    itWebGL('succeeds with good shaders', () => {
      const {gl} = createContext();
      const msgCapturer = new MsgCapturer();
      const programInfo = twgl.createProgramInfo(gl, [
        'void main() { gl_Position = vec4(0); }',
        'precision mediump float; void main() { gl_FragColor = vec4(0); }',
      ], {
        errorCallback: msgCapturer.cb,
      });
      assertTruthy(programInfo);
      assertFalsy(msgCapturer.hasMsgs());
    });

    itWebGL('assigns attribute locations via 3rd argument', () => {
      const {gl} = createContext();
      const programInfo = twgl.createProgramInfo(gl, [
        `
        attribute vec4 foo;
        attribute vec4 bar;
        attribute vec4 moo;
        void main() { gl_Position = foo + bar + moo; }
        `,
        'precision mediump float; void main() { gl_FragColor = vec4(0); }',
      ], ['bar', 'moo', 'foo']);
      assertTruthy(programInfo);
      assertEqual(gl.getAttribLocation(programInfo.program, 'bar'), 0);
      assertEqual(gl.getAttribLocation(programInfo.program, 'moo'), 1);
      assertEqual(gl.getAttribLocation(programInfo.program, 'foo'), 2);
    });

    itWebGL('assigns attribute locations via programOptions', () => {
      const {gl} = createContext();
      const msgCapturer = new MsgCapturer();
      const programInfo = twgl.createProgramInfo(gl, [
        `
        attribute vec4 foo;
        attribute vec4 bar;
        attribute vec4 moo;
        void main() { gl_Position = foo + bar + moo; }
        `,
        'precision mediump float; void main() { gl_FragColor = vec4(0); }',
      ], {
        errorCallback: msgCapturer.cb,
        attribLocations: ['bar', 'moo', 'foo'],
      });
      assertTruthy(programInfo);
      assertFalsy(msgCapturer.hasMsgs());
      assertEqual(gl.getAttribLocation(programInfo.program, 'bar'), 0);
      assertEqual(gl.getAttribLocation(programInfo.program, 'moo'), 1);
      assertEqual(gl.getAttribLocation(programInfo.program, 'foo'), 2);
    });

    itWebGL('fails with bad shader', () => {
      const {gl} = createContext();
      const msgCapturer = new MsgCapturer();
      const programInfo = twgl.createProgramInfo(gl, [
        'void main() { gl_Position = vec4(0); }',
        'bad code',
      ], {
        errorCallback: msgCapturer.cb,
      });
      assertFalsy(programInfo);
      assertTruthy(msgCapturer.hasMsgs());
    });

    itWebGL('fails with too few shaders', () => {
      const {gl} = createContext();
      const msgCapturer = new MsgCapturer();
      const programInfo = twgl.createProgramInfo(gl, [
        'void main() { gl_Position = vec4(0); }',
      ], {
        errorCallback: msgCapturer.cb,
      });
      assertFalsy(programInfo);
      assertTruthy(msgCapturer.hasMsgs());
    });

    itWebGL('works async with callback', async function() {
      const {gl} = createContext();
      const programInfo = await fnWithCallbackToPromise(twgl.createProgramInfo)(gl, [
        `void main() {gl_Position = vec4(0); }`,
        `precision mediump float;
         uniform vec4 u_foo;
         void main() {
           gl_FragColor = u_foo;
         }`,
      ], {
        callback(err, programInfo) {
          assertFalsy(err);
          assertTruthy(programInfo);
          assertTruthy(programInfo.program instanceof WebGLProgram);
          assertTruthy(gl.getProgramParameter(programInfo.program, gl.LINK_STATUS));
          gl.useProgram(programInfo.program);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
          assertNoWebGLError(gl);
        },
      });
      assertFalsy(programInfo);
    });

    itWebGL('works async with callback with bad shader', async function() {
      const {gl} = createContext();
      const msgs = [];
      const programInfo = await fnWithCallbackToPromise(twgl.createProgramInfo)(gl, [
        `void main() {gl_Position = vec4(0); }`,
        `precision mediump float;
         uniform vec4 u_foo;
         void main() {
           gl_Frag Color = u_foo;
         }`,
      ], {
        errorCallback(msg) {
          msgs.push(msg);
        },
        callback(err, programInfo) {
          assertTruthy(err);
          assertFalsy(programInfo);
          assertTruthy(msgs.length > 0);
        },
      });
      assertFalsy(programInfo);
    });

    itWebGL('works async with callback missing shader', async function() {
      const {gl} = createContext();
      const msgs = [];
      const programInfo = await fnWithCallbackToPromise(twgl.createProgramInfo)(gl, [
        `void main() {gl_Position = vec4(0); }`,
      ], {
        errorCallback(msg) {
          msgs.push(msg);
        },
        callback(err, programInfo) {
          assertTruthy(err);
          assertFalsy(programInfo);
          assertTruthy(msgs.length > 0);
        },
      });
      assertFalsy(programInfo);
    });

  });

  describe('createProgramInfos', () => {

    itWebGL('createProgramInfos', () => {
      const {gl} = createContext();
      const msgCapturer = new MsgCapturer();
      const programInfos = twgl.createProgramInfos(gl, {
        foo: [
          'void main() { gl_Position = vec4(0); }',
          'precision mediump float; void main() { gl_FragColor = vec4(0); }',
        ],
        bar: [
          'void main() { gl_Position = vec4(0); }',
          'precision mediump float; void main() { gl_FragColor = vec4(0); }',
        ],
      }, {
        errorCallback: msgCapturer.cb,
      });
      assertTruthy(programInfos.foo.program instanceof WebGLProgram);
      assertTruthy(programInfos.bar.program instanceof WebGLProgram);
      assertFalsy(msgCapturer.hasMsgs());
    });

    itWebGL('createProgramInfos sets attrib locations', () => {
      const {gl} = createContext();
      const msgCapturer = new MsgCapturer();
      const programInfos = twgl.createProgramInfos(gl, {
        foo: {
          shaders: [
            'attribute vec4 foo; attribute vec4 bar; void main() { gl_Position = foo + bar; }',
            'precision mediump float; void main() { gl_FragColor = vec4(0); }',
          ],
        },
        bar: {
          shaders: [
            'attribute vec4 moo; attribute vec4 bar; void main() { gl_Position = moo + bar; }',
            'precision mediump float; void main() { gl_FragColor = vec4(0); }',
          ],
          attribLocations: ['bar', 'moo'],
        },
        moo: {
          shaders: [
            'attribute vec4 moo; attribute vec4 bar; void main() { gl_Position = moo + bar; }',
            'precision mediump float; void main() { gl_FragColor = vec4(0); }',
          ],
        },
      }, {
        attribLocations: ['moo', 'foo', 'bar'],
        errorCallback: msgCapturer.cb,
      });
      assertTruthy(programInfos.foo.program instanceof WebGLProgram);
      assertTruthy(programInfos.bar.program instanceof WebGLProgram);
      assertTruthy(programInfos.moo.program instanceof WebGLProgram);

      assertEqual(gl.getAttribLocation(programInfos.foo.program, 'foo'), 1);
      assertEqual(gl.getAttribLocation(programInfos.foo.program, 'bar'), 2);

      assertEqual(gl.getAttribLocation(programInfos.bar.program, 'moo'), 1);
      assertEqual(gl.getAttribLocation(programInfos.bar.program, 'bar'), 0);

      assertEqual(gl.getAttribLocation(programInfos.moo.program, 'moo'), 0);
      assertEqual(gl.getAttribLocation(programInfos.moo.program, 'bar'), 2);

      assertFalsy(msgCapturer.hasMsgs());
    });

    itWebGL('createProgramInfos calls the correct errorCallback', () => {
      const {gl} = createContext();
      const mainMsgCapturer = new MsgCapturer();
      const subMsgCapturer = new MsgCapturer();
      const programInfos = twgl.createProgramInfos(gl, {
        foo: {
          shaders: [
            'void main() { gl_Position = vec4(0); }',
            'precision mediump float; void main() { gl_FragColor = vec4(0); }',
          ],
        },
        bar: {
          shaders: [
            'void main() { gl_Position = vec4(0); }',
            'precision mediump float; void main() { gl_FragColor = vec4(0); }',
          ],
          attribLocations: ['bar', 'moo'],
          errorCallback: subMsgCapturer.cb,
        },
        moo: {
          shaders: [
            'bad',
            'precision mediump float; void main() { gl_FragColor = vec4(0); }',
          ],
        },
      }, {
        attribLocations: ['moo', 'foo', 'bar'],
        errorCallback: mainMsgCapturer.cb,
      });
      assertFalsy(programInfos);
      assertFalsy(subMsgCapturer.hasMsgs());
      assertTruthy(mainMsgCapturer.hasMsgs());
    });

    itWebGL('createProgramInfos calls the correct errorCallback(2)', () => {
      const {gl} = createContext();
      const mainMsgCapturer = new MsgCapturer();
      const subMsgCapturer = new MsgCapturer();
      const programInfos = twgl.createProgramInfos(gl, {
        foo: {
          shaders: [
            'void main() { gl_Position = vec4(0); }',
            'precision mediump float; void main() { gl_FragColor = vec4(0); }',
          ],
        },
        bar: {
          shaders: [
            'bad',
            'precision mediump float; void main() { gl_FragColor = vec4(0); }',
          ],
          attribLocations: ['bar', 'moo'],
          errorCallback: subMsgCapturer.cb,
        },
        moo: {
          shaders: [
            'void main() { gl_Position = vec4(0); }',
            'precision mediump float; void main() { gl_FragColor = vec4(0); }',
          ],
        },
      }, {
        attribLocations: ['moo', 'foo', 'bar'],
        errorCallback: mainMsgCapturer.cb,
      });
      assertFalsy(programInfos);
      assertTruthy(subMsgCapturer.hasMsgs());
      assertFalsy(mainMsgCapturer.hasMsgs());
    });

  });

  describe('createProgram', () => {

    itWebGL('succeeds with good shaders', () => {
      const {gl} = createContext();
      const msgCapturer = new MsgCapturer();
      const program = twgl.createProgram(gl, [
        'void main() { gl_Position = vec4(0); }',
        'precision mediump float; void main() { gl_FragColor = vec4(0); }',
      ], {
        errorCallback: msgCapturer.cb,
      });
      assertTruthy(program instanceof WebGLProgram);
      assertFalsy(msgCapturer.hasMsgs());
    });

    itWebGL('fails with bad shader', () => {
      const {gl} = createContext();
      const msgCapturer = new MsgCapturer();
      const program = twgl.createProgram(gl, [
        'void main() { gl_Position = vec4(0); }',
        'bad code',
      ], {
        errorCallback: msgCapturer.cb,
      });
      assertFalsy(program);
      assertTruthy(msgCapturer.hasMsgs());
    });

    itWebGL('fails with too few shaders', () => {
      const {gl} = createContext();
      const msgCapturer = new MsgCapturer();
      const program = twgl.createProgram(gl, [
        'void main() { gl_Position = vec4(0); }',
      ], {
        errorCallback: msgCapturer.cb,
      });
      assertFalsy(program);
      assertTruthy(msgCapturer.hasMsgs());
    });

    itWebGL('succeeds with good existing shaders', () => {
      const {gl} = createContext();
      const msgCapturer = new MsgCapturer();
      const vs = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vs, `void main() { gl_Position = vec4(0); }`);
      gl.compileShader(vs);
      const fs = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fs, `precision mediump float; void main() { gl_FragColor = vec4(0); }`);
      gl.compileShader(fs);
      const program = twgl.createProgram(gl, [vs, fs], {
        errorCallback: msgCapturer.cb,
      });
      assertTruthy(program instanceof WebGLProgram);
      assertFalsy(msgCapturer.hasMsgs());
    });

    itWebGL('does not delete existing shaders', () => {
      const {gl} = createContext();
      const msgCapturer = new MsgCapturer();
      const vs = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vs, `void main() { gl_Position = vec4(0); }`);
      gl.compileShader(vs);
      const fsBad = `precision mediump float; void main() { gl_FragColorS = vec4(0); }`;
      const programBad = twgl.createProgram(gl, [vs, fsBad], {
        errorCallback: () => {},
      });
      assertFalsy(programBad);
      const fsGood = `precision mediump float; void main() { gl_FragColor = vec4(0); }`;
      const programGood = twgl.createProgram(gl, [vs, fsGood], {
        errorCallback: msgCapturer.cb,
      });
      assertTruthy(programGood instanceof WebGLProgram);
      assertFalsy(msgCapturer.hasMsgs());
    });

    itWebGL('compiles program async with callback', async function() {
      const {gl} = createContext();
      const program = await fnWithCallbackToPromise(twgl.createProgram)(gl, [
        `void main() { gl_Position = vec4(0); }`,
        `precision mediump float; void main() { gl_FragColor = vec4(0); }`,
      ], {
        callback(err, program) {
          assertFalsy(err);
          assertTruthy(program instanceof WebGLProgram);
          assertTruthy(gl.getProgramParameter(program, gl.LINK_STATUS));
          gl.useProgram(program);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
          assertEqual(gl.getError(), gl.NONE);
        },
      });
      assertFalsy(program);  // nothing is returned if callback
    });

    itWebGL('compiles program async with callback with error', async function() {
      const {gl} = createContext();
      const msgs = [];
      const program = await fnWithCallbackToPromise(twgl.createProgram)(gl, [
        `void main() { gl_Position = vec4(0); }`,
        `precision mediump float; void main() { gl_Frag Color = vec4(0); }`,
      ], {
        errorCallback(msg) {
          msgs.push(msg);
        },
        callback(err, program) {
          assertTruthy(err);
          assertFalsy(program);
          assertTruthy(msgs.length > 0);
        },
      });
      assertFalsy(program);  // nothing is returned if callback
    });

  });

  describe('createProgramAsync', () => {

    itWebGL('compiles program async', async() => {
      const {gl} = createContext();
      const program = await twgl.createProgramAsync(gl, [
        `void main() { gl_Position = vec4(0); }`,
        `precision mediump float; void main() { gl_FragColor = vec4(0); }`,
      ]);
      assertTruthy(program instanceof WebGLProgram);
      assertTruthy(gl.getProgramParameter(program, gl.LINK_STATUS));
      gl.useProgram(program);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      assertEqual(gl.getError(), gl.NONE);
    });

    itWebGL('throws error with bad shaders', async() => {
      const {gl} = createContext();
      const msgs = [];
      let err;
      try {
        await twgl.createProgramAsync(gl, [
          `void main() { gl_Position = vec4(0); }`,
          `precision mediump float; void main() { gl_Frag Color = vec4(0); }`,
        ], {
          errorCallback(msg) {
            msgs.push(msg);
          },
        });
      } catch (e) {
        err = e;
      }

      assertTruthy(err);
      assertTruthy(msgs.length > 0);
    });

  });

  describe('createProgramInfoAsync', () => {

    itWebGL('succeeds with good shaders', async() => {
      const {gl} = createContext();
      const programInfo = await twgl.createProgramInfoAsync(gl, [
        `void main() {gl_Position = vec4(0); }`,
        `precision mediump float;
         uniform vec4 u_foo;
         void main() {
           gl_FragColor = u_foo;
         }`,
      ]);
      assertTruthy(programInfo);
      assertTruthy(programInfo.program instanceof WebGLProgram);
      assertTruthy(gl.getProgramParameter(programInfo.program, gl.LINK_STATUS));
      gl.useProgram(programInfo.program);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      assertEqual(gl.getError(), gl.NONE);
    });

    itWebGL('throws with bad shaders', async() => {
      const {gl} = createContext();
      const msgs = [];
      let err;
      let programInfo;
      try {
        programInfo = await twgl.createProgramInfoAsync(gl, [
          `void main() {gl_Position = vec4(0); }`,
          `precision mediump float;
           uniform vec4 u_foo;
           void main() {
             gl_Frag Color = u_foo;
           }`,
        ], {
          errorCallback(msg) {
            msgs.push(msg);
          },
        });
      } catch (e) {
        err = e;
      }
      assertTruthy(err);
      assertFalsy(programInfo);
      assertTruthy(msgs.length > 0);
    });

    itWebGL('throws with bad id', async() => {
      const {gl} = createContext();
      const msgs = [];
      let err;
      let programInfo;
      try {
        programInfo = await twgl.createProgramInfoAsync(gl, [
          `idThatDoesNotExist`,
          'anotherIdThatDoesNotExist',
        ], {
          errorCallback(msg) {
            msgs.push(msg);
          },
        });
      } catch (e) {
        err = e;
      }
      assertTruthy(err);
      assertFalsy(programInfo);
      assertTruthy(msgs.length > 0);
    });

  });

  describe('uniform blocks', () => {

    itWebGL2('test uniform block', async() => {
      const {gl} = createContext2();
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

    itWebGL2('test built in uniform', ['WEBGL_multi_draw'], () => {
      const {gl} = createContext2();
      const ext = gl.getExtension('WEBGL_multi_draw');
      assertTruthy(ext);

      const vs = `#version 300 es
      #extension GL_ANGLE_multi_draw : require

      uniform float foo;
      uniform float moo;
      uniform MyBlock {
        float bar;
      };
      void main() {
          gl_Position = vec4(gl_DrawID, foo, moo, bar);
      }
      `;

      const fs = `#version 300 es
      precision highp float;
      out vec4 outColor;

      void main()
      {
          outColor = vec4(0, 1, 0, 1);
      }`;

      const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

      // this isn't much of a test. Mostly twgl used to have issues here
      assertTruthy(programInfo.uniformSetters.foo);
      assertTruthy(programInfo.uniformSetters.moo);
      assertFalsy(programInfo.uniformSetters.gl_DrawID);
      assertTruthy(programInfo.uniformBlockSpec.uniformData.length >= 3);  // foo, bar, moo

      assertEqual(gl.getError(), gl.NONE);
    });

    it('test uniform struct/array', () => {
      const {gl} = createContext();

      gl.canvas.width = 1;
      gl.canvas.height = 1;
      gl.viewport(0, 0, 1, 1);

      const vs = `
      struct Extra {
        float f;
        vec4 v4;
        vec3 v3;
      };
      struct Light {
        float intensity;
        vec4 color;
        float nearFar[2];
        Extra extra[2];
      };
      uniform Light lights[2];
      varying vec4 v_out;

      vec4 getLight(Light l) {
        return
            vec4(l.intensity) +
            vec4(l.color) +
            vec4(l.nearFar[0], l.nearFar[1], 0, 0) +
            vec4(l.extra[0].f) +
            vec4(l.extra[0].v4) +
            vec4(l.extra[0].v3, 0) +
            vec4(l.extra[1].f) +
            vec4(l.extra[1].v4) +
            vec4(l.extra[1].v3, 0);
      }
      void main() {
        gl_Position = vec4(0, 0, 0, 1);
        gl_PointSize = 1.0;
        v_out = getLight(lights[0]) + getLight(lights[1]);
      }
      `;

      const fs = `
      precision mediump float;
      varying vec4 v_out;
      void main() {
        gl_FragColor = v_out / 255.0;
      }
      `;

      const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

      gl.useProgram(programInfo.program);

      twgl.setUniforms(programInfo, {
        lights: [
          {
            extra: [
              { v4: [11, 22, 33, 44] },
            ],
          },
        ],
      });
      gl.drawArrays(gl.POINTS, 0, 1);
      checkColor(gl, [11, 22, 33, 44]);

      twgl.setUniforms(programInfo, {
        lights: [
          {
            extra: [
              { v4: [11, 22, 33, 44] },
              { v3: [10, 20, 30] },
            ],
          },
        ],
      });
      gl.drawArrays(gl.POINTS, 0, 1);
      checkColor(gl, [21, 42, 63, 44]);

      twgl.setUniforms(programInfo, {
        'lights[0].extra': [
          { v4: [1, 2, 3, 4], },
        ],
        'lights[1].intensity': 100,
      });
      gl.drawArrays(gl.POINTS, 0, 1);
      checkColor(gl, [111, 122, 133, 104]);

      /*
      TWGL does not currently support
      setting random elements of leaf
      arrays

      twgl.setUniforms(programInfo, {
        'lights[0].nearFar[1]': 1000,
      });
      checkColor(gl, [111, 1022, 133, 104]);
      */

    });

    itWebGL2('test uniformblock struct/array', () => {
      const {gl} = createContext2();

      const vs = `#version 300 es
      struct Extra {
        float f;
        vec4 v4;
        vec3 v3;
      };
      struct Light {
        float intensity;
        vec4 color;
        float nearFar[2];
        Extra extra[2];
      };
      uniform Lights {
        Light lights[2];
      };
      out vec4 v_out;

      vec4 getLight(Light l) {
        return
            vec4(l.intensity) +
            vec4(l.color) +
            vec4(l.nearFar[0], l.nearFar[1], 0, 0) +
            vec4(l.extra[0].f) +
            vec4(l.extra[0].v4) +
            vec4(l.extra[0].v3, 0) +
            vec4(l.extra[1].f) +
            vec4(l.extra[1].v4) +
            vec4(l.extra[1].v3, 0);
      }
      void main() {
        gl_Position = vec4(0, 0, 0, 1);
        gl_PointSize = 1.0;
        v_out = getLight(lights[0]) + getLight(lights[1]);
      }
      `;

      const fs = `#version 300 es
      precision mediump float;
      in vec4 v_out;
      out vec4 outColor;
      void main() {
        outColor = v_out / 255.0;
      }
      `;

      const programInfo = twgl.createProgramInfo(gl, [vs, fs]);
      const uboInfo = twgl.createUniformBlockInfo(gl, programInfo, "Lights");

      twgl.setBlockUniforms(uboInfo, {
        lights: [
          { intensity: 11, color: [12, 13, 14, 15], nearFar: [16, 17], extra: [
              { f: 18, v4: [110, 111, 112, 113], v3: [114, 115, 116]},
              { f: 19, v4: [117, 118, 119, 120], v3: [121, 122, 123]},
            ],
          },
          { intensity: 21, color: [22, 23, 24, 25], nearFar: [26, 27], extra: [
              { f: 28, v4: [210, 211, 212, 213], v3: [214, 215, 216]},
              { f: 29, v4: [217, 218, 219, 220], v3: [221, 222, 223]},
            ],
          },
        ],
      });

      const expected = new Float32Array([
                            // lights[0]
        11,                 //   intensity
        0, 0, 0,            //   padding
        12, 13, 14, 15,     //   color
        16, 0, 0, 0,        //   nearFar[0] + padding
        17, 0, 0, 0,        //   nearFar[1] + padding
                            //   extra[0]
        18,                 //     f
        0, 0, 0,            //     padding
        110, 111, 112, 113, //     v4
        114, 115, 116,      //     v3
        0,                  //     padding
                            //   extra[1]
        19,                 //     f
        0, 0, 0,            //     padding
        117, 118, 119, 120, //     v4
        121, 122, 123,      //     v3
        0,                  //     padding
                            // lights[1]
        21,                 //   intensity
        0, 0, 0,            //   padding
        22, 23, 24, 25,     //   color
        26, 0, 0, 0,        //   nearFar[0] + padding
        27, 0, 0, 0,        //   nearFar[1] + padding
                            //   extra[0]
        28,                 //     f
        0, 0, 0,            //     padding
        210, 211, 212, 213, //     v4
        214, 215, 216,      //     v3
        0,                  //     padding
                            //   extra[1]
        29,                 //     f
        0, 0, 0,            //     padding
        217, 218, 219, 220, //     v4
        221, 222, 223,      //     v3
        0,                  //     padding
      ]);
      assertArrayEqual(uboInfo.asFloat, expected);

      twgl.setBlockUniforms(uboInfo, {
        'lights[1].extra[1]': { v4: [301, 302, 303, 304] },
      });
      expected.set([301, 302, 303, 304], expected.indexOf(217));
      assertArrayEqual(uboInfo.asFloat, expected);
    });

  });

  describe('createProgramFromScripts', () => {

    beforeEach(() => {
       document.querySelectorAll('script[type=foo]').forEach(elem => elem.remove());
    });

    afterEach(() => {
       document.querySelectorAll('script[type=foo]').forEach(elem => elem.remove());
    });

    let nextId = 0;
    function addShaderScripts(shaders) {
      return shaders.map(shader => {
        const id = `foobar${nextId++}`;
        const elem = document.createElement('script');
        elem.type = 'foo';
        elem.text = shader;
        elem.id = id;
        document.documentElement.appendChild(elem);
        return id;
      });
    }

    itWebGL('succeeds with good shaders', () => {
      const {gl} = createContext();
      const msgCapturer = new MsgCapturer();
      const program = twgl.createProgramFromScripts(gl, addShaderScripts([
        'void main() { gl_Position = vec4(0); }',
        'precision mediump float; void main() { gl_FragColor = vec4(0); }',
      ]), {
        errorCallback: msgCapturer.cb,
      });
      assertTruthy(program instanceof WebGLProgram);
      assertFalsy(msgCapturer.hasMsgs());
    });

    itWebGL('fails with bad shader', () => {
      const {gl} = createContext();
      const msgCapturer = new MsgCapturer();
      const program = twgl.createProgramFromScripts(gl, addShaderScripts([
        'void main() { gl_Position = vec4(0); }',
        'bad code',
      ]), {
        errorCallback: msgCapturer.cb,
      });
      assertFalsy(program);
      assertTruthy(msgCapturer.hasMsgs());
    });

    itWebGL('fails with too few shaders', () => {
      const {gl} = createContext();
      const msgCapturer = new MsgCapturer();
      const program = twgl.createProgramFromScripts(gl, addShaderScripts([
        'void main() { gl_Position = vec4(0); }',
      ]), {
        errorCallback: msgCapturer.cb,
      });
      assertFalsy(program);
      assertTruthy(msgCapturer.hasMsgs());
    });

    itWebGL('compiles program async with callback', async function() {
      const {gl} = createContext();
      const program = await fnWithCallbackToPromise(twgl.createProgramFromScripts)(gl, addShaderScripts([
        `void main() { gl_Position = vec4(0); }`,
        `precision mediump float; void main() { gl_FragColor = vec4(0); }`,
      ]), {
        callback(err, program) {
          assertFalsy(err);
          assertTruthy(program instanceof WebGLProgram);
          assertTruthy(gl.getProgramParameter(program, gl.LINK_STATUS));
          gl.useProgram(program);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
          assertEqual(gl.getError(), gl.NONE);
        },
      });
      assertFalsy(program);  // nothing is returned if callback
    });

    itWebGL('compiles program async with callback with error', async function() {
      const {gl} = createContext();
      const msgs = [];
      const program = await fnWithCallbackToPromise(twgl.createProgramFromScripts)(gl, addShaderScripts([
        `void main() { gl_Position = vec4(0); }`,
        `precision mediump float; void main() { gl_Frag Color = vec4(0); }`,
      ]), {
        errorCallback(msg) {
          msgs.push(msg);
        },
        callback(err, program) {
          assertTruthy(err);
          assertFalsy(program);
          assertTruthy(msgs.length > 0);
        },
      });
      assertFalsy(program);  // nothing is returned if callback
    });

    itWebGL('compiles program async with callback with bad ids', async function() {
      const {gl} = createContext();
      const msgs = [];
      const program = await fnWithCallbackToPromise(twgl.createProgramFromScripts)(gl, addShaderScripts([
        `idThatDoesNotExist`,
      ]), {
        errorCallback(msg) {
          msgs.push(msg);
        },
        callback(err, program) {
          assertTruthy(err);
          assertFalsy(program);
          assertTruthy(msgs.length > 0);
        },
      });
      assertFalsy(program);  // nothing is returned if callback
    });

  });

  describe('createProgramFromSources', () => {

    itWebGL('succeeds with good shaders', () => {
      const {gl} = createContext();
      const msgCapturer = new MsgCapturer();
      const program = twgl.createProgramFromSources(gl, [
        'void main() { gl_Position = vec4(0); }',
        'precision mediump float; void main() { gl_FragColor = vec4(0); }',
      ], {
        errorCallback: msgCapturer.cb,
      });
      assertTruthy(program instanceof WebGLProgram);
      assertFalsy(msgCapturer.hasMsgs());
    });

    itWebGL('fails with bad shader', () => {
      const {gl} = createContext();
      const msgCapturer = new MsgCapturer();
      const program = twgl.createProgramFromSources(gl, [
        'void main() { gl_Position = vec4(0); }',
        'bad code',
      ], {
        errorCallback: msgCapturer.cb,
      });
      assertFalsy(program);
      assertTruthy(msgCapturer.hasMsgs());
    });

    itWebGL('fails with too few shaders', () => {
      const {gl} = createContext();
      const msgCapturer = new MsgCapturer();
      const program = twgl.createProgramFromSources(gl, [
        'void main() { gl_Position = vec4(0); }',
      ], {
        errorCallback: msgCapturer.cb,
      });
      assertFalsy(program);
      assertTruthy(msgCapturer.hasMsgs());
    });

    itWebGL('compiles program async with callback', async function() {
      const {gl} = createContext();
      const program = await fnWithCallbackToPromise(twgl.createProgramFromSources)(gl, [
        `void main() { gl_Position = vec4(0); }`,
        `precision mediump float; void main() { gl_FragColor = vec4(0); }`,
      ], {
        callback(err, program) {
          assertFalsy(err);
          assertTruthy(program instanceof WebGLProgram);
          assertTruthy(gl.getProgramParameter(program, gl.LINK_STATUS));
          gl.useProgram(program);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
          assertEqual(gl.getError(), gl.NONE);
        },
      });
      assertFalsy(program);  // nothing is returned if callback
    });

    itWebGL('compiles program async with callback with error', async function() {
      const {gl} = createContext();
      const msgs = [];
      const program = await fnWithCallbackToPromise(twgl.createProgramFromSources)(gl, [
        `void main() { gl_Position = vec4(0); }`,
        `precision mediump float; void main() { gl_Frag Color = vec4(0); }`,
      ], {
        errorCallback(msg) {
          msgs.push(msg);
        },
        callback(err, program) {
          assertTruthy(err);
          assertFalsy(program);
          assertTruthy(msgs.length > 0);
        },
      });
      assertFalsy(program);  // nothing is returned if callback
    });

  });

  describe('createProgramInfosAsync', () => {

    itWebGL('createProgramInfosAsync', async() => {
      const {gl} = createContext();
      const msgCapturer = new MsgCapturer();
      const programInfos = await twgl.createProgramInfosAsync(gl, {
        foo: [
          'void main() { gl_Position = vec4(0); }',
          'precision mediump float; void main() { gl_FragColor = vec4(0); }',
        ],
        bar: [
          'void main() { gl_Position = vec4(0); }',
          'precision mediump float; void main() { gl_FragColor = vec4(0); }',
        ],
      }, {
        errorCallback: msgCapturer.cb,
      });
      assertTruthy(programInfos.foo.program instanceof WebGLProgram);
      assertTruthy(programInfos.bar.program instanceof WebGLProgram);
      assertFalsy(msgCapturer.hasMsgs());
    });

    itWebGL('createProgramInfosAsync throws with bad shaders', async() => {
      const {gl} = createContext();
      const msgCapturer = new MsgCapturer();
      let err;
      try {
        await twgl.createProgramInfosAsync(gl, {
          foo: [
            'void main() { gl_Position = vec4(0); }',
            'precision mediump float; void main() { gl_FragColor = vec4(0); }',
          ],
          bar: [
            'void main() { gl_Position = vec4(0); }',
            'bad',
          ],
        }, {
          errorCallback: msgCapturer.cb,
        });
      } catch (e) {
        err = e;
      }
      assertTruthy(err);
      assertTruthy(msgCapturer.hasMsgs());
    });

  });

  describe('setUniforms', () => {

    function testBindingNullToTexture(gl) {
      const programInfo = twgl.createProgramInfo(gl, [
        `void main() {
          gl_Position = vec4(0);
        }
        `,
        `
        precision mediump float;
        uniform sampler2D tex;
        uniform sampler2D texArr[1];
        void main() {
          texArr[0];
          gl_FragColor = texture2D(tex, vec2(0));
        }
        `,
      ]);
      gl.useProgram(programInfo.program);
      twgl.setUniforms(programInfo, {
        tex: null,
        texArr: [null],
      });
      assertNoWebGLError(gl);
    }

    itWebGL(`WebGL: lets you bind a null texture`, () => {
      const {gl} = createContext();
      testBindingNullToTexture(gl);
    });

    itWebGL2(`WebGL2: lets you bind a null texture`, () => {
      const {gl} = createContext2();
      testBindingNullToTexture(gl);
    });

  });

});