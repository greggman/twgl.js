<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf8">
    <!--

    @license twgl.js Copyright (c) 2015, Gregg Tavares All Rights Reserved.
    Available via the MIT license.
    see: http://github.com/greggman/twgl.js for details

    -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
    <meta property="og:title" content="TWGL.js - 2d-array texture" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="http://twgljs.org/examples/screenshots/2d-array-texture.png" />
    <meta property="og:description" content="TWGL.js - 2d-array texture" />
    <meta property="og:url" content="http://twgljs.org" />

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@greggman">
    <meta name="twitter:creator" content="@greggman">
    <meta name="twitter:domain" content="twgljs.org">
    <meta name="twitter:title" content="TWGL.js - 2d-array texture">
    <meta name="twitter:url" content="http://twgljs.org/examples/2d-array texture.html">
    <meta name="twitter:description" content="TWGL.js - 2d-array texture">
    <meta name="twitter:image:src" content="http://twgljs.org/examples/screenshots/2d-array-texture.png">

    <link href="/resources/images/twgljs-icon.png" rel="shortcut icon" type="image/png">

    <title>twgl.js - twgl cube</title>
    <style>
      body {
          margin: 0;
          font-family: monospace;
      }
      canvas {
          display: block;
          width: 100vw;
          height: 100vh;
      }
      #b {
        position: absolute;
        top: 10px;
        width: 100%;
        text-align: center;
        z-index: 2;
      }
    </style>
  </head>
  <body>
    <canvas id="c"></canvas>
    <div id="b"><a href="http://twgljs.org">twgl.js</a> - 2d-array texture</div>
  </body>
  <script id="vs" type="notjs">
#version 300 es
uniform mat4 u_worldViewProjection;

in vec4 a_position;
in vec2 a_texcoord;
in uint a_faceId;

out vec4 v_position;
out vec2 v_texCoord;
flat out uint v_faceId;

void main() {
  v_faceId = a_faceId;
  v_texCoord = a_texcoord;
  gl_Position = u_worldViewProjection * a_position;
}
  </script>
  <script id="fs" type="notjs">
#version 300 es
precision mediump float;

in vec4 v_position;
in vec2 v_texCoord;
flat in uint v_faceId;

uniform mediump sampler2DArray u_diffuse;
uniform uint u_faceIndex[6];

out vec4 outColor;

void main() {
  outColor = texture(u_diffuse, vec3(v_texCoord, u_faceIndex[v_faceId]));
}
  </script>
  <script type="module">
  import * as twgl from '../dist/4.x/twgl-full.module.js';

  function main() {
    twgl.setDefaults({attribPrefix: "a_"});
    const m4 = twgl.m4;
    const gl = document.getElementById("c").getContext("webgl2");
    if (!gl) {
      alert("Sorry, this example requires WebGL 2.0");  // eslint-disable-line
      return;
    }
    const programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);

    const arrays = {
      position: [1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1],
      normal:   [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1],
      texcoord: [1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
      faceId:   { numComponents: 1, data: new Uint8Array([0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6]), },
      indices:  [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23],
    };
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

    const slices = [
      "images/array/balloons.jpg",
      "images/array/biggrub.jpg",
      "images/array/curtain.jpg",
      "images/array/hamburger.jpg",
      "images/array/mascot.jpg",
      "images/array/meat.jpg",
      "images/array/orange-fruit.jpg",
      "images/array/scomp.jpg",
      "images/array/tif.jpg",
      "images/array/手拭.jpg",
      "images/array/竹輪.jpg",
      "images/array/肉寿司.jpg",
    ];

    const tex = twgl.createTexture(gl, {
      target: gl.TEXTURE_2D_ARRAY,
      src: slices,
    });

    function randInt(min, max) {
      if (max === undefined) {
        max = min;
        min = 0;
      }
      return Math.random() * (max - min) + min | 0;
    }

    const uniforms = {
      u_diffuse: tex,
      u_faceIndex: [0, 1, 2, 3, 4, 5],
    };

    let oldTime = 0;
    function render(time) {
      time *= 0.001;
      twgl.resizeCanvasToDisplaySize(gl.canvas);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      if ((oldTime | 0) < (time | 0)) {
        uniforms.u_faceIndex[randInt(6)] = randInt(slices.length);
      }
      oldTime = time;


      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      const projection = m4.perspective(30 * Math.PI / 180, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.5, 10);
      const eye = [1, 4, -6];
      const target = [0, 0, 0];
      const up = [0, 1, 0];

      const camera = m4.lookAt(eye, target, up);
      const view = m4.inverse(camera);
      const viewProjection = m4.multiply(projection, view);
      const world = m4.rotationY(time);

      uniforms.u_worldViewProjection = m4.multiply(viewProjection, world);

      gl.useProgram(programInfo.program);
      twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
      twgl.setUniforms(programInfo, uniforms);
      twgl.drawBufferInfo(gl, bufferInfo);

      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }
  main();
  </script>
</html>


