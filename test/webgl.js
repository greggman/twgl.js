import {it} from './mocha-support.js';
import {assertArrayEqual} from './assert.js';

export function createContext() {
  const gl = document.createElement('canvas').getContext('webgl');
  return { gl };
}

export function createContext2() {
  const gl = document.createElement('canvas').getContext('webgl2');
  return { gl };
}

function resetContext(gl) {
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
  gl.useProgram(null);
}

export function resetContexts(context) {
  const { gl, gl2, vaoExt } = context;
  if (vaoExt) {
    vaoExt.bindVertexArrayOES(null);
  }
  resetContext(gl);

  if (gl2) {
    gl2.bindVertexArray(null);
    resetContext(gl2);
  }
}

export function checkColor(gl, color) {
  const p = new Uint8Array(4);
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, p);
  assertArrayEqual(p, color);
}

export function escapeRE(str) {
    return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export function not(str) {
  return new RegExp(`^((?!${escapeRE(str)}).)*$`);
}

function makeItWrapperThatChecksContextAndExtensions(contextType) {
  const gl = document.createElement('canvas').getContext(contextType);
  const haveContext = !!gl;
  const supportedExtensions = new Set(gl ? gl.getSupportedExtensions() : []);

  return function(msg, extensions, fn) {
    if (!fn) {
      fn = extensions;
      extensions = [];
    }

    let skippedMsg;
    if (!haveContext) {
      skippedMsg = `no support for ${contextType}`;
    } else {
      for (const extension of extensions) {
        if (!supportedExtensions.has(extension)) {
          skippedMsg = `no support for ${extension}`;
          break;
        }
      }
    }

    if (skippedMsg) {
      it(`${skippedMsg}: '${msg}' skipped`, () => true);
    } else {
      it(msg, fn);
    }
  };
}

/**
 * `it` that checks for WebGL support and prints "test skipped" if no support exists
 *
 * note: it's assumed if we could get a context once then we can get them
 * forever. In other words if we stop getting them then tests should fail.
 * Similarly the list of supported extensions should not change so in your
 * tests you can write
 *
 * ```
 * itWebGL('test OES_vertex_arrays', ['OES_vertex_arrays'], () => {
 *    const gl = document.createElement('canvas').getContext('webgl');
 *    assert(gl);
 *    const ext = gl.getExtension('OES_vertex_arrays');
 *    assert(ext);
 * });
 * ```
 * You probably don't need to `assert(gl)` and `assert(ext)` as your test
 * will fail if they're null/undefined. The point is you should write
 * the test as though success on the context and the extensions are
 * guaranteed to exist.
 *
 * @function
 * @param {string} msg test description
 * @param {string[]} [extensions] optional array of extension strings to check for
 * @param {function} fn the test function
 */
export const itWebGL = makeItWrapperThatChecksContextAndExtensions('webgl');

/**
 * `it` that checks for WebGL support and prints "test skipped" if no support exists
 *
 * note: it's assumed if we could get a context once then we can get them
 * forever. In other words if we stop getting them then tests should fail.
 * Similarly the list of supported extensions should not change so in your
 * tests you can write
 *
 * ```
 * itWebGL2('test OES_texture_float_linear', ['OES_texture_float_linear'], () => {
 *    const gl = document.createElement('canvas').getContext('webgl');
 *    assert(gl);
 *    const ext = gl.getExtension('OES_texture_float_linear');
 *    assert(ext);
 * });
 * ```
 * You probably don't need to `assert(gl)` and `assert(ext)` as your test
 * will fail if they're null/undefined. The point is you should write
 * the test as though success on the context and the extensions are
 * guaranteed to exist.
 *
 * @function
 * @param {string} msg test description
 * @param {string[]} [extensions] optional array of extension strings to check for
 * @param {function} fn the test function
 */
export const itWebGL2 = makeItWrapperThatChecksContextAndExtensions('webgl2');
