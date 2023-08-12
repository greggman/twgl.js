"use strict";

(function() {
  twgl.setAttributePrefix("a_");
  const m4 = twgl.m4;
  const gl = document.getElementById("canvas").getContext('webgl', {
    alpha: false,
    premultipliedAlpha: false,
  });


  const vs = `
  attribute vec4 a_position;

  uniform mat4 u_matrix;

  void main(void) {
    gl_Position = u_matrix * a_position;
  }
  `;
  const fs = `
  precision mediump float;

  uniform vec4 u_color;

  void main(void)
  {
      gl_FragColor = u_color;
  }
  `;

  const programInfo = twgl.createProgramInfo(gl, [vs, fs]);
  const arrays = {
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
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

  const uniforms = {
    u_matrix: m4.identity(),
    u_color: [0.3, 0.5, 1, 1],
  };

  const camera = m4.identity();
  const view = m4.identity();
  const world = m4.identity();
  const projection = m4.identity();
  const viewProjection = m4.identity();
  const eye = [0, 0, -6];
  const target = [0, 0, 0];
  const up = [0.2, 0.8, 0];
  const clearColor = [0.2, 0.4, 0.8, 1];

  let requestId;
  let running;
  let then = 0;
  let time = 0;
  function startAnimation() {
    running = true;
    requestAnimation();
  }

  function stopAnimation() {
    running = false;
  }

  function requestAnimation() {
    if (!requestId) {
      requestId = requestAnimationFrame(render);
    }
  }

  const motionQuery = matchMedia('(prefers-reduced-motion)');
  function handleReduceMotionChanged() {
    if (motionQuery.matches) {
      if (!time) {
        time = 25;
        requestAnimation();
      }
      stopAnimation();
    } else {
      startAnimation();
    }
  }
  motionQuery.addEventListener('change', handleReduceMotionChanged);
  handleReduceMotionChanged();
  requestAnimation();

  const observer = new ResizeObserver(requestAnimation);
  observer.observe(gl.canvas);

  function render(now) {
    requestId = undefined;

    const elapsed = Math.min(now - then, 1000 / 10);
    then = now;
    if (running) {
      time += elapsed * 0.001;
    }

    twgl.resizeCanvasToDisplaySize(gl.canvas);

    const fadeTime = time;
    const fade = Math.min(1, fadeTime / 6);

    gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const maxFieldOfViewX = 50 * Math.PI / 180;
    let fieldOfViewY = 30 * Math.PI / 180;

    // Compute the field of view for X
    const fieldOfViewX = 2 * Math.atan(Math.tan(fieldOfViewY * 0.5) * aspect);

    // If it's too wide then use our maxFieldOfViewX to compute a fieldOfViewY
    if (fieldOfViewX > maxFieldOfViewX) {
      fieldOfViewY = 2 * Math.atan(Math.tan(maxFieldOfViewX * 0.5) * 1 / aspect);
    }

    m4.perspective(fieldOfViewY, aspect, 0.1, 20, projection);
    m4.lookAt(eye, target, up, camera);
    m4.inverse(camera, view);
    m4.multiply(projection, view, viewProjection);

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

    const num = 100;
    for (let ii = 0; ii < num; ++ii) {
      const t = time + Math.sin(ii / num) * 0.01;
      const s = 0.19;
      const x = ii % 10 - 5;
      const y = ((ii / 10) | 0) - 5;

      m4.identity(world);
      m4.rotateZ(world, time * 0.02, world);
      m4.translate(world, [x * 0.6, y * 0.5, 0], world);
      m4.rotateZ(world, t * 0.1 + x * 0.1, world);
      m4.rotateX(world, t * 0.07 + y * 0.1, world);
      m4.scale(world, [s, s, s], world);
      m4.multiply(viewProjection, world, uniforms.u_matrix);

      uniforms.u_color[3] = ii / num * fade;

      twgl.setUniforms(programInfo, uniforms);

      twgl.drawBufferInfo(gl, bufferInfo, gl.LINES);
    }

    if (running) {
      requestAnimation(render);
    }
  }
  requestAnimation(render);

}());

