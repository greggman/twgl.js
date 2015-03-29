TWGL: A Tiny WebGL helper Library<div id="pronouce">[rhymes with wiggle]</div>
=====================================================

This library's sole purpose is to make using the WebGL API less verbose.

## TL;DR

If you want to get shit done use [three.js](http://threejs.org). If you want
to do stuff low-level with WebGL consider using [TWGL](http://github.com/greggman/twgl.js/).

## Why? What? How?

WebGL is a very verbose API. Setting up shaders, buffers, attributes and uniforms
takes a lot of code. A simple lit cube in WebGL might easily take over 60 calls into WebGL.

Compare the code for a point lit cube.

### Compiling a Shader and looking up locations

TWGL

    var programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);

WebGL

    // Note: I'm conceding that you'll likely already have the 30 lines of
    // code for compiling GLSL
    var program = twgl.createProgramFromScripts(gl, ["vs", "fs"]);

    var u_lightWorldPosLoc = gl.getUniformLocation(program, "u_lightWorldPos");
    var u_lightColorLoc = gl.getUniformLocation(program, "u_lightColor");
    var u_ambientLoc = gl.getUniformLocation(program, "u_ambient");
    var u_specularLoc = gl.getUniformLocation(program, "u_specular");
    var u_shininessLoc = gl.getUniformLocation(program, "u_shininess");
    var u_specularFactorLoc = gl.getUniformLocation(program, "u_specularFactor");
    var u_diffuseLoc = gl.getUniformLocation(program, "u_diffuse");
    var u_worldLoc = gl.getUniformLocation(program, "u_world");
    var u_worldInverseTransposeLoc = gl.getUniformLocation(program, "u_worldInverseTranspose");
    var u_worldViewProjectionLoc = gl.getUniformLocation(program, "u_worldViewProjection");
    var u_viewInverseLoc = gl.getUniformLocation(program, "u_viewInverse");

    var positionLoc = gl.getAttribLocation(program, "a_position");
    var normalLoc = gl.getAttribLocation(program, "a_normal");
    var texcoordLoc = gl.getAttribLocation(program, "a_texcoord");

### Creating Buffers for a Cube

TWGL

    var arrays = {
      position: [1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,1,1,-1,1,-1,-1,-1,-1,-1,-1,1,-1,1,1,1,1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,1,1,-1,1,1,-1,-1,1,1,-1,1,-1,1,-1,1,1,-1,1,-1,-1,-1,-1,-1],
      normal:   [1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1],
      texcoord: [1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1],
      indices:  [0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23],
    };
    var bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

WebGL

    var positions = [1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,1,1,-1,1,-1,-1,-1,-1,-1,-1,1,-1,1,1,1,1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,1,1,-1,1,1,-1,-1,1,1,-1,1,-1,1,-1,1,1,-1,1,-1,-1,-1,-1,-1];
    var normals   = [1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1];
    var texcoords = [1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1];
    var indices   = [0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23];

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    var texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
    var indicesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

### Setting Attributes and Indices for a Cube

TWGL

    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

WebGL

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


### Setting Uniforms for a Lit Cube

TWGL

    // At Init time
    var uniforms = {
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
    uniforms.u_worldViewProjection = m4.multiply(world, viewProjection);

    twgl.setUniforms(programInfo, uniforms);


WebGL

    // At Init time
    var u_lightWorldPos = [1, 8, -10];
    var u_lightColor = [1, 0.8, 0.8, 1];
    var u_ambient = [0, 0, 0, 1];
    var u_specular = [1, 1, 1, 1];
    var u_shininess = 50;
    var u_specularFactor = 1;
    var u_diffuse = 0;

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
    gl.uniformMatrix4fv(u_worldViewProjectionLoc, false, m4.multiply(world, viewProjection));

### Compare

[TWGL example](http://twgljs.org/examples/twgl-cube.html) vs [WebGL example](http://twgljs.org/examples/webgl-cube.html)

## Other Features

*   Includes some optional 3d math functions (full version)

    You are welcome to use any math library as long as it stores matrices as flat Float32Array
    or JavaScript arrays.

*   Includes some optional primitive generators (full version)

    planes, cubes, spheres, ... Just to help get started

## Docs

[Docs are here](http://twgljs.org/docs/).

## Rational and other chit-chat

TWGL's is an attempt to make WebGL simpler by providing a few tiny helper functions
that make it much less verbose and remove the tedium. TWGL is **NOT** trying to help
with the complexity of managing shaders and writing GLSL. Nor is it a 3D library like
[three.js](http://threejs.org).

TWGL can be considered a spiritual successor to [TDL](http://github.com/greggman/tdl). Where
as TDL created several *classes* that wrapped WebGL, TWGL tries not to wrap anything. In fact
you can manually create nearly all TWGL data structures.

For example the function `setAttributes` takes an object of attributes.
In WebGL you might write code like this

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.vertexAttribPointer(texcoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texcoordLoc);

`setAttributes` is just the simplest code to do that for you.

    // make attributes for TWGL manually
    var attribs = {
      a_position: { buffer: positionBuffer, size: 3 },
      a_normal:   { buffer: normalBuffer, size: 3 },
      a_texcoord: { buffer: texcoord: size: 2, },
    };
    setAttributes(attribSetters, attribs);

The point of the example above is TWGL is a **thin** wrapper. All it's doing is trying
to make common WebGL operations easier and less verbose.

## Future

*   What needs to change for WebGL 2.0?
*   Consider adding texture related stuff
    *   loading a list of textures from URLs
    *   setting filtering for NPOT
*   Consider adding framebuffer related stuff


