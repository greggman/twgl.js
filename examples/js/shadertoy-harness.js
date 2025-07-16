"use strict";

window.addEventListener('load', function() {

 function main() {
   let canvas = document.querySelector("canvas");
   if (!canvas) {
     console.log("no canvas found, inserting full page canvas");  // eslint-disable-line
     canvas = document.createElement("canvas");
     document.body.appendChild(canvas);
     document.body.style.margin = "0";
     canvas.style.display = "block";
     canvas.style.width = "100vw";
     canvas.style.height = "100vh";
   }
   const gl = canvas.getContext("webgl");
   gl.getExtension("OES_standard_derivatives");
   const glslElem = document.querySelector("#fs");
   const glsl = glslElem.text;
   const vs = `
     attribute vec4 position;
     void main() {
       gl_Position = position;
     }
   `;
   const fs = `
     #extension GL_OES_standard_derivatives : enable
     precision mediump float;
     uniform vec3       iResolution;           // The viewport resolution (z is pixel aspect ratio, usually 1.0)
     uniform float      iGlobalTime;           // Current time in seconds
     uniform float      iTimeDelta;            // Time it takes to render a frame, in seconds
     uniform int        iFrame;                // Current frame
     uniform float      iFrameRate;            // Number of frames rendered per second
     uniform float      iChannelTime[4];       // Time for channel (if video or sound), in seconds
     uniform vec3       iChannelResolution[4]; // Input texture resolution for each channel
     uniform vec4       iMouse;                // xy = current pixel coords (if LMB is down). zw = click pixel
     uniform vec4       iDate;                 // Year, month, day, time in seconds in .xyzw
     uniform float      iSampleRate;           // The sound sample rate (typically 44100)
     struct Channel
     {
       vec3  resolution;
       float time;
     };
     uniform Channel iChannel[4];
     uniform sampler2D iChannel0;
     uniform sampler2D iChannel1;
     uniform sampler2D iChannel2;
     uniform sampler2D iChannel3;
     vec4 texture2DGrad(sampler2D s, in vec2 uv, vec2 gx, vec2 gy) {
       return texture2D(s, uv);
     }

     vec4 texture2DLod(sampler2D s, in vec2 uv, in float lod) {
       return texture2D(s, uv);
     }

     void mainImage(out vec4 c, in vec2 f);

     ${glsl}

     void main(){
       vec4 color = vec4(0, 0, 0, 1);

       mainImage(color, gl_FragCoord.xy);

       gl_FragColor = color;
       gl_FragColor.a = 1.0;
     }
   `;
   const ids = new Float32Array(10030);
   for (let i = 0; i < ids.length; ++i) {
     ids[i] = i;
   }
   const programInfo = twgl.createProgramInfo(gl, [vs, fs]);
   const bufferInfo = twgl.createBufferInfoFromArrays(gl, {
     position: {
       numComponents: 2,
       data: [
         -1, -1,
          1, -1,
         -1,  1,
         -1,  1,
          1, -1,
          1,  1,
       ],
     },
   });

   const uniforms = {
     iGlobalTime: 0,
     iTimeDelta: 0,
     iFrame: 0,
     iFrameRate: 0,
     iResolution: [0, 0, 1],
     iMouse: [0, 0, 0, 0],
     iDate: [0, 0, 0, 0],
   };

   gl.canvas.addEventListener('mousemove', function(event) {
     uniforms.iMouse[0] = event.clientX;
     uniforms.iMouse[1] = event.clientY;
   });

   gl.canvas.addEventListener('mousedown', function(event) {
     uniforms.iMouse[2] = event.clientX;
     uniforms.iMouse[3] = event.clientY;
   });

   let then = 0;
   function render(now) {
     uniforms.iGlobalTime = now * 0.001;
     uniforms.iTimeDelta = then - now;
     uniforms.iFrameRate = uniforms.iTimeDelta / (1 / 60);
     ++uniforms.iFrame;
     then = now;

     const d = new Date();
     uniforms.iDate[0] = d.getFullYear();
     uniforms.iDate[1] = d.getMonth();
     uniforms.iDate[2] = d.getDay();
     uniforms.iDate[3] = d.getSeconds() + d.getMinutes() * 60 + d.getHours() * 60 * 60;

     twgl.resizeCanvasToDisplaySize(gl.canvas);

     uniforms.iResolution[0] = gl.canvas.width;
     uniforms.iResolution[1] = gl.canvas.height;

     gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

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
    script.src = 'https://twgljs.org/dist/7.x/twgl.min.js';
    d.getElementsByTagName('head')[0].appendChild(script);
  }(document));
});

