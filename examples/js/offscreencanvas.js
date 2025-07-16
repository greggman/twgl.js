'use strict';

import * as twgl from '../../dist/7.x/twgl-full.module.js';

const onePointVS = `
uniform mat4 u_worldViewProjection;

attribute vec4 a_position;
attribute vec2 a_texcoord;

varying vec4 v_position;
varying vec2 v_texCoord;

void main() {
  v_texCoord = a_texcoord;
  gl_Position = u_worldViewProjection * a_position;
}
`;

const onePointFS = `
precision mediump float;

varying vec4 v_position;
varying vec2 v_texCoord;

uniform vec4 u_diffuseMult;
uniform sampler2D u_diffuse;

void main() {
  vec4 diffuseColor = texture2D(u_diffuse, v_texCoord) * u_diffuseMult;
  if (diffuseColor.a < 0.1) {
    discard;
  }
  gl_FragColor = diffuseColor;
}
`;

const envMapVS = `
uniform mat4 u_viewInverse;
uniform mat4 u_world;
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;

attribute vec4 a_position;
attribute vec3 a_normal;

varying vec3 v_normal;
varying vec3 v_surfaceToView;

void main() {
  v_normal = (u_worldInverseTranspose * vec4(a_normal, 0)).xyz;
  v_surfaceToView = (u_viewInverse[3] - (u_world * a_position)).xyz;
  gl_Position = u_worldViewProjection * a_position;
}
`;

const envMapFS = `
precision mediump float;

uniform samplerCube u_texture;

varying vec3 v_surfaceToView;
varying vec3 v_normal;

void main() {
  vec3 normal = normalize(v_normal);
  vec3 surfaceToView = normalize(v_surfaceToView);
  vec4 color = textureCube(u_texture, -reflect(surfaceToView, normal));
  gl_FragColor = color;
}
`;

