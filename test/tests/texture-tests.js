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
  itWebGL,
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

});