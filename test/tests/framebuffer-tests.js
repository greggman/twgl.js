import {
  // assertArrayEqual,
  // assertTruthy,
  // assertFalsy,
  assertEqual,
} from '../assert.js';
import {describe} from '../mocha-support.js';
import {
  renderableTextureFormats,
  multisampleTextureFormats,
  depthTextureFormats,
  depthStencilTextureFormats,
} from '../src/js/texture-formats.js';
import {
  itWebGL2,
  createContext2,
} from '../webgl.js';


describe('framebuffer tests', () => {

  renderableTextureFormats.map(name => {
    itWebGL2(`test createFramebuffer ${name}`, () => {
      const {gl} = createContext2();
      const spec = [
        { internalFormat: gl[name], minMag: gl.NEAREST },
      ];
      const fbi = twgl.createFramebufferInfo(gl, spec);
      twgl.bindFramebufferInfo(gl, fbi);
      assertEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE);
      twgl.resizeFramebufferInfo(gl, fbi, spec, 32, 16);
    });
  });

  multisampleTextureFormats.map(name => {
    itWebGL2(`test createFramebuffer ${name} multisample`, () => {
      const {gl} = createContext2();
      const spec = [
        { format: gl[name], samples: 4 },
      ];
      const fbi = twgl.createFramebufferInfo(gl, spec);
      twgl.bindFramebufferInfo(gl, fbi);
      assertEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE);
      twgl.resizeFramebufferInfo(gl, fbi, spec, 32, 16);
    });
  });

  [
    ...depthTextureFormats,
    ...depthStencilTextureFormats,
  ].map(name => {
    itWebGL2(`test createFramebuffer ${name}`, () => {
      const {gl} = createContext2();
      const spec = [
        { internalFormat: gl.RGBA8, },
        { internalFormat: gl[name], },
      ];
      const fbi = twgl.createFramebufferInfo(gl, spec);
      twgl.bindFramebufferInfo(gl, fbi);
      assertEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE);
      twgl.resizeFramebufferInfo(gl, fbi, spec, 32, 16);
    });
  });

  [
    ...depthTextureFormats,
    ...depthStencilTextureFormats,
  ].map(name => {
    itWebGL2(`test createFramebuffer ${name} multisample`, () => {
      const {gl} = createContext2();
      const spec = [
        { format: gl.RGBA8, samples: 4 },
        { format: gl[name], samples: 4 },
      ];
      const fbi = twgl.createFramebufferInfo(gl, spec);
      twgl.bindFramebufferInfo(gl, fbi);
      assertEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE);
      twgl.resizeFramebufferInfo(gl, fbi, spec, 32, 16);
    });
  });

});