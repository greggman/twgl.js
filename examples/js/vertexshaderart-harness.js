"use strict";

window.addEventListener('load', function() {

 function main() {
   var canvas = document.querySelector("canvas");
   if (!canvas) {
     console.log("no canvas found, inserting full page canvas");  // eslint-disable-line
     canvas = document.createElement("canvas");
     document.body.appendChild(canvas);
     document.body.style.margin = "0";
     canvas.style.display = "block";
     canvas.style.width = "100vw";
     canvas.style.height = "100vh";
   }
   var gl = canvas.getContext("webgl");
   var glslElem = document.querySelector("#vs");
   var glsl = glslElem.text;
   var vs = `
     attribute float vertexId;
     uniform float time;
     uniform float vertexCount;
     uniform vec2 resolution;

     varying vec4 v_color;

     ${glsl}
   `;
   var fs = `
     precision mediump float;
     varying vec4 v_color;
     void main() {
       gl_FragColor = v_color;
     }
   `;
   var vertexCount = Math.min(parseInt(glslElem.dataset.vertexCount), 100000);
   var ids = new Float32Array(vertexCount);
   for (var i = 0; i < ids.length; ++i) {
     ids[i] = i;
   }
   var programInfo = twgl.createProgramInfo(gl, [vs, fs]);
   var bufferInfo = twgl.createBufferInfoFromArrays(gl, {
     vertexId: {
       numComponents: 1,
       data: ids,
     },
   });

   var uniforms = {
     time: 0,
     vertexCount: ids.length,
     resolution: [0, 0],
   };

   function render(time) {
     uniforms.time = time * 0.001;

     twgl.resizeCanvasToDisplaySize(gl.canvas);

     uniforms.resolution[0] = gl.canvas.width;
     uniforms.resolution[1] = gl.canvas.height;

     gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

     gl.enable(gl.DEPTH_TEST);
     gl.enable(gl.BLEND);
     gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

     gl.useProgram(programInfo.program);
     twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
     twgl.setUniforms(programInfo, uniforms);
     twgl.drawBufferInfo(gl, bufferInfo);

     requestAnimationFrame(render);
   }
   requestAnimationFrame(render);
 }

 (function(d, script) {
    script = d.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.onload = main;
    script.src = 'https://twgljs.org/dist/3.x/twgl.min.js';
    d.getElementsByTagName('head')[0].appendChild(script);
  }(document));
});

