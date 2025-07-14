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
  checkColor,
  setCanvasAndViewportSizeTo1x1
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

function create1PixelTextureRenderingProgram(gl) {
  const vs = `#version 300 es
    void main() {
      gl_Position = vec4(0, 0, 0, 1);
      gl_PointSize = 1.0;
    }
  `;

  const fs = `#version 300 es
    precision highp float;
    uniform sampler2D u_texture;
    out vec4 fragColor;
    void main() {
      fragColor = texture(u_texture, vec2(0.5));
    }
 `;
  return twgl.createProgram(gl, [vs, fs]);
}

function create1PixelLodSelectingRenderingProgram(gl) {
  const vs = `#version 300 es
    void main() {
      gl_Position = vec4(0, 0, 0, 1);
      gl_PointSize = 1.0;
    }
  `;

  const fs = `#version 300 es
    precision highp float;
    uniform sampler2D u_texture;
    uniform float u_lod;
    out vec4 fragColor;
    void main() {
      fragColor = textureLod(u_texture, vec2(0.5), u_lod);
    }
  `;
  const prgInfo = twgl.createProgramInfo(gl, [vs, fs]);
  return (gl, lod) => {
    gl.useProgram(prgInfo.program);
    twgl.setUniforms(prgInfo, { u_lod: lod });
    gl.drawArrays(gl.POINTS, 0, 1);
    return prgInfo;
  };
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

  itWebGL2('test uploads multiple mip levels', () => {
    const {gl} = createContext2();
    setCanvasAndViewportSizeTo1x1(gl);

    const r = [255,   0,   0, 255];
    const y = [255, 255,   0, 255];
    const g = [  0, 255,   0, 255];
    const b = [  0,   0, 255, 255];

    const data = new Uint8Array([
      y, y, y, y, y, y, y, y, y, y,
      y, y, y, y, y, y, y, y, y, y,
      y, y, y, y, y, y, y, y, y, y,
      y, y, y, y, y, y, y, y, y, y,
      y, y, y, y, y, y, y, y, y, y,
      y, y, y, y, y, y, y, y, y, y,
      y, y, y, y, y, y, y, y, y, y,
      r, r, r, r, r,
      r, r, r, r, r,
      r, r, r, r, r,
      g, g,
      b,
    ].flat());

    const texture = twgl.createTexture(gl, { width: 10, height: 7, src: data });
    assertNoWebGLError(gl);

    const drawFn = create1PixelLodSelectingRenderingProgram(gl);
    const tests = [
      { lod: 0, expected: y },
      { lod: 1, expected: r },
      { lod: 2, expected: g },
      { lod: 3, expected: b },
    ];
    tests.forEach(({lod, expected}, i) => {
      drawFn(gl, lod);
      checkColor(gl, expected, `mipLevel: ${i}`);
    });

    assertNoWebGLError(gl);

    gl.deleteTexture(texture);
  });

  itWebGL2(`test compressed texture format EXT_texture_compression_bptc`, ['EXT_texture_compression_bptc'], async() => {
    const {gl} = createContext2();
    twgl.addExtensionsToContext(gl);
    setCanvasAndViewportSizeTo1x1(gl);

    const green = [2, 255, 2, 255];
    const internalFormat = gl.COMPRESSED_RGBA_BPTC_UNORM;
    const green_4x4 = new Uint8Array([32, 128, 193, 255, 15, 24, 252, 255, 175, 170, 170, 170, 0, 0, 0, 0]);
    const width = 4;
    const height = 4;

    // eslint-disable-next-line no-unused-vars
    const texture = twgl.createTexture(gl, { src: green_4x4, width, height, internalFormat });
    assertNoWebGLError(gl);

    const prg = create1PixelTextureRenderingProgram(gl);
    gl.useProgram(prg);
    gl.drawArrays(gl.POINTS, 0, 1);
    checkColor(gl, green);

    gl.deleteTexture(texture);
  });

  itWebGL2(`test compressed texture format WEBGL_compressed_texture_s3tc`, ['WEBGL_compressed_texture_s3tc'], async() => {
    const {gl} = createContext2();
    twgl.addExtensionsToContext(gl);
    setCanvasAndViewportSizeTo1x1(gl);

    const red = [255, 0, 0, 255];
    const internalFormat = gl.COMPRESSED_RGB_S3TC_DXT1_EXT;
    const red_4x4 = new Uint16Array([
      0b11111_000000_00000,
      0b11111_000000_00000,
      0, 0,
    ]);
    const width = 4;
    const height = 4;

    const texture = twgl.createTexture(gl, { src: red_4x4, width, height, internalFormat });
    assertNoWebGLError(gl);

    const prg = create1PixelTextureRenderingProgram(gl);
    gl.useProgram(prg);
    gl.drawArrays(gl.POINTS, 0, 1);
    checkColor(gl, red);

    assertNoWebGLError(gl);

    gl.deleteTexture(texture);
  });

  itWebGL2(`test compressed texture format WEBGL_compressed_texture_s3tc with mips`, ['WEBGL_compressed_texture_s3tc'], async() => {
    const {gl} = createContext2();
    twgl.addExtensionsToContext(gl);
    setCanvasAndViewportSizeTo1x1(gl);

    const internalFormat = gl.COMPRESSED_RGB_S3TC_DXT1_EXT;
    const red_4x4 = [
      0b11111_000000_00000,
      0b11111_000000_00000,
      0, 0,
    ];
    const yellow_4x4 = [
      0b11111_111111_00000,
      0b11111_111111_00000,
      0, 0,
    ];
    const green_4x4 = [
      0b00000_111111_00000,
      0b00000_111111_00000,
      0, 0,
    ];
    const blue_4x4 = [
      0b00000_000000_11111,
      0b00000_000000_11111,
      0, 0,
    ];
    const data = new Uint16Array([
      ...red_4x4, ...red_4x4, ...red_4x4, // 12x8
      ...red_4x4, ...red_4x4, ...red_4x4,
      ...green_4x4, ...green_4x4, // 6x4
      ...blue_4x4, // 3x2
      ...yellow_4x4, // 1x1
    ]);

    const width = 12;
    const height = 8;

    const r = [255,   0,   0, 255];
    const y = [255, 255,   0, 255];
    const g = [  0, 255,   0, 255];
    const b = [  0,   0, 255, 255];

    const texture = twgl.createTexture(gl, { src: data, width, height, internalFormat });
    assertNoWebGLError(gl);
    const drawFn = create1PixelLodSelectingRenderingProgram(gl);
    const tests = [
      { lod: 0, expected: r },
      { lod: 1, expected: g },
      { lod: 2, expected: b },
      { lod: 3, expected: y },
    ];
    tests.forEach(({lod, expected}, i) => {
      drawFn(gl, lod);
      checkColor(gl, expected, `mipLevel: ${i}`);
    });

    assertNoWebGLError(gl);

    gl.deleteTexture(texture);
  });

  itWebGL2(`test compressed texture format WEBGL_compressed_texture_s3tc cubemap`, ['WEBGL_compressed_texture_s3tc'], async() => {
    const {gl} = createContext2();
    twgl.addExtensionsToContext(gl);
    setCanvasAndViewportSizeTo1x1(gl);

    const internalFormat = gl.COMPRESSED_RGB_S3TC_DXT1_EXT;
    const red565 = 0b11111_000000_00000;
    const yellow565 = 0b11111_111111_00000;
    const green565 = 0b0000_111111_00000;
    const cyan565 = 0b0000_111111_11111;
    const blue565 = 0b00000_000000_11111;
    const magenta565 = 0b11111_000000_11111;
    const cubeMapData = new Uint16Array([
       ...[red565, red565, 0, 0],
       ...[yellow565, yellow565, 0, 0],
       ...[green565, green565, 0, 0],
       ...[cyan565, cyan565, 0, 0],
       ...[blue565, blue565, 0, 0],
       ...[magenta565, magenta565, 0, 0],
    ]);
    const width = 4;
    const height = 4;

    const texture = twgl.createTexture(gl, { target: gl.TEXTURE_CUBE_MAP, src: cubeMapData, width, height, internalFormat });
    assertNoWebGLError(gl);

    const vs = `#version 300 es
      void main() {
        gl_Position = vec4(0, 0, 0, 1);
        gl_PointSize = 1.0;
      }
    `;

    const fs = `#version 300 es
      precision highp float;
      uniform samplerCube u_texture;
      uniform vec3 u_dir;
      out vec4 fragColor;
      void main() {
        fragColor = texture(u_texture, u_dir);
      }
    `;
    const prgInfo = twgl.createProgramInfo(gl, [vs, fs]);
    gl.useProgram(prgInfo.program);
    const tests = [
      { u_dir: [ 1,  0,  0], expected: [255,   0,   0, 255] },
      { u_dir: [-1,  0,  0], expected: [255, 255,   0, 255] },
      { u_dir: [ 0,  1,  0], expected: [  0, 255,   0, 255] },
      { u_dir: [ 0, -1,  0], expected: [  0, 255, 255, 255] },
      { u_dir: [ 0,  0,  1], expected: [  0,   0, 255, 255] },
      { u_dir: [ 0,  0, -1], expected: [255,   0, 255, 255] },
    ];
    for (const {u_dir, expected} of tests) {
      twgl.setUniforms(prgInfo, { u_dir });
      gl.drawArrays(gl.POINTS, 0, 1);
      checkColor(gl, expected);
    }

    assertNoWebGLError(gl);

    gl.deleteTexture(texture);
  });

});