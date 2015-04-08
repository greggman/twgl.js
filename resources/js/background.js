"use strict";

(function() {
  twgl.setAttributePrefix("a_");
  var m4 = twgl.m4;
  var gl = twgl.getWebGLContext(document.createElement("canvas"), {
    alpha: false,
    premultipliedAlpha: false,
  });
  document.getElementById("canvas").appendChild(gl.canvas);

  var programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);
  var arrays = {
    position: [
      -1, -1, -1,
       1, -1, -1,
      -1,  1, -1,
       1,  1, -1,
      -1, -1,  1,
       1, -1,  1,
      -1,  1,  1,
       1,  1,  1,
    ],
    indices: {
      numComponents: 2,
      data: [
        0, 1, 1, 3, 3, 2, 2, 0,
        4, 5, 5, 7, 7, 6, 6, 4,
        0, 4, 1, 5, 2, 6, 3, 7,
      ],
    },
  };
  var bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

  var uniforms = {
    u_matrix: m4.identity(),
    u_color: [0.3, 0.5, 1, 1],
  };

  var camera = m4.identity();
  var view = m4.identity();
  var world = m4.identity();
  var projection = m4.identity();
  var viewProjection = m4.identity();
  var eye = [0, 0, -6];
  var target = [0, 0, 0];
  var up = [0.2, 0.8, 0];
  var clearColor = [0.2, 0.4, 0.8, 1];

  function render(time) {
    time *= 0.001;
    twgl.resizeCanvasToDisplaySize(gl.canvas);

    var fadeTime = time;
    var fade = Math.min(1, fadeTime / 6);

    gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var maxFieldOfViewX = 50 * Math.PI / 180;
    var fieldOfViewY = 30 * Math.PI / 180;

    // Compute the field of view for X
    var fieldOfViewX = 2 * Math.atan(Math.tan(fieldOfViewY * 0.5) * aspect);

    // If it's too wide then use our maxFieldOfViewX to compute a fieldOfViewY
    if (fieldOfViewX > maxFieldOfViewX) {
      fieldOfViewY = 2 * Math.atan(Math.tan(maxFieldOfViewX * 0.5) * 1 / aspect);
    }

    m4.perspective(fieldOfViewY, aspect, 0.1, 20, projection);
    m4.lookAt(eye, target, up, camera);
    m4.inverse(camera, view);
    m4.multiply(view, projection, viewProjection);

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

    var num = 100;
    for (var ii = 0; ii < num; ++ii) {
      var t = time + Math.sin(ii / num) * 0.01;
      var s = 0.19;
      var x = ii % 10 - 5;
      var y = ((ii / 10) | 0) - 5;

      m4.identity(world);
      m4.rotateZ(world, time * 0.02, world);
      m4.translate(world, [x * 0.6, y * 0.5, 0], world);
      m4.rotateZ(world, t * 0.1 + x * 0.1, world);
      m4.rotateX(world, t * 0.07 + y * 0.1, world);
      m4.scale(world, [s, s, s], world);
      m4.multiply(world, viewProjection, uniforms.u_matrix);

      uniforms.u_color[3] = ii / num * fade;

      twgl.setUniforms(programInfo, uniforms);

      twgl.drawBufferInfo(gl, gl.LINES, bufferInfo);
    }

    requestAnimationFrame(render);
  }
  render();

}());

