TWGL: A Tiny WebGL helper Library<div id="pronouce" style="font-size: xx-small;">[rhymes with wiggle]</div>
=====================================================

[![Build Status](https://travis-ci.org/greggman/twgl.js.svg?branch=master)](https://travis-ci.org/greggman/twgl.js)

This library's sole purpose is to make using the WebGL API less verbose.

## Note: Minor API Changes in 2.x

[See Changelist](https://github.com/greggman/twgl.js/blob/master/CHANGELIST.md)

## TL;DR

If you want to get stuff done use [three.js](http://threejs.org). If you want
to do stuff low-level with WebGL consider using [TWGL](http://github.com/greggman/twgl.js/).

## The tiniest example

Not including the shaders (which is a simple quad shader) here's the entire code

```html
<canvas id="c"></canvas>
<script src="../dist/4.x/twgl-full.min.js"></script>
<script>
  const gl = document.getElementById("c").getContext("webgl");
  const programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);

  const arrays = {
    position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
  };
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

  function render(time) {
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    const uniforms = {
      time: time * 0.001,
      resolution: [gl.canvas.width, gl.canvas.height],
    };

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
</script>
```

[And here it is live](http://twgljs.org/examples/tiny.html).

## Why? What? How?

WebGL is a very verbose API. Setting up shaders, buffers, attributes and uniforms
takes a lot of code. A simple lit cube in WebGL might easily take over 60 calls into WebGL.

At its core there's really only a few main functions

*   `twgl.createProgramInfo` compiles a shader and creates setters for attribs and uniforms
*   `twgl.createBufferInfoFromArrays` creates buffers and attribute settings
*   `twgl.setBuffersAndAttributes` binds buffers and sets attributes
*   `twgl.setUniforms` sets the uniforms
*   `twgl.createTextures` creates textures of various sorts
*   `twgl.createFramebufferInfo` creates a framebuffer and attachments.

There's a few extra helpers and lower-level functions if you need them but those 6 functions are the core of TWGL.

Compare the TWGL vs WebGL code for a point lit cube.

### Compiling a Shader and looking up locations

TWGL

```javascript
const programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);
```

WebGL

```javascript
// Note: I'm conceding that you'll likely already have the 30 lines of
// code for compiling GLSL
const program = twgl.createProgramFromScripts(gl, ["vs", "fs"]);

const u_lightWorldPosLoc = gl.getUniformLocation(program, "u_lightWorldPos");
const u_lightColorLoc = gl.getUniformLocation(program, "u_lightColor");
const u_ambientLoc = gl.getUniformLocation(program, "u_ambient");
const u_specularLoc = gl.getUniformLocation(program, "u_specular");
const u_shininessLoc = gl.getUniformLocation(program, "u_shininess");
const u_specularFactorLoc = gl.getUniformLocation(program, "u_specularFactor");
const u_diffuseLoc = gl.getUniformLocation(program, "u_diffuse");
const u_worldLoc = gl.getUniformLocation(program, "u_world");
const u_worldInverseTransposeLoc = gl.getUniformLocation(program, "u_worldInverseTranspose");
const u_worldViewProjectionLoc = gl.getUniformLocation(program, "u_worldViewProjection");
const u_viewInverseLoc = gl.getUniformLocation(program, "u_viewInverse");

const positionLoc = gl.getAttribLocation(program, "a_position");
const normalLoc = gl.getAttribLocation(program, "a_normal");
const texcoordLoc = gl.getAttribLocation(program, "a_texcoord");
```

### Creating Buffers for a Cube

TWGL

```javascript
const arrays = {
  position: [1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,1,1,-1,1,-1,-1,-1,-1,-1,-1,1,-1,1,1,1,1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,1,1,-1,1,1,-1,-1,1,1,-1,1,-1,1,-1,1,1,-1,1,-1,-1,-1,-1,-1],
  normal:   [1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1],
  texcoord: [1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1],
  indices:  [0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23],
};
const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
```

WebGL
```javascript
const positions = [1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,1,1,-1,1,-1,-1,-1,-1,-1,-1,1,-1,1,1,1,1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,1,1,-1,1,1,-1,-1,1,1,-1,1,-1,1,-1,1,1,-1,1,-1,-1,-1,-1,-1];
const normals   = [1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1];
const texcoords = [1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1];
const indices   = [0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23];

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
const normalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
const texcoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
const indicesBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
```

### Setting Attributes and Indices for a Cube

TWGL

```javascript
twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
```

WebGL

```javascript
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionLoc);
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(normalLoc);
gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
gl.vertexAttribPointer(texcoordLoc, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(texcoordLoc);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
```

### Setting Uniforms for a Lit Cube

TWGL

```javascript
// At Init time
const uniforms = {
  u_lightWorldPos: [1, 8, -10],
  u_lightColor: [1, 0.8, 0.8, 1],
  u_ambient: [0, 0, 0, 1],
  u_specular: [1, 1, 1, 1],
  u_shininess: 50,
  u_specularFactor: 1,
  u_diffuse: tex,
};

// At render time
uniforms.u_viewInverse = camera;
uniforms.u_world = world;
uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(world));
uniforms.u_worldViewProjection = m4.multiply(viewProjection, world);

twgl.setUniforms(programInfo, uniforms);
```

WebGL

```javascript
// At Init time
const u_lightWorldPos = [1, 8, -10];
const u_lightColor = [1, 0.8, 0.8, 1];
const u_ambient = [0, 0, 0, 1];
const u_specular = [1, 1, 1, 1];
const u_shininess = 50;
const u_specularFactor = 1;
const u_diffuse = 0;

// At render time
gl.uniform3fv(u_lightWorldPosLoc, u_lightWorldPos);
gl.uniform4fv(u_lightColorLoc, u_lightColor);
gl.uniform4fv(u_ambientLoc, u_ambient);
gl.uniform4fv(u_specularLoc, u_specular);
gl.uniform1f(u_shininessLoc, u_shininess);
gl.uniform1f(u_specularFactorLoc, u_specularFactor);
gl.uniform1i(u_diffuseLoc, u_diffuse);
gl.uniformMatrix4fv(u_viewInverseLoc, false, camera);
gl.uniformMatrix4fv(u_worldLoc, false, world);
gl.uniformMatrix4fv(u_worldInverseTransposeLoc, false, m4.transpose(m4.inverse(world)));
gl.uniformMatrix4fv(u_worldViewProjectionLoc, false, m4.multiply(viewProjection, world));
```

### Loading / Setting up textures

TWGL

```javascript
const textures = twgl.createTextures(gl, {
  // a power of 2 image
  hftIcon: { src: "images/hft-icon-16.png", mag: gl.NEAREST },
  // a non-power of 2 image
  clover: { src: "images/clover.jpg" },
  // From a canvas
  fromCanvas: { src: ctx.canvas },
  // A cubemap from 6 images
  yokohama: {
    target: gl.TEXTURE_CUBE_MAP,
    src: [
      'images/yokohama/posx.jpg',
      'images/yokohama/negx.jpg',
      'images/yokohama/posy.jpg',
      'images/yokohama/negy.jpg',
      'images/yokohama/posz.jpg',
      'images/yokohama/negz.jpg',
    ],
  },
  // A cubemap from 1 image (can be 1x6, 2x3, 3x2, 6x1)
  goldengate: {
    target: gl.TEXTURE_CUBE_MAP,
    src: 'images/goldengate.jpg',
  },
  // A 2x2 pixel texture from a JavaScript array
  checker: {
    mag: gl.NEAREST,
    min: gl.LINEAR,
    src: [
      255,255,255,255,
      192,192,192,255,
      192,192,192,255,
      255,255,255,255,
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
});
```

WebGL

```javascript
// Let's assume I already loaded all the images

// a power of 2 image
const hftIconTex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, tex);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, hftIconImg);
gl.generateMipmaps(gl.TEXTURE_2D);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
// a non-power of 2 image
const cloverTex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, tex);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, hftIconImg);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
// From a canvas
const cloverTex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, tex);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ctx.canvas);
gl.generateMipmaps(gl.TEXTURE_2D);
// A cubemap from 6 images
const yokohamaTex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, posXImg);
gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, negXImg);
gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, posYImg);
gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, negYImg);
gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, posZImg);
gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, negZImg);
gl.generateMipmaps(gl.TEXTURE_CUBE_MAP);
// A cubemap from 1 image (can be 1x6, 2x3, 3x2, 6x1)
const goldengateTex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
const size = goldengate.width / 3;  // assume it's a 3x2 texture
const slices = [0, 0, 1, 0, 2, 0, 0, 1, 1, 1, 2, 1];
const tempCtx = document.createElement("canvas").getContext("2d");
tempCtx.canvas.width = size;
tempCtx.canvas.height = size;
for (let ii = 0; ii < 6; ++ii) {
  const xOffset = slices[ii * 2 + 0] * size;
  const yOffset = slices[ii * 2 + 1] * size;
  tempCtx.drawImage(element, xOffset, yOffset, size, size, 0, 0, size, size);
  gl.texImage2D(faces[ii], 0, format, format, type, tempCtx.canvas);
}
gl.generateMipmaps(gl.TEXTURE_CUBE_MAP);
// A 2x2 pixel texture from a JavaScript array
const checkerTex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, tex);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([
    255,255,255,255,
    192,192,192,255,
    192,192,192,255,
    255,255,255,255,
  ]));
gl.generateMipmaps(gl.TEXTURE_2D);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
// a 1x8 pixel texture from a typed array.
const stripeTex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, tex);
gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, gl.LUMINANCE, gl.UNSIGNED_BYTE, new Uint8Array([
    255,
    128,
    255,
    128,
    255,
    128,
    255,
    128,
  ]));
gl.generateMipmaps(gl.TEXTURE_2D);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
```

### Creating Framebuffers and attachments

TWGL

```javascript
const attachments = [
  { format: RGBA, type: UNSIGNED_BYTE, min: LINEAR, wrap: CLAMP_TO_EDGE },
  { format: DEPTH_STENCIL, },
];
const fbi = twgl.createFramebufferInfo(gl, attachments);
```

WebGL

```javascript
const fb = gl.createFramebuffer(gl.FRAMEBUFFER);
gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
const tex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, tex);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.drawingBufferWidth, gl.drawingBufferHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
const rb = gl.createRenderbuffer();
gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, gl.drawingBufferWidth, gl.drawingBufferHeight);
gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, rb);
```

### Compare

[TWGL example](http://twgljs.org/examples/twgl-cube.html) vs [WebGL example](http://twgljs.org/examples/webgl-cube.html)

## Examples

*   [tiny](http://twgljs.org/examples/tiny.html)
*   [twgl cube](http://twgljs.org/examples/twgl-cube.html)
*   [textures](http://twgljs.org/examples/textures.html)
*   [primitives](http://twgljs.org/examples/primitives.html)
*   [2d-lines](http://twgljs.org/examples/2d-lines.html)
*   [dynamic-buffers](http://twgljs.org/examples/dynamic-buffers.html)
*   [zoom-around](http://twgljs.org/examples/zoom-around.html)
*   [text](http://twgljs.org/examples/text.html)
*   [kaleidoscope](http://twgljs.org/examples/kaleidoscope.html)
*   [tunnel](http://twgljs.org/examples/tunnel.html)
*   [item list](http://twgljs.org/examples/itemlist.html)
*   [no box skybox](http://twgljs.org/examples/no-box-skybox.html)
*   [cross origin](http://twgljs.org/examples/crossorigin.html)
*   [vertex array objects](http://twgljs.org/examples/vertex-array-objects.html)
*   [instancing](http://twgljs.org/examples/instancing.html)

### WebGL 2 Examples

*   [uniform buffer objects](http://twgljs.org/examples/uniform-buffer-objects.html)
*   [3d textures tone mapping](http://twgljs.org/examples/3d-textures-tone-mapping.html)
*   [samplers](http://twgljs.org/examples/samplers.html)
*   [webgl2 textures](http://twgljs.org/examples/webgl2-textures.html)
*   [3d texture volume](http://twgljs.org/examples/3d-texture-volume.html)
*   [3d texture volume no buffers](http://twgljs.org/examples/3d-texture-volume-no-buffers.html)
*   [2d array texture](http://twgljs.org/examples/2d-array-texture.html)
*   [transform feedback](http://twgljs.org/examples/transform-feedback.html)

### OffscreenCanvas Example

*   [OffscreenCanvas](http://twgljs.org/examples/offscreencanvas.html)

## ES6 module support

*   [modules](http://twgljs.org/examples/modules.html)

## AMD support

*   [amd](http://twgljs.org/examples/amd-compiled.html)

## CommonJS / Browserify support

*   [browserify](http://twgljs.org/examples/browserify.html)

## Other Features

*   Includes some optional 3d math functions (full version)

    You are welcome to use any math library as long as it stores matrices as flat Float32Array
    or JavaScript arrays.

*   Includes some optional primitive generators (full version)

    planes, cubes, spheres, ... Just to help get started

## Usage

See the examples. Otherwise there's a few different versions

*   `twgl-full.min.js` the minified full version
*   `twgl-full.js` the concatinated full version
*   `twgl.min.js` the minimum version (no 3d math, no primitives)
*   `twgl.js` the concatinated minimum version (no 3d math, no primitives)

## API Docs

[API Docs are here](http://twgljs.org/docs/).

## Download

*   from github

    [http://github.com/greggman/twgl.js](http://github.com/greggman/twgl.js)

*   from bower

    ```bash
    bower install twgl.js
    ```

*   from npm

    ```bash
    npm install twgl.js
    ```

    or

    ```bash
    npm install twgl-base.js
    ```

*   from git

    ```bash
    git clone https://github.com/greggman/twgl.js.git
    ```

## Rationale and other chit-chat

TWGL's is an attempt to make WebGL simpler by providing a few tiny helper functions
that make it much less verbose and remove the tedium. TWGL is **NOT** trying to help
with the complexity of managing shaders and writing GLSL. Nor is it a 3D library like
[three.js](http://threejs.org). It's just trying to make WebGL less verbose.

TWGL can be considered a spiritual successor to [TDL](http://github.com/greggman/tdl). Where
as TDL created several *classes* that wrapped WebGL, TWGL tries not to wrap anything. In fact
you can manually create nearly all TWGL data structures.

For example the function `setAttributes` takes an object of attributes.
In WebGL you might write code like this

```javascript
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionLoc);
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(normalLoc);
gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
gl.vertexAttribPointer(texcoordLoc, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(texcoordLoc);
gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
gl.vertexAttribPointer(colorLoc, 4, gl.UNSIGNED_BYTE, true, 0, 0);
gl.enableVertexAttribArray(colorLoc);
```

`setAttributes` is just the simplest code to do that for you.

```javascript
// make attributes for TWGL manually
const attribs = {
  a_position: { buffer: positionBuffer, size: 3, },
  a_normal:   { buffer: normalBuffer,   size: 3, },
  a_texcoord: { buffer: texcoordBuffer, size: 2, },
  a_color:    { buffer: colorBuffer,    size: 4, type: gl.UNSIGNED_BYTE, normalize: true, },
};
twgl.setAttributes(attribSetters, attribs);
```

The point of the example above is TWGL is a **thin** wrapper. All it's doing is trying
to make common WebGL operations easier and less verbose. Feel free to mix it with raw WebGL.

## Want to learn WebGL?

Try [webglfundamentals.org](http://webglfundamentals.org)



