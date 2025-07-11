import {
  // assertArrayEqual,
  // assertTruthy,
  // assertFalsy,
  assertEqual,
} from '../assert.js';
import {describe} from '../mocha-support.js';
import {
  assertNoWebGLError,
  createContext,
  createContext2,
  itWebGL,
  itWebGL2,
  checkColor
} from '../webgl.js';

function assertPixelFromTexture(gl, texture, expected) {
  twgl.createFramebufferInfo(gl, [ { attachment: texture } ], 1, 2);
  const actual = new Uint8Array(4);
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, actual);
  assertEqual(actual, expected);
}

function createRedGreenURL() {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.width = 1;
  ctx.canvas.height = 2;
  ctx.fillStyle = '#F00';
  ctx.fillRect(0, 0, 1, 1);
  ctx.fillStyle = '#0F0';
  ctx.fillRect(0, 1, 1, 1);
  return ctx.canvas.toDataURL();
}

describe('texture tests', () => {

  itWebGL(`test y flips correctly`, async() => {
    const {gl} = createContext();
    const red = [255, 0, 0, 255];
    const green = [0, 255, 0, 255];
    const src = [...red, ...green];

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    const t1gr = twgl.createTexture(gl, { src, width: 1 });
    const t2rg = twgl.createTexture(gl, { src, width: 1, flipY: false });
    const t3gr = twgl.createTexture(gl, { src, width: 1 });

    assertPixelFromTexture(gl, t1gr, green);
    assertPixelFromTexture(gl, t2rg, red);
    assertPixelFromTexture(gl, t3gr, green);

    // Test that the state is saved when async.
    const p = twgl.createTextureAsync(gl, { src: createRedGreenURL() });
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    const { texture: t4gr } = await p;
    assertPixelFromTexture(gl, t4gr, green);

    assertNoWebGLError(gl);
  });

  itWebGL(`test pre-multiplies alpha correctly`, () => {
    const {gl} = createContext();
    const src = [255, 0, 0, 128];
    const premultiplied = [128, 0, 0, 128];

    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    const t1gr = twgl.createTexture(gl, { src });
    const t2rg = twgl.createTexture(gl, { src, premultiplyAlpha: false });
    const t3gr = twgl.createTexture(gl, { src });

    assertPixelFromTexture(gl, t1gr, premultiplied);
    assertPixelFromTexture(gl, t2rg, src);
    assertPixelFromTexture(gl, t3gr, premultiplied);

    assertNoWebGLError(gl);
  });

  itWebGL2(`test compressed texture format`, async() => {
    const {gl} = createContext2();
    const vs = `#version 300 es
                in vec2 position;
                in vec2 texcoord;
                out vec2 v_texcoord;
                void main() {
                gl_Position = vec4(position, 0, 1);
                v_texcoord = texcoord;
                }`;

    const fs = `#version 300 es
                  precision mediump float;
                  in vec2 v_texcoord;
                  uniform sampler2D u_texture;
                  out vec4 fragColor;
                  void main() {
                      fragColor = texture(u_texture, v_texcoord);
                  }
              `;
    const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

    const arrays = {
        position: [1, 1, 0.0, 1, -1, 0.0, -1, -1, 0.0, -1, 1, 0.0],
        texcoord: [1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0],
        indices: [0, 1, 3, 1, 2, 3],
    };

    const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
    twgl.addExtensionsToContext(gl);
    const green = [2, 255, 2, 255];
    // KTX2:BASIS_FORMAT.cTFBC7
    const green_4x4 = new Uint8Array([32, 128, 193, 255, 15, 24, 252, 255, 175, 170, 170, 170, 0, 0, 0, 0]);
    const width = 4;
    const height = 4;
    let internalFormat = 0x8E8C; //COMPRESSED_RGBA_BPTC_UNORM
    gl.canvas.width = width;
    gl.canvas.height = height;
    let texture = twgl.createTexture(gl, { src: green_4x4, width, height, internalFormat, compressed: true });
    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, { u_texture: texture });
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES);
    checkColor(gl, green);

    const red = [255, 0, 0, 255];
    // DDS:COMPRESSED_RGB_S3TC_DXT1_EXT
    const red_4x4 = new Uint8Array([0, 248, 0, 248, 0, 0, 0, 0, 0, 248, 0, 248, 0, 0, 0, 0, 0, 248, 0, 248, 0, 0, 0, 0]);
    internalFormat = 0x83F0; //COMPRESSED_RGB_S3TC_DXT1_EXT
    texture = twgl.createTexture(gl, { src: red_4x4, width, height, internalFormat, compressed: true, level:3 });
    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, { u_texture: texture });
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES);
    checkColor(gl, red);

    assertNoWebGLError(gl);
  });

});