function main(gl) {
  twgl.setDefaults({attribPrefix: "a_"});
  const m4 = twgl.m4;
  const onePointProgramInfo = twgl.createProgramInfo(gl, [onePointVS, onePointFS]);
  const envMapProgramInfo = twgl.createProgramInfo(gl, [envMapVS, envMapFS]);

  const shapes = [
    twgl.primitives.createCubeBufferInfo(gl, 2),
    twgl.primitives.createSphereBufferInfo(gl, 1, 24, 12),
    twgl.primitives.createPlaneBufferInfo(gl, 2, 2),
    twgl.primitives.createTruncatedConeBufferInfo(gl, 1, 0, 2, 24, 1),
  ];

  function rand(min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }
    return min + Math.random() * (max - min);
  }

  // Shared values
  const camera = m4.identity();
  const view = m4.identity();
  const viewProjection = m4.identity();

  const textures = twgl.createTextures(gl, {
    // a power of 2 image
    hftIcon: { src: "../images/hft-icon-16.png", mag: gl.NEAREST },
    // a non-power of 2 image
    clover: { src: "../images/clover.jpg" },
    // a cross origin image
    crossOrigin: {
      min: gl.NEAREST,
      mag: gl.NEAREST,
      src: "https://farm6.staticflickr.com/5795/21506301808_efb27ed699_q_d.jpg",
      crossOrigin: "", // either this or use twgl.setDefaults
    },
    // A cubemap from 6 images
    yokohama: {
      target: gl.TEXTURE_CUBE_MAP,
      src: [
        '../images/yokohama/posx.jpg',
        '../images/yokohama/negx.jpg',
        '../images/yokohama/posy.jpg',
        '../images/yokohama/negy.jpg',
        '../images/yokohama/posz.jpg',
        '../images/yokohama/negz.jpg',
      ],
    },
    // A cubemap from 1 image (can be 1x6, 2x3, 3x2, 6x1)
    goldengate: {
      target: gl.TEXTURE_CUBE_MAP,
      src: '../images/goldengate.jpg',
    },
    // A 2x2 pixel texture from a JavaScript array
    checker: {
      mag: gl.NEAREST,
      min: gl.LINEAR,
      src: [
        255, 255, 255, 255,
        192, 192, 192, 255,
        192, 192, 192, 255,
        255, 255, 255, 255,
      ],
    },
    // a 1x8 pixel texture from a typed array.
    stripe: {
      mag: gl.NEAREST,
      min: gl.LINEAR,
      format: gl.LUMINANCE,
      src: new Uint8Array([
        255,
        128,
        255,
        128,
        255,
        128,
        255,
        128,
      ]),
      width: 1,
    },
    // a cubemap from array
    cubemapFromArray: {
      target: gl.TEXTURE_CUBE_MAP,
      format: gl.RGBA,
      src: [
        0xF0, 0x80, 0x80, 0xFF,
        0x80, 0xE0, 0x80, 0xFF,
        0x80, 0x80, 0xD0, 0xFF,
        0xC0, 0x80, 0x80, 0xFF,
        0x80, 0xB0, 0x80, 0xFF,
        0x80, 0x80, 0x00, 0xFF,
      ],
    },
  });

  // This is soley to make it easy to pick textures at random
  const twoDTextures = [
    textures.checker,
    textures.stripe,
    textures.hftIcon,
    textures.clover,
    textures.crossOrigin,
  ];

  const cubeTextures = [
    textures.yokohama,
    textures.goldengate,
    textures.cubemapFromArray,
  ];

  const objects = [];
  const drawObjects = [];
  const numObjects = 100;
  for (let ii = 0; ii < numObjects; ++ii) {
    let uniforms;
    let programInfo;
    let shape;
    const renderType = rand(0, 2) | 0;
    switch (renderType) {
      case 0:  // checker
        shape = shapes[ii % shapes.length];
        programInfo = onePointProgramInfo;
        uniforms = {
          u_diffuseMult: [rand(1), rand(1), rand(1), 1],
          u_diffuse: twoDTextures[rand(0, twoDTextures.length) | 0],
          u_viewInverse: camera,
          u_world: m4.identity(),
          u_worldInverseTranspose: m4.identity(),
          u_worldViewProjection: m4.identity(),
        };
        break;
      case 1:  // yokohama
        shape = rand(0, 2) < 1 ? shapes[1] : shapes[3];
        programInfo = envMapProgramInfo;
        uniforms = {
          u_texture: cubeTextures[rand(0, cubeTextures.length) | 0],
          u_viewInverse: camera,
          u_world: m4.identity(),
          u_worldInverseTranspose: m4.identity(),
          u_worldViewProjection: m4.identity(),
        };
        break;
      default:
        throw "wAT!";
    }
    drawObjects.push({
      programInfo: programInfo,
      bufferInfo: shape,
      uniforms: uniforms,
    });
    objects.push({
      translation: [rand(-10, 10), rand(-10, 10), rand(-10, 10)],
      ySpeed: rand(0.1, 0.3),
      zSpeed: rand(0.1, 0.3),
      uniforms: uniforms,
    });
  }

  const state = {
    clientWidth: 300,
    clientHeight: 150,
  };

  // We only have one message so just replace the one message listener
  self.onmessage = function(evt) {
    Object.assign(state, evt.data);
  };

  function render(time) {
    time *= 0.001;

    const clientWidth = state.clientWidth;
    const clientHeight = state.clientHeight;

    // Make the canvas match its display size
    if (gl.canvas.width !== clientWidth || gl.canvas.height !== clientHeight) {
      gl.canvas.width = clientWidth;
      gl.canvas.height = clientHeight;
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const radius = 20;
    const orbitSpeed = time * 0.1;
    const projection = m4.perspective(30 * Math.PI / 180, clientWidth / clientHeight, 0.5, 100);
    const eye = [Math.cos(orbitSpeed) * radius, 4, Math.sin(orbitSpeed) * radius];
    const target = [0, 0, 0];
    const up = [0, 1, 0];

    m4.lookAt(eye, target, up, camera);
    m4.inverse(camera, view);
    m4.multiply(projection, view, viewProjection);

    objects.forEach(function(obj) {
      const uni = obj.uniforms;
      const world = uni.u_world;
      m4.identity(world);
      m4.rotateY(world, time * obj.ySpeed, world);
      m4.rotateZ(world, time * obj.zSpeed, world);
      m4.translate(world, obj.translation, world);
      m4.rotateX(world, time, world);
      m4.transpose(m4.inverse(world, uni.u_worldInverseTranspose), uni.u_worldInverseTranspose);
      m4.multiply(viewProjection, uni.u_world, uni.u_worldViewProjection);
    });

    twgl.drawObjectList(gl, drawObjects);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

self.onmessage = function(evt) {
  if (!self.requestAnimationFrame) {
    self.postMessage('no requestAnimationFrame in worker');
    return;
  }

  const canvas = evt.data.canvas;
  if (!canvas) {
    self.postMessage('no canvas in worker');
    return;
  }

  const gl = canvas.getContext("webgl");
  if (!gl) {
    self.postMessage('no webgl in worker');
    return;
  }
  main(gl);
};

