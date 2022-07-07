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
  assertNoWebGLError,
  createContext2,
  createContext,
  itWebGL,
  itWebGL2,
} from '../webgl.js';


describe('framebuffer tests', () => {

  renderableTextureFormats.map(name => {
    itWebGL2(`test createFramebufferInfo ${name}`, () => {
      const {gl} = createContext2();
      const spec = [
        { internalFormat: gl[name], minMag: gl.NEAREST },
      ];
      const fbi = twgl.createFramebufferInfo(gl, spec);
      twgl.bindFramebufferInfo(gl, fbi);
      assertEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE);
      twgl.resizeFramebufferInfo(gl, fbi, spec, 32, 16);
      assertEqual(gl.getParameter(gl.DRAW_BUFFER0), gl.COLOR_ATTACHMENT0);
      assertEqual(gl.getParameter(gl.DRAW_BUFFER1), gl.NONE);
      assertNoWebGLError(gl);
    });
  });

  multisampleTextureFormats.map(name => {
    itWebGL2(`test createFramebufferInfo ${name} multisample`, () => {
      const {gl} = createContext2();
      const spec = [
        { format: gl[name], samples: 4 },
      ];
      const fbi = twgl.createFramebufferInfo(gl, spec);
      twgl.bindFramebufferInfo(gl, fbi);
      assertEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE);
      twgl.resizeFramebufferInfo(gl, fbi, spec, 32, 16);
      assertEqual(gl.getParameter(gl.DRAW_BUFFER0), gl.COLOR_ATTACHMENT0);
      assertEqual(gl.getParameter(gl.DRAW_BUFFER1), gl.NONE);
      assertNoWebGLError(gl);
    });
  });

  [
    ...depthTextureFormats,
    ...depthStencilTextureFormats,
  ].map(name => {
    itWebGL2(`test createFramebufferInfo ${name}`, () => {
      const {gl} = createContext2();
      const spec = [
        { internalFormat: gl.RGBA8, },
        { internalFormat: gl[name], },
      ];
      const fbi = twgl.createFramebufferInfo(gl, spec);
      twgl.bindFramebufferInfo(gl, fbi);
      assertEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE);
      twgl.resizeFramebufferInfo(gl, fbi, spec, 32, 16);
      assertEqual(gl.getParameter(gl.DRAW_BUFFER0), gl.COLOR_ATTACHMENT0);
      assertEqual(gl.getParameter(gl.DRAW_BUFFER1), gl.NONE);
      assertNoWebGLError(gl);
    });
  });

  [
    ...depthTextureFormats,
    ...depthStencilTextureFormats,
  ].map(name => {
    itWebGL2(`test createFramebufferInfo ${name} multisample`, () => {
      const {gl} = createContext2();
      const spec = [
        { format: gl.RGBA8, samples: 4 },
        { format: gl[name], samples: 4 },
      ];
      const fbi = twgl.createFramebufferInfo(gl, spec);
      twgl.bindFramebufferInfo(gl, fbi);
      assertEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE);
      twgl.resizeFramebufferInfo(gl, fbi, spec, 32, 16);
      assertEqual(gl.getParameter(gl.DRAW_BUFFER0), gl.COLOR_ATTACHMENT0);
      assertEqual(gl.getParameter(gl.DRAW_BUFFER1), gl.NONE);
      assertNoWebGLError(gl);
    });
  });

  itWebGL2(`test WebGL createFramebufferInfo`, () => {
    const {gl} = createContext2();
    const spec = [
      { format: gl.RGBA },
    ];
    const fbi = twgl.createFramebufferInfo(gl, spec);
    twgl.bindFramebufferInfo(gl, fbi);
    assertEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE);
    twgl.resizeFramebufferInfo(gl, fbi, spec, 32, 16);
    assertNoWebGLError(gl);
  });

  itWebGL(`test WebGL createFramebufferInfo sets drawBuffers with extensions added`, () => {
    const {gl} = createContext();
    twgl.addExtensionsToContext(gl);
    const spec = [
      { format: gl.RGBA },
      { format: gl.RGBA },
      { format: gl.RGBA },
    ];
    const fbi = twgl.createFramebufferInfo(gl, spec);
    twgl.bindFramebufferInfo(gl, fbi);
    assertEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE);
    assertEqual(gl.getParameter(gl.DRAW_BUFFER0), gl.COLOR_ATTACHMENT0);
    assertEqual(gl.getParameter(gl.DRAW_BUFFER1), gl.COLOR_ATTACHMENT1);
    assertEqual(gl.getParameter(gl.DRAW_BUFFER2), gl.COLOR_ATTACHMENT2);
    assertEqual(gl.getParameter(gl.DRAW_BUFFER3), gl.NONE);
    assertNoWebGLError(gl);
  });

  itWebGL2(`test WebGL2 createFramebufferInfo sets drawBuffers`, () => {
    const {gl} = createContext2();
    const spec = [
      { format: gl.RGBA },
      { format: gl.RGBA },
      { format: gl.RGBA },
    ];
    const fbi = twgl.createFramebufferInfo(gl, spec);
    twgl.bindFramebufferInfo(gl, fbi);
    assertEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE);
    assertEqual(gl.getParameter(gl.DRAW_BUFFER0), gl.COLOR_ATTACHMENT0);
    assertEqual(gl.getParameter(gl.DRAW_BUFFER1), gl.COLOR_ATTACHMENT1);
    assertEqual(gl.getParameter(gl.DRAW_BUFFER2), gl.COLOR_ATTACHMENT2);
    assertEqual(gl.getParameter(gl.DRAW_BUFFER3), gl.NONE);
    assertNoWebGLError(gl);
  });

  itWebGL2(`test WebGL2 createFramebufferInfo with existing attachments`, () => {
    const {gl} = createContext2();
    const spec = [
      { format: gl.RGBA },
      twgl.createTexture(gl, {width: gl.canvas.width, height: gl.canvas.height}),
      { format: gl.RGBA },
    ];
    const fbi = twgl.createFramebufferInfo(gl, spec);
    twgl.bindFramebufferInfo(gl, fbi);
    assertEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE);
    assertEqual(gl.getParameter(gl.DRAW_BUFFER0), gl.COLOR_ATTACHMENT0);
    assertEqual(gl.getParameter(gl.DRAW_BUFFER1), gl.COLOR_ATTACHMENT1);
    assertEqual(gl.getParameter(gl.DRAW_BUFFER2), gl.COLOR_ATTACHMENT2);
    assertEqual(gl.getParameter(gl.DRAW_BUFFER3), gl.NONE);
    assertNoWebGLError(gl);
  });

  itWebGL2(`test WebGL2 createFramebufferInfo with specified attachment points`, () => {
    const {gl} = createContext2();
    const spec = [
      { format: gl.RGBA },
      { format: gl.RGBA, attachmentPoint: gl.COLOR_ATTACHMENT1},
      { format: gl.RGBA },
    ];
    const fbi = twgl.createFramebufferInfo(gl, spec);
    twgl.bindFramebufferInfo(gl, fbi);
    assertEqual(gl.checkFramebufferStatus(gl.FRAMEBUFFER), gl.FRAMEBUFFER_COMPLETE);
    assertEqual(gl.getParameter(gl.DRAW_BUFFER0), gl.COLOR_ATTACHMENT0);
    assertEqual(gl.getParameter(gl.DRAW_BUFFER1), gl.COLOR_ATTACHMENT1);
    assertEqual(gl.getParameter(gl.DRAW_BUFFER2), gl.COLOR_ATTACHMENT2);
    assertEqual(gl.getParameter(gl.DRAW_BUFFER3), gl.NONE);
    assertNoWebGLError(gl);
  });

});