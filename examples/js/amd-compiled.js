"use strict";

/* global require */

require([
    '../../dist/7.x/twgl-full.min',
    '../../3rdparty/chroma.min',
  ], function(
    twgl,
    chroma) {
  const m4 = twgl.m4;
  const primitives = twgl.primitives;

  twgl.setDefaults({attribPrefix: "a_"});
  const gl = document.querySelector("#c").getContext("webgl");
  const programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);

  const shapes = [
    primitives.createCubeBufferInfo(gl, 2),
    primitives.createSphereBufferInfo(gl, 1, 24, 12),
    primitives.createPlaneBufferInfo(gl, 2, 2),
    primitives.createTruncatedConeBufferInfo(gl, 1, 0, 2, 24, 1),
  ];

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  // Shared values
  const lightWorldPosition = [1, 8, -10];
  const lightColor = [1, 1, 1, 1];
  const camera = m4.identity();
  const view = m4.identity();
  const viewProjection = m4.identity();

  const tex = twgl.createTexture(gl, {
    min: gl.NEAREST,
    mag: gl.NEAREST,
    src: [
      255, 255, 255, 255,
      192, 192, 192, 255,
      192, 192, 192, 255,
      255, 255, 255, 255,
    ],
  });

  const objects = [];
  const drawObjects = [];
  const numObjects = 100;
  const baseHue = rand(0, 360);
  for (let ii = 0; ii < numObjects; ++ii) {
    const uniforms = {
      u_lightWorldPos: lightWorldPosition,
      u_lightColor: lightColor,
      u_diffuseMult: chroma.hsv((baseHue + rand(0, 60)) % 360, 0.4, 0.8).gl(),
      u_specular: [1, 1, 1, 1],
      u_shininess: 50,
      u_specularFactor: 1,
      u_diffuse: tex,
      u_viewInverse: camera,
      u_world: m4.identity(),
      u_worldInverseTranspose: m4.identity(),
      u_worldViewProjection: m4.identity(),
    };
    drawObjects.push({
      programInfo: programInfo,
      bufferInfo: shapes[ii % shapes.length],
      uniforms: uniforms,
    });
    objects.push({
      translation: [rand(-10, 10), rand(-10, 10), rand(-10, 10)],
      ySpeed: rand(0.1, 0.3),
      zSpeed: rand(0.1, 0.3),
      uniforms: uniforms,
    });
  }

  function render(time) {
    time *= 0.001;
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const projection = m4.perspective(30 * Math.PI / 180, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.5, 100);
    const eye = [1, 4, -20];
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
});


