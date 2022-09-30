import * as helper from '../../src/helper.js';

import {
  // assertArrayEqual,
  assertTruthy,
  assertFalsy,
} from '../assert.js';
import {describe} from '../mocha-support.js';
import {
  createContext2,
  itWebGL2,
  assertNoWebGLError,
} from '../webgl.js';

// Note: these are not public functions but it seems useful to test them
describe('helper tests', () => {

  function createResources(gl) {
    return {
      buffer: gl.createBuffer(),
      framebuffer: gl.createFramebuffer(),
      renderbuffer: gl.createRenderbuffer(),
      program: gl.createProgram(),
      shader: gl.createShader(gl.VERTEX_SHADER),
      sampler: gl.createSampler(),
      texture: gl.createTexture(),
      vertexArray: gl.createVertexArray(),
    };
  }

  for (const type of [
    'buffer',
    'renderbuffer',
    'shader',
    'texture',
    'sampler',
  ]) {
    const capitalizedType = `${type[0].toUpperCase()}${type.substring(1)}`;

    itWebGL2(`test is${capitalizedType}`, () => {
      const {gl} = createContext2();
      const resources = createResources(gl);
      const testFn = helper[`is${capitalizedType}`];
      for (const [resourceType, resource] of Object.entries(resources)) {
        if (type === resourceType) {
          assertTruthy(testFn(gl, resource));
        } else {
          assertFalsy(testFn(gl, resource));
        }
        assertFalsy(testFn(gl, gl.TEXTURE_2D));
      }

      assertNoWebGLError(gl);
    });
  }
});